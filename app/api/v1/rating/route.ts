import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getLeadsRatelimit } from '@/lib/ratelimit'

const bodySchema = z.object({
  messageId: z.string().min(1),
  embedKey:  z.string().min(1),
  rating:    z.union([z.literal(1), z.literal(-1)]),
})

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders('*') })
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rl = getLeadsRatelimit()
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
      { error: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR', status: 422 },
      { status: 422 },
    )
  }

  const { messageId, embedKey, rating } = parsed.data

  // Tenant-safe: verify message belongs to a bot with this embedKey
  const [msg] = await db
    .select({ id: schema.messages.id })
    .from(schema.messages)
    .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
    .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
    .where(
      and(
        eq(schema.messages.id, messageId),
        eq(schema.bots.embedKey, embedKey),
        eq(schema.bots.isActive, true),
      ),
    )
    .limit(1)

  if (!msg) {
    return NextResponse.json(
      { error: 'Message not found', code: 'NOT_FOUND', status: 404 },
      { status: 404 },
    )
  }

  await db
    .update(schema.messages)
    .set({ rating })
    .where(eq(schema.messages.id, messageId))

  const origin = req.headers.get('origin') ?? '*'
  return NextResponse.json({ ok: true }, { headers: corsHeaders(origin) })
}
