import { NextRequest, NextResponse } from 'next/server'
import { and, eq, gt, asc } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { embedKeyMatch } from '@/lib/bots/embed-key'
import { getChatRatelimit } from '@/lib/ratelimit'

// Public endpoint the embed widget polls while a conversation is in live human
// handoff. Returns any human-agent messages newer than the client's cursor plus
// whether a human is still in control. No LLM, no credits — read-only.

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
    Vary: 'Origin',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin') ?? '*') })
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '*'
  const headers = corsHeaders(origin)

  const sp = req.nextUrl.searchParams
  const embedKey = sp.get('embedKey')?.trim()
  const sessionId = sp.get('sessionId')?.trim()
  const afterRaw = sp.get('after')?.trim()

  if (!embedKey || !sessionId) {
    return NextResponse.json(
      { error: 'Missing embedKey or sessionId', code: 'BAD_REQUEST', status: 400 },
      { status: 400, headers },
    )
  }

  // Rate limit — polling is frequent; key by session so one widget can't be abused
  const rl = getChatRatelimit()
  if (rl) {
    const { success } = await rl.limit(`poll:${sessionId}`)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED', status: 429 },
        { status: 429, headers },
      )
    }
  }

  // Resolve bot by embed key (honours the rotation grace window)
  const [bot] = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .where(and(embedKeyMatch(embedKey), eq(schema.bots.isActive, true)))
    .limit(1)

  if (!bot) {
    return NextResponse.json({ error: 'Bot not found', code: 'NOT_FOUND', status: 404 }, { status: 404, headers })
  }

  const [conversation] = await db
    .select({ id: schema.conversations.id, agentActiveAt: schema.conversations.agentActiveAt })
    .from(schema.conversations)
    .where(and(eq(schema.conversations.botId, bot.id), eq(schema.conversations.sessionId, sessionId)))
    .limit(1)

  if (!conversation) {
    return NextResponse.json({ live: false, messages: [] }, { status: 200, headers })
  }

  // Only surface human-agent messages newer than the cursor the widget already has.
  const after = afterRaw ? new Date(afterRaw) : null
  const validAfter = after && !Number.isNaN(after.getTime()) ? after : new Date(0)

  const rows = await db
    .select({ id: schema.messages.id, content: schema.messages.content, createdAt: schema.messages.createdAt })
    .from(schema.messages)
    .where(
      and(
        eq(schema.messages.conversationId, conversation.id),
        eq(schema.messages.role, 'agent'),
        gt(schema.messages.createdAt, validAfter),
      ),
    )
    .orderBy(asc(schema.messages.createdAt))
    .limit(20)

  return NextResponse.json(
    {
      live: conversation.agentActiveAt != null,
      messages: rows.map((m) => ({ id: m.id, content: m.content, createdAt: m.createdAt })),
    },
    { status: 200, headers },
  )
}
