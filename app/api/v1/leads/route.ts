import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getLeadsRatelimit } from '@/lib/ratelimit'
import { checkLeadLimit, PLAN_LIMITS } from '@/lib/limits'
import { checkAndWarnUsage } from '@/lib/credits/usage-warnings'

const bodySchema = z
  .object({
    embedKey: z.string().min(1),
    sessionId: z.string().min(1),
    name: z.string().nullish(),
    email: z.string().email().nullish(),
    phone: z.string().nullish(),
    notes: z.string().nullish(),
  })
  .refine((d) => d.name || d.email || d.phone, {
    message: 'At least one of name, email, or phone is required',
  })

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
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const { embedKey, sessionId, name, email, phone, notes } = parsed.data

  try {
    const [bot] = await db
      .select({
        id: schema.bots.id,
        orgId: schema.bots.orgId,
        orgPlan: schema.organizations.plan,
        leadsThisMonth: schema.organizations.leadsThisMonth,
        ownerEmail: schema.users.email,
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

    // Check lead limit before inserting
    const { allowed } = await checkLeadLimit(bot.orgId)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Monthly lead limit reached', code: 'PLAN_LIMIT', status: 402 },
        { status: 402 },
      )
    }

    // Find conversation by sessionId + botId (nullable)
    const [conversation] = await db
      .select({ id: schema.conversations.id })
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.botId, bot.id),
          eq(schema.conversations.sessionId, sessionId),
        ),
      )
      .limit(1)

    await db.insert(schema.leads).values({
      botId: bot.id,
      conversationId: conversation?.id ?? null,
      name: name ?? null,
      email: email ?? null,
      phone: phone ?? null,
      notes: notes ?? null,
    })

    // Increment lead counter for org
    await db
      .update(schema.organizations)
      .set({ leadsThisMonth: sql`${schema.organizations.leadsThisMonth} + 1` })
      .where(eq(schema.organizations.id, bot.orgId))

    // Non-blocking 90% lead usage warning
    if (bot.ownerEmail) {
      const planKey = (bot.orgPlan in PLAN_LIMITS ? bot.orgPlan : 'free') as keyof typeof PLAN_LIMITS
      const leadLimit = PLAN_LIMITS[planKey].leads
      void checkAndWarnUsage(bot.orgId, 'leads', bot.leadsThisMonth + 1, leadLimit, bot.orgPlan, bot.ownerEmail)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[leads] error:', err)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 },
    )
  }
}
