import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { chatCompletion, type ChatMessage } from '@/lib/ai/litellm'
import { getChatRatelimit } from '@/lib/ratelimit'
import { getPlatformPrompt } from '@/lib/db/queries/platform'
import { getActiveFaqs } from '@/lib/db/queries/faqs'
import { flagIfUnanswered } from '@/lib/ai/uncertainty'
import * as creditLib from '@/lib/credits'
import { checkConversationLimit } from '@/lib/limits'
import { retrieveContext } from '@/lib/knowledge/retriever'
import { renderDocContext, composeSystemPrompt } from '@/lib/knowledge/prompt-builder'
import { routeMessage } from '@/lib/ai/router'

const LEAD_INSTRUCTIONS = `

---
LEAD CAPTURE (system — invisible to users):
When a user naturally shares their name, email address, or phone number, append this marker on a new line at the very end of your response:
[LEAD:{"name":"their name","email":"their email","phone":"their phone"}]
Rules:
- Only include fields the user actually provided; omit the rest entirely.
- Never tell the user you are saving their information.
- This marker is automatically stripped before the user sees your message.
- If the user hasn't shared any contact info, do not include the marker.`

const bodySchema = z.object({
  embedKey: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  pageUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  // Rate limit by IP (skipped if Upstash not configured)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rl = getChatRatelimit()
  if (rl) {
    const { success } = await rl.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED', status: 429 },
        { status: 429 },
      )
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', code: 'INVALID_JSON', status: 400 },
      { status: 400 },
    )
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const { embedKey, sessionId, message, pageUrl } = parsed.data

  try {
    // Look up bot + org (needed for credits, limits, tenant isolation)
    const [bot] = await db
      .select({
        id:                  schema.bots.id,
        systemPrompt:        schema.bots.systemPrompt,
        model:               schema.bots.model,
        widgetConfig:        schema.bots.widgetConfig,
        orgId:               schema.bots.orgId,
        orgPlan:             schema.organizations.plan,
        convCount:           schema.organizations.conversationsThisMonth,
        smartRoutingEnabled: schema.bots.smartRoutingEnabled,
        documentCount: sql<number>`(
          SELECT COUNT(*)::int FROM documents
          WHERE bot_id = ${schema.bots.id} AND status = 'ready'
        )`,
      })
      .from(schema.bots)
      .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
      .where(and(eq(schema.bots.embedKey, embedKey), eq(schema.bots.isActive, true)))
      .limit(1)

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found', code: 'NOT_FOUND', status: 404 },
        { status: 404 },
      )
    }

    // Find or create conversation
    let [conversation] = await db
      .select({ id: schema.conversations.id })
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.botId, bot.id),
          eq(schema.conversations.sessionId, sessionId),
        ),
      )
      .limit(1)

    if (!conversation) {
      const [newConv] = await db
        .insert(schema.conversations)
        .values({ botId: bot.id, sessionId, pageUrl })
        .returning({ id: schema.conversations.id })
      conversation = newConv
    }

    // Insert user message
    await db.insert(schema.messages).values({
      conversationId: conversation.id,
      role: 'user',
      content: message,
    })

    // Get last 10 messages for context
    const recentMessages = await db
      .select({ role: schema.messages.role, content: schema.messages.content })
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, conversation.id))
      .orderBy(desc(schema.messages.createdAt))
      .limit(10)

    const contextMessages: ChatMessage[] = recentMessages
      .reverse()
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    // Compose system prompt: [platform] + [bot] + [doc context] + [FAQ context] + [lead instructions]
    const [platformPrompt, activeFaqs, retrievedChunks] = await Promise.all([
      getPlatformPrompt(),
      getActiveFaqs(bot.id),
      bot.documentCount > 0
        ? retrieveContext(bot.id, message).catch(() => [])
        : Promise.resolve([]),
    ])

    const faqBlock = activeFaqs.length > 0
      ? '--- Knowledge Base ---\n' + activeFaqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : ''

    const docContextBlock = renderDocContext(retrievedChunks)

    const wc = (bot.widgetConfig ?? {}) as { leadCaptureEnabled?: boolean; strictMode?: boolean }
    const leadEnabled = wc.leadCaptureEnabled !== false
    const strictMode = wc.strictMode === true
    const strictInstructions = strictMode
      ? 'STRICT MODE: Only answer questions directly related to your purpose, system prompt, and knowledge base above. For anything outside your knowledge, respond: "I\'m sorry, I don\'t have information about that. Please contact us directly for assistance."'
      : ''

    const finalSystemPrompt = composeSystemPrompt({
      platform: platformPrompt,
      bot: bot.systemPrompt,
      docs: docContextBlock || undefined,
      faqs: [faqBlock, strictInstructions].filter(Boolean).join('\n\n') || undefined,
      lead: leadEnabled ? LEAD_INSTRUCTIONS : undefined,
    })

    // Check conversation limit before processing
    const { allowed: convAllowed } = await checkConversationLimit({
      plan: bot.orgPlan,
      conversationsThisMonth: bot.convCount,
      leadsThisMonth: 0,
    })
    if (!convAllowed) {
      return NextResponse.json(
        { error: 'Monthly conversation limit reached. Upgrade your plan to continue.', code: 'PLAN_LIMIT', status: 402 },
        { status: 402 },
      )
    }

    // Debit-first: estimate tokens, debit before LLM call
    const estimatedTokens = Math.ceil(message.length / 4) * 3
    const { ok: creditOk } = await creditLib.debit(bot.orgId, estimatedTokens)
    if (!creditOk) {
      return NextResponse.json(
        { error: 'Insufficient credits', code: 'NO_CREDITS', status: 402 },
        { status: 402 },
      )
    }

    // Smart routing (if enabled — router handles its own debit/refund for strong model)
    let resolvedModel = bot.model
    let routingDecisionData: {
      classification: string
      classifierModel: string
      classifierLatencyMs: number
      chosenModel: string
      fallbackUsed: boolean
      creditCost: number
    } | null = null

    if (bot.smartRoutingEnabled) {
      const routeResult = await routeMessage({
        text: message,
        botDefaultModel: bot.model,
        orgId: bot.orgId,
        baseEstimate: estimatedTokens,
      })
      resolvedModel = routeResult.modelToUse
      routingDecisionData = {
        classification: routeResult.classification,
        classifierModel: routeResult.classifierModel,
        classifierLatencyMs: routeResult.classifierLatencyMs,
        chosenModel: routeResult.modelToUse,
        fallbackUsed: routeResult.fallbackUsed,
        creditCost: routeResult.creditCost,
      }
    }

    let content: string
    let tokensUsed: number
    let modelUsed: string

    try {
      const result = await chatCompletion({
        systemPrompt: finalSystemPrompt,
        messages: contextMessages,
        model: resolvedModel,
      })
      content = result.content
      tokensUsed = result.tokensUsed
      modelUsed = result.modelUsed
    } catch (llmErr) {
      // Full refund on LLM failure
      await creditLib.refund(bot.orgId, estimatedTokens)
      throw llmErr
    }

    // Reconcile: refund the overestimate, log actual debit
    const actualDebit = routingDecisionData?.creditCost ?? estimatedTokens
    const overpay = actualDebit - tokensUsed
    if (overpay > 0) await creditLib.refund(bot.orgId, overpay)

    // Insert assistant message (flag if response signals uncertainty)
    const [insertedMsg] = await db.insert(schema.messages).values({
      conversationId: conversation.id,
      role: 'assistant',
      content,
      tokensUsed,
      modelUsed,
      flaggedUnanswered: flagIfUnanswered(content),
    }).returning({ id: schema.messages.id })

    // Log credit transaction (refId = messageId for idempotency)
    await creditLib.logTransaction(bot.orgId, -tokensUsed, 'chat_debit', insertedMsg.id)

    // Record routing decision if smart routing was active
    if (bot.smartRoutingEnabled && routingDecisionData) {
      await db.insert(schema.routingDecisions).values({
        messageId: insertedMsg.id,
        botId: bot.id,
        classification: routingDecisionData.classification,
        classifierModel: routingDecisionData.classifierModel,
        classifierLatencyMs: routingDecisionData.classifierLatencyMs,
        chosenModel: routingDecisionData.chosenModel,
        fallbackUsed: routingDecisionData.fallbackUsed,
        creditCost: routingDecisionData.creditCost,
      }).catch(() => {}) // non-blocking — audit log must not break chat
    }

    // Increment message count + conversation counter for org
    await Promise.all([
      db
        .update(schema.conversations)
        .set({ messageCount: sql`${schema.conversations.messageCount} + 2` })
        .where(eq(schema.conversations.id, conversation.id)),
      db
        .update(schema.organizations)
        .set({ conversationsThisMonth: sql`${schema.organizations.conversationsThisMonth} + 1` })
        .where(eq(schema.organizations.id, bot.orgId)),
    ])

    return NextResponse.json({ reply: content, conversationId: conversation.id })
  } catch (err) {
    console.error('[chat] error:', err)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 },
    )
  }
}
