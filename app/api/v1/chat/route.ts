import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, desc, eq, sql } from 'drizzle-orm'
import { Redis } from '@upstash/redis'
import { db, schema } from '@/lib/db'
import { chatCompletion, FALLBACK_MODEL, type ChatMessage } from '@/lib/ai/litellm'
import { handleCreditExhaustion } from '@/lib/credits/grace'
import { getChatRatelimit } from '@/lib/ratelimit'
import { getPlatformPrompt } from '@/lib/db/queries/platform'
import { getActiveFaqs } from '@/lib/db/queries/faqs'
import { flagIfUnanswered } from '@/lib/ai/uncertainty'
import * as creditLib from '@/lib/credits'
import { checkConversationLimit, PLAN_LIMITS } from '@/lib/limits'
import { checkAndWarnUsage } from '@/lib/credits/usage-warnings'
import { retrieveContext } from '@/lib/knowledge/retriever'
import { renderDocContext, composeSystemPrompt } from '@/lib/knowledge/prompt-builder'
import { routeMessage } from '@/lib/ai/router'
import { getCurrentModelPrice } from '@/lib/db/queries/admin'
import { sendHandoffNotification } from '@/lib/email/handoff'

const PRODUCT_RECOMMENDATION_INSTRUCTIONS = `

---
PRODUCT CARDS (system — invisible to users):
When the user asks about specific products, asks for recommendations, or wants to browse/compare items, append this marker on a new line at the very end of your response:
[PRODUCTS:[{"name":"Exact Product Name","price":"PKR 2,299","image":"https://full-url/image.jpg","url":"https://store.com/products/handle"}]]
Rules:
- Include 1–4 products most relevant to the user's query.
- Only include products explicitly listed in the document context above. Never invent products.
- Omit the "price" field entirely if no price is available (catalogue-only product).
- Omit the "image" field entirely if no image URL is available.
- Use the full absolute URL for both "image" and "url". Never use relative paths.
- This marker is automatically stripped — users see interactive product cards instead of the marker.`

