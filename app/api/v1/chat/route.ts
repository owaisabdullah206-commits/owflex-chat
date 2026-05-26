import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, desc, eq, sql } from 'drizzle-orm'
import { Redis } from '@upstash/redis'
import { db, schema } from '@/lib/db'
import { chatCompletionStreamGen, FALLBACK_MODEL, type ChatMessage } from '@/lib/ai/litellm'
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
THIS IS MANDATORY. Every response that names any product MUST end with the JSON marker below — no exceptions, even for greetings that happen to mention a product name.

Format (append on a new line at the very end of your message):
[PRODUCTS:[{"name":"Exact Product Name","price":"PKR 2,299","image":"https://cdn.example.com/image.jpg","url":"https://store.com/products/handle"}]]

Rules:
- Trigger: ANY response that names one or more specific products (including list responses and "we carry X" statements).
- Count: Include 1–4 products. For long text lists, pick the first 4 you mentioned.
- Fields: "name" is always required. Include "price", "image", and "url" only if their exact values appear verbatim in your knowledge context for that product.
- URLs: must be full absolute URLs (starting with https://). If the context only shows a relative path like /products/handle, resolve it using the store URL you have been given. Never leave a relative URL — either resolve it or omit the field.
- Never invent a product, price, image, or URL that is not in your knowledge context.
- This marker is stripped automatically — users see interactive product cards, not the raw JSON.`

const LANGUAGE_RULE = `

---
LANGUAGE MIRRORING (system — invisible to users):
Always reply in the exact same language and script the user used in their last message.
- English message → reply in English.
- Urdu in Arabic/Nastaliq script → reply in Urdu script.
- Roman Urdu (Urdu words spelled with Latin/English letters, e.g. "kitne products hain") → reply in Roman Urdu using Latin letters. Do NOT switch to Urdu script (نستعلیق) for Roman Urdu input.
- Mixed English/Urdu → match the dominant language of the user's message.
Never change the output script unless the user changes their input script.`

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
    // Always allow requests from the app itself (dashboard preview / embed-test)
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL
      ? (() => { try { return new URL(process.env.NEXT_PUBLIC_APP_URL!).origin } catch { return null } })()
      : null
    const fromAppItself = appOrigin && requestOrigin === appOrigin
    if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin && !fromAppItself) {
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
    const [platformPrompt, activeFaqs, retrievedChunks, totalKbProducts] = await Promise.all([
      getPlatformPrompt().then((p) => {
        // Replace {{botName}}, {{storeName}}, {{storeUrl}} placeholders with live bot values
        const storeName = storeUrl
          ? (() => { try { return new URL(storeUrl).hostname.replace(/^www\./, '') } catch { return bot.name } })()
          : bot.name
        const resolved = p
          .replace(/\{\{botName\}\}/g, bot.name)
          .replace(/\{\{storeName\}\}/g, storeName)
          .replace(/\{\{storeUrl\}\}/g, storeUrl ?? '')
        console.log('[chat] platformPrompt chars:', resolved.length)
        return resolved
      }),
      getActiveFaqs(bot.id),
      bot.documentCount > 0
        ? retrieveContext(bot.id, message).catch((err) => {
            console.error('[chat] retrieveContext failed:', err)
            return []
          })
        : Promise.resolve([]),
      // Count chunks directly from document_chunks — accurate even for documents
      // ingested before chunk_count tracking was added (chunk_count may be 0 on those).
      bot.documentCount > 0
        ? db.execute<{ total: number }>(sql`
            SELECT COUNT(*)::int AS total
            FROM document_chunks
            WHERE bot_id = ${bot.id}
              AND version = (
                SELECT MAX(version) FROM document_chunks dc2
                WHERE dc2.document_id = document_chunks.document_id
              )
          `).then((r) => (r.rows[0] as { total: number })?.total ?? 0)
        : Promise.resolve(0),
    ])

    const faqBlock = activeFaqs.length > 0
      ? '--- Knowledge Base ---\n' + activeFaqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : ''

    const planKey = (bot.orgPlan in PLAN_LIMITS ? bot.orgPlan : 'free') as keyof typeof PLAN_LIMITS
    const catalogProductLimit = PLAN_LIMITS[planKey].catalogProducts

    const docContextBlock = retrievedChunks.length > 0
      ? renderDocContext(retrievedChunks, storeUrl, storeCurrency, catalogProductLimit, totalKbProducts)
      : bot.documentCount > 0
        ? `This bot has a product knowledge base, but no specific items matched this query. If the user is asking about products, acknowledge that you may carry what they need and ask them to describe what they are looking for in more detail (e.g. colour, type, use case). Do not invent or guess any product names, brands, prices, or categories from your training knowledge.`
        : ''

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
        LANGUAGE_RULE,
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

    // ── Streaming response ────────────────────────────────────────────────────
    // All post-LLM work (DB writes, credit reconciliation, handoff) runs inside
    // the ReadableStream controller so it completes before the stream closes.
    type ProductCard = { name: string; price?: string; image?: string; url?: string }
    const encoder = new TextEncoder()

    const responseStream = new ReadableStream({
      async start(controller) {
        const enqueue = (data: object) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

        try {
          let fullContent  = ''
          let tokensUsed   = estimatedTokens  // fallback if provider omits usage
          let inputTokens  = 0
          let outputTokens = 0
          let modelUsed    = resolvedModel

          for await (const ev of chatCompletionStreamGen({
            systemPrompt: finalSystemPrompt,
            messages: contextMessages,
            model: resolvedModel,
          })) {
            if (ev.type === 'token') {
              enqueue({ type: 'token', delta: ev.delta })
            } else {
              // 'done' — accumulate stats; content returned below
              fullContent  = ev.content
              if (ev.tokensUsed > 0) {
                tokensUsed   = ev.tokensUsed
                inputTokens  = ev.inputTokens
                outputTokens = ev.outputTokens
              }
              modelUsed = ev.modelUsed
            }
          }

          // Extract [PRODUCTS:[...]] marker — strip from stored content
          let products: ProductCard[] = []
          const productMatch = fullContent.match(/\[PRODUCTS:(\[[\s\S]*?\])\]/)
          if (productMatch) {
            try {
              const raw = JSON.parse(productMatch[1])
              if (Array.isArray(raw)) {
                products = (raw as unknown[])
                  .filter((p): p is ProductCard => !!p && typeof (p as ProductCard).name === 'string')
                  .slice(0, 4)
              }
            } catch { /* ignore malformed markers */ }
            fullContent = fullContent.replace(/\n?\[PRODUCTS:\[[\s\S]*?\]\]/g, '').trim()
          }

          // Reconcile credits: refund over-estimated portion
          const actualDebit = routingDecisionData?.creditCost ?? estimatedTokens
          const overpay = actualDebit - tokensUsed
          if (creditOk && overpay > 0) await creditLib.refund(bot.orgId, overpay)

          // Compute USD cost
          let costUsd = '0'
          try {
            const price = await getCurrentModelPrice(modelUsed)
            if (price) {
              const inputCost  = (inputTokens  / 1_000_000) * parseFloat(price.promptPricePer1M)
              const outputCost = (outputTokens / 1_000_000) * parseFloat(price.completionPricePer1M)
              costUsd = (inputCost + outputCost).toFixed(8)
            }
          } catch { /* non-blocking */ }

          // Insert assistant message
          const [insertedMsg] = await db.insert(schema.messages).values({
            conversationId: conversation.id,
            role:           'assistant',
            content:        fullContent,
            tokensUsed,
            inputTokens,
            outputTokens,
            costUsd,
            modelUsed,
            flaggedUnanswered: flagIfUnanswered(fullContent),
          }).returning({ id: schema.messages.id })

          // Log credit transaction
          if (creditOk) {
            await creditLib.logTransaction(bot.orgId, -tokensUsed, 'chat_debit', insertedMsg.id)
          }

          // Record routing decision
          if (bot.smartRoutingEnabled && routingDecisionData) {
            await db.insert(schema.routingDecisions).values({
              messageId:          insertedMsg.id,
              botId:              bot.id,
              classification:     routingDecisionData.classification,
              classifierModel:    routingDecisionData.classifierModel,
              classifierLatencyMs: routingDecisionData.classifierLatencyMs,
              chosenModel:        routingDecisionData.chosenModel,
              fallbackUsed:       routingDecisionData.fallbackUsed,
              creditCost:         routingDecisionData.creditCost,
            }).catch(() => {}) // non-blocking — audit log must not break chat
          }

          // Human handoff
          const unanswered = handoffEnabled && flagIfUnanswered(fullContent)

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

          // Non-blocking usage warning
          const planKey = (bot.orgPlan in PLAN_LIMITS ? bot.orgPlan : 'free') as keyof typeof PLAN_LIMITS
          const convLimit = PLAN_LIMITS[planKey].conversations
          if (bot.ownerEmail) {
            void checkAndWarnUsage(bot.orgId, 'conversations', bot.convCount + 1, convLimit, bot.orgPlan, bot.ownerEmail)
          }

          // Non-blocking handoff email
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
                    ownerEmail:    notifyEmail,
                    botName:       bot.name,
                    conversationId: conversation.id,
                    lastUserMessage: message,
                    visitorName:   lead?.name  ?? undefined,
                    visitorEmail:  lead?.email ?? undefined,
                  })
                } catch { /* non-blocking — never break chat */ }
              })()
            }
          }

          // Final event: metadata the widget needs to render products / handoff card
          enqueue({ type: 'done', conversationId: conversation.id, messageId: insertedMsg.id, needsHuman: unanswered, products })
          controller.close()
        } catch (streamErr) {
          // Full credit refund on failure
          if (creditOk) await creditLib.refund(bot.orgId, estimatedTokens).catch(() => {})
          enqueue({ type: 'error' })
          controller.close()
          // Log to Redis (non-blocking)
          try {
            const redis = new Redis({
              url:   process.env.UPSTASH_REDIS_REST_URL!,
              token: process.env.UPSTASH_REDIS_REST_TOKEN!,
            })
            const entry = JSON.stringify({
              t:        new Date().toISOString(),
              embedKey: parsed.data.embedKey.slice(0, 16) + '…',
              err:      streamErr instanceof Error ? streamErr.message : String(streamErr),
            })
            await redis.lpush('chat:errors', entry)
            await redis.ltrim('chat:errors', 0, 199)
          } catch { /* Redis down */ }
        }
      },
    })

    return new Response(responseStream, {
      headers: {
        'Content-Type':      'text/event-stream; charset=utf-8',
        'Cache-Control':     'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        ...corsHeaders(allowedOrigin ?? '*'),
      },
    })
  } catch (err) {
    console.error('[chat] error:', err)
    // Pre-streaming setup errors (DB, validation) — safe to return JSON
    try {
      const redis = new Redis({
        url:   process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
      const entry = JSON.stringify({
        t:        new Date().toISOString(),
        embedKey: parsed.success ? parsed.data.embedKey.slice(0, 16) + '…' : 'parse_err',
        err:      err instanceof Error ? err.message : String(err),
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
