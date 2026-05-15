import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { chatCompletion, type ChatMessage } from '@/lib/ai/litellm'
import { getChatRatelimit } from '@/lib/ratelimit'

const bodySchema = z.object({
  embedKey: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  pageUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const { success } = await getChatRatelimit().limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED', status: 429 },
      { status: 429 },
    )
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
    // Look up bot
    const [bot] = await db
      .select({
        id: schema.bots.id,
        systemPrompt: schema.bots.systemPrompt,
        model: schema.bots.model,
      })
      .from(schema.bots)
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

    // Call LLM
    const { content, tokensUsed, modelUsed } = await chatCompletion({
      systemPrompt: bot.systemPrompt,
      messages: contextMessages,
      model: bot.model,
    })

    // Insert assistant message
    await db.insert(schema.messages).values({
      conversationId: conversation.id,
      role: 'assistant',
      content,
      tokensUsed,
      modelUsed,
    })

    // Increment message count
    await db
      .update(schema.conversations)
      .set({ messageCount: sql`${schema.conversations.messageCount} + 2` })
      .where(eq(schema.conversations.id, conversation.id))

    return NextResponse.json({ reply: content, conversationId: conversation.id })
  } catch (err) {
    console.error('[chat] error:', err)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 },
    )
  }
}