const LEAD_INSTRUCTIONS = `

---
LEAD CAPTURE (system — invisible to users):
Your goal is to naturally collect the user's name and contact information during the conversation. Follow these rules:

1. After you have answered the user's first or second question and the conversation feels natural, ask for their name first, then their preferred contact method (email or phone). Frame it as a way to follow up or send them more information — never as a requirement.
   Example: "By the way, may I know your name? And if you'd like me to follow up, feel free to share your email or phone as well."

2. Never demand contact info. If they decline or ignore the request, do not ask again.

3. When the user shares their name, email, or phone — at any point — append this marker on a new line at the very end of your response:
   [LEAD:{"name":"their name","email":"their email","phone":"their phone"}]
   - Always capture the name when provided — it is the most important field.
   - Only include fields the user actually provided; omit the rest entirely.
   - Never tell the user you are saving their information.
   - This marker is automatically stripped before the user sees your message.`

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders('*') })
}

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
        name:                schema.bots.name,
        systemPrompt:        schema.bots.systemPrompt,
        model:               schema.bots.model,
        widgetConfig:        schema.bots.widgetConfig,
        orgId:               schema.bots.orgId,
        orgPlan:             schema.organizations.plan,
        convCount:           schema.organizations.conversationsThisMonth,
        bannedAt:            schema.organizations.bannedAt,
        smartRoutingEnabled: schema.bots.smartRoutingEnabled,
        routingLightModel:   schema.bots.routingLightModel,
        routingStrongModel:  schema.bots.routingStrongModel,
        monthlyConvLimit:    schema.bots.monthlyConvLimit,
        ownerEmail:          schema.users.email,
        clientEmail: sql<string | null>`(
          SELECT email FROM users WHERE id = ${schema.bots.clientUserId}
        )`,
        documentCount: sql<number>`(
          SELECT COUNT(*)::int FROM documents
          WHERE bot_id = ${schema.bots.id} AND status = 'ready'
        )`,
      })
      .from(schema.bots)
      .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
      .innerJoin(schema.users, eq(schema.organizations.ownerId, schema.users.id))
      .where(and(eq(schema.bots.embedKey, embedKey), eq(schema.bots.isActive, true)))
      .limit(1)

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found', code: 'NOT_FOUND', status: 404 },
        { status: 404 },
      )
    }

    if (bot.bannedAt) {
      return NextResponse.json(
        { error: 'Account suspended', code: 'SUSPENDED', status: 403 },
        { status: 403 },
      )
    }

    // Extract widgetConfig early — needed for CORS check and system prompt composition
    const wc = (bot.widgetConfig ?? {}) as {
      leadCaptureEnabled?: boolean
      collectLeadBefore?: boolean
      strictMode?: boolean
      handoffEnabled?: boolean
      handoffNotifyTarget?: 'developer' | 'client'
      storeUrl?: string
      storeCurrency?: string
      productRecommendationsEnabled?: boolean
    }
    const storeUrl      = (wc.storeUrl      && wc.storeUrl.trim())      ? wc.storeUrl.trim()      : undefined
    const storeCurrency = (wc.storeCurrency && wc.storeCurrency.trim()) ? wc.storeCurrency.trim() : undefined

    // CORS origin guard — only applies when storeUrl is set
    const requestOrigin = req.headers.get('origin')
    const allowedOrigin = storeUrl ? (() => { try { return new URL(storeUrl).origin } catch { return null } })() : null
    if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
      return NextResponse.json(
        {
          error: `This bot is only embeddable on ${allowedOrigin}. Update the bot's Store URL in Settings to change this restriction.`,
          code: 'ORIGIN_NOT_ALLOWED',
          status: 403,
        },
        { status: 403, headers: corsHeaders(allowedOrigin) },
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
      getPlatformPrompt().then((p) => { console.log('[chat] platformPrompt chars:', p.length); return p }),
      getActiveFaqs(bot.id),
      bot.documentCount > 0
        ? retrieveContext(bot.id, message).catch((err) => {
            console.error('[chat] retrieveContext failed:', err)
            return []
          })
        : Promise.resolve([]),
    ])

    const faqBlock = activeFaqs.length > 0
      ? '--- Knowledge Base ---\n' + activeFaqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : ''

    const docContextBlock = renderDocContext(retrievedChunks, storeUrl, storeCurrency)

    const productRecsEnabled = wc.productRecommendationsEnabled === true && bot.documentCount > 0

    // If the pre-chat form already collected contact info, suppress in-chat lead prompting
    const leadEnabled = wc.leadCaptureEnabled !== false && wc.collectLeadBefore !== true
    const handoffEnabled = wc.handoffEnabled === true
    const handoffNotifyTarget = wc.handoffNotifyTarget ?? 'developer'
    const strictMode = wc.strictMode === true
    const strictInstructions = strictMode
      ? leadEnabled
        ? 'STRICT MODE: Only answer questions directly related to your purpose, system prompt, and knowledge base above. For anything outside your knowledge base, do NOT make up an answer. Instead, acknowledge you don\'t have that specific information and offer to collect the visitor\'s contact details so the team can follow up with them personally.'
        : 'STRICT MODE: Only answer questions directly related to your purpose, system prompt, and knowledge base above. For anything outside your knowledge base, respond: "I\'m sorry, I don\'t have information about that. Please contact us directly for assistance."'
      : ''

    const finalSystemPrompt = composeSystemPrompt({
      platform: platformPrompt,
      bot: bot.systemPrompt,
      docs: docContextBlock || undefined,
      faqs: [faqBlock, strictInstructions].filter(Boolean).join('\n\n') || undefined,
      lead: [
        leadEnabled ? LEAD_INSTRUCTIONS : '',
        productRecsEnabled ? PRODUCT_RECOMMENDATION_INSTRUCTIONS : '',
      ].filter(Boolean).join('\n') || undefined,
    })

    // Check conversation limit before processing
    const { allowed: convAllowed } = await checkConversationLimit(
      { plan: bot.orgPlan, conversationsThisMonth: bot.convCount, leadsThisMonth: 0 },
      { botId: bot.id, monthlyConvLimit: bot.monthlyConvLimit },
    )
    if (!convAllowed) {
      return NextResponse.json(
        { error: 'Monthly conversation limit reached. Upgrade your plan to continue.', code: 'PLAN_LIMIT', status: 402 },
        { status: 402 },
      )
    }

    // Debit-first: estimate tokens, debit before LLM call
    const estimatedTokens = Math.ceil(message.length / 4) * 3
    const { ok: creditOk, balance: postDebitBalance } = await creditLib.debit(bot.orgId, estimatedTokens)

    // Non-blocking credit usage warning (after successful debit only)
    if (creditOk && bot.ownerEmail) {
      const creditAlloc = creditLib.PLAN_CREDIT_ALLOCATIONS[bot.orgPlan] ?? creditLib.FREE_TIER_CREDITS
      void checkAndWarnUsage(bot.orgId, 'credits', creditAlloc - postDebitBalance, creditAlloc, bot.orgPlan, bot.ownerEmail)
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

    if (!creditOk) {
      // Credits exhausted — enter grace period logic (no 402 to widget users)
      const { action } = await handleCreditExhaustion(bot.orgId, bot.orgPlan, bot.name)
      if (action === 'disable') {
        return NextResponse.json(
          { message: 'This chatbot is temporarily unavailable. Please try again later.' },
          { status: 200 },
        )
      }
      // action === 'fallback': use default model, skip smart routing
      resolvedModel = FALLBACK_MODEL
    } else if (bot.smartRoutingEnabled && ['pro', 'agency', 'enterprise'].includes(bot.orgPlan)) {
      const routeResult = await routeMessage({
        text: message,
        botDefaultModel: bot.model,
        orgId: bot.orgId,
        baseEstimate: estimatedTokens,
        lightModel: bot.routingLightModel,
        strongModel: bot.routingStrongModel,
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
    let inputTokens: number
    let outputTokens: number
    let modelUsed: string

    try {
      const result = await chatCompletion({
        systemPrompt: finalSystemPrompt,
        messages: contextMessages,
        model: resolvedModel,
      })
      content = result.content
      tokensUsed = result.tokensUsed
      inputTokens = result.inputTokens
      outputTokens = result.outputTokens
      modelUsed = result.modelUsed
    } catch (llmErr) {
      // Full refund on LLM failure (only if credits were actually debited)
      if (creditOk) await creditLib.refund(bot.orgId, estimatedTokens)
      throw llmErr
    }

    // Extract [PRODUCTS:[...]] marker — strip from saved content, expose in response
    type ProductCard = { name: string; price?: string; image?: string; url?: string }
    let products: ProductCard[] = []
    const productMatch = content.match(/\[PRODUCTS:(\[[\s\S]*?\])\]/)
    if (productMatch) {
      try {
        const raw = JSON.parse(productMatch[1])
        if (Array.isArray(raw)) {
          products = (raw as unknown[])
            .filter((p): p is ProductCard => !!p && typeof (p as ProductCard).name === 'string')
            .slice(0, 4)
        }
      } catch { /* ignore malformed markers */ }
      content = content.replace(/\n?\[PRODUCTS:\[[\s\S]*?\]\]/g, '').trim()
    }

    // Reconcile: refund the overestimate, log actual debit
    const actualDebit = routingDecisionData?.creditCost ?? estimatedTokens
    const overpay = actualDebit - tokensUsed
    if (creditOk && overpay > 0) await creditLib.refund(bot.orgId, overpay)

    // Compute USD cost using active model price (manual takes priority over API price)
    let costUsd = '0'
    try {
      const price = await getCurrentModelPrice(modelUsed)
      if (price) {
        const inputCost  = (inputTokens  / 1_000_000) * parseFloat(price.promptPricePer1M)
        const outputCost = (outputTokens / 1_000_000) * parseFloat(price.completionPricePer1M)
        costUsd = (inputCost + outputCost).toFixed(8)
      }
    } catch {
      // Non-blocking — missing price row shouldn't break chat
    }

    // Insert assistant message (flag if response signals uncertainty)
    const [insertedMsg] = await db.insert(schema.messages).values({
      conversationId: conversation.id,
      role: 'assistant',
      content,
      tokensUsed,
      inputTokens,
      outputTokens,
      costUsd,
      modelUsed,
      flaggedUnanswered: flagIfUnanswered(content),
    }).returning({ id: schema.messages.id })

    // Log credit transaction only when credits were actually debited
    if (creditOk) {
      await creditLib.logTransaction(bot.orgId, -tokensUsed, 'chat_debit', insertedMsg.id)
    }

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

    // Human handoff: flag conversation when bot signals uncertainty (only if handoff is enabled)
    const unanswered = handoffEnabled && flagIfUnanswered(content)

    // Increment message count + conversation counter for org
    await Promise.all([
      unanswered
        ? db
            .update(schema.conversations)
            .set({ messageCount: sql`${schema.conversations.messageCount} + 2`, needsHuman: true, escalatedAt: new Date() })
            .where(eq(schema.conversations.id, conversation.id))
            .catch(() =>
              db
                .update(schema.conversations)
                .set({ messageCount: sql`${schema.conversations.messageCount} + 2` })
                .where(eq(schema.conversations.id, conversation.id))
            )
        : db
            .update(schema.conversations)
            .set({ messageCount: sql`${schema.conversations.messageCount} + 2` })
            .where(eq(schema.conversations.id, conversation.id)),
      db
        .update(schema.organizations)
        .set({ conversationsThisMonth: sql`${schema.organizations.conversationsThisMonth} + 1` })
        .where(eq(schema.organizations.id, bot.orgId)),
    ])

    // Non-blocking 90% usage warning check
    const planKey = (bot.orgPlan in PLAN_LIMITS ? bot.orgPlan : 'free') as keyof typeof PLAN_LIMITS
    const convLimit = PLAN_LIMITS[planKey].conversations
    if (bot.ownerEmail) {
      void checkAndWarnUsage(bot.orgId, 'conversations', bot.convCount + 1, convLimit, bot.orgPlan, bot.ownerEmail)
    }

    // Non-blocking handoff email notification
    if (unanswered) {
      const notifyEmail = handoffNotifyTarget === 'client' ? bot.clientEmail : bot.ownerEmail
      if (notifyEmail) {
        void (async () => {
          try {
            const [lead] = await db
              .select({ name: schema.leads.name, email: schema.leads.email })
              .from(schema.leads)
              .where(eq(schema.leads.conversationId, conversation.id))
              .limit(1)
            await sendHandoffNotification({
              ownerEmail: notifyEmail,
              botName: bot.name,
              conversationId: conversation.id,
              lastUserMessage: message,
              visitorName:  lead?.name  ?? undefined,
              visitorEmail: lead?.email ?? undefined,
            })
          } catch { /* non-blocking — never break chat */ }
        })()
      }
    }

    return NextResponse.json(
      { reply: content, conversationId: conversation.id, needsHuman: unanswered, products },
      { headers: corsHeaders(allowedOrigin ?? '*') },
    )
  } catch (err) {
    console.error('[chat] error:', err)
    // Store error in Redis for admin visibility (non-blocking, capped at 200)
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
      const entry = JSON.stringify({
        t: new Date().toISOString(),
        embedKey: parsed.success ? parsed.data.embedKey.slice(0, 16) + '…' : 'parse_err',
        err: err instanceof Error ? err.message : String(err),
      })
      await redis.lpush('chat:errors', entry)
      await redis.ltrim('chat:errors', 0, 199)
    } catch { /* Redis down — don't mask the original error */ }
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 },
    )
  }
}
