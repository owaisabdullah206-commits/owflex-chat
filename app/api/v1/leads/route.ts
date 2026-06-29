import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { embedKeyMatch } from '@/lib/bots/embed-key'
import { getLeadsRatelimit } from '@/lib/ratelimit'
import { PLAN_LIMITS } from '@/lib/limits'
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
        id:               schema.bots.id,
        orgId:            schema.bots.orgId,
        name:             schema.bots.name,
        embedKey:         schema.bots.embedKey,
        orgPlan:          schema.organizations.plan,
        leadsThisMonth:   schema.organizations.leadsThisMonth,
        ownerEmail:       schema.users.email,
        webhookUrl:       schema.bots.webhookUrl,
        slackWebhookUrl:  schema.bots.slackWebhookUrl,
        monthlyLeadLimit: schema.bots.monthlyLeadLimit,
      })
      .from(schema.bots)
      .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
      .innerJoin(schema.users, eq(schema.organizations.ownerId, schema.users.id))
      .where(and(embedKeyMatch(embedKey), eq(schema.bots.isActive, true)))
      .limit(1)

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found', code: 'NOT_FOUND', status: 404 },
        { status: 404 },
      )
    }

    // Determine if this lead would exceed limits (plan-level or per-bot cap)
    const planKey = (bot.orgPlan in PLAN_LIMITS ? bot.orgPlan : 'free') as keyof typeof PLAN_LIMITS
    const leadLimit = PLAN_LIMITS[planKey].leads
    const newLeadCount = bot.leadsThisMonth + 1
    // Lead is hidden when it pushes the org past the plan ceiling (Infinity = unlimited)
    let hiddenByLimit = leadLimit !== Infinity && newLeadCount > (leadLimit as number)

    // Per-bot lead cap: also hide if the bot has its own monthly lead limit
    if (!hiddenByLimit && bot.monthlyLeadLimit !== null && bot.monthlyLeadLimit !== undefined) {
      const startOfMonth = new Date()
      startOfMonth.setUTCDate(1)
      startOfMonth.setUTCHours(0, 0, 0, 0)
      const [row] = await db
        .select({ cnt: count() })
        .from(schema.leads)
        .where(and(eq(schema.leads.botId, bot.id), gte(schema.leads.capturedAt, startOfMonth)))
      if ((row?.cnt ?? 0) >= bot.monthlyLeadLimit) hiddenByLimit = true
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

    // Always save the lead — never block capture. Flag hidden ones for filtering.
    // sessionId lets the chat route find a pre-chat-form lead (conversationId is null then).
    await db.insert(schema.leads).values({
      botId: bot.id,
      conversationId: conversation?.id ?? null,
      sessionId,
      name: name ?? null,
      email: email ?? null,
      phone: phone ?? null,
      notes: notes ?? null,
      hiddenByLimit,
    })

    // Increment lead counter for org (always, even for hidden leads)
    await db
      .update(schema.organizations)
      .set({ leadsThisMonth: sql`${schema.organizations.leadsThisMonth} + 1` })
      .where(eq(schema.organizations.id, bot.orgId))

    // Non-blocking 90% lead usage warning
    if (bot.ownerEmail) {
      void checkAndWarnUsage(bot.orgId, 'leads', newLeadCount, leadLimit, bot.orgPlan, bot.ownerEmail)
    }

    // Instant lead notification email — fire-and-forget, only for visible leads
    if (!hiddenByLimit && bot.ownerEmail) {
      const { sendLeadNotification } = await import('@/lib/email/lead-notification')
      void sendLeadNotification({
        ownerEmail:     bot.ownerEmail,
        botName:        bot.name,
        leadName:       name  ?? null,
        leadEmail:      email ?? null,
        leadPhone:      phone ?? null,
        leadNotes:      notes ?? null,
        conversationId: conversation?.id ?? null,
      })
    }

    // Non-blocking outbound webhook — fire-and-forget, never delays the response
    if (bot.webhookUrl && !hiddenByLimit) {
      const { fireLeadWebhook } = await import('@/lib/webhooks/outbound')
      void fireLeadWebhook(bot.webhookUrl, {
        event:     'lead.captured',
        embedKey:  bot.embedKey,
        sessionId,
        lead: {
          name:  name  ?? null,
          email: email ?? null,
          phone: phone ?? null,
          notes: notes ?? null,
        },
        capturedAt: new Date().toISOString(),
      })
    }

    // Non-blocking Slack notification — fire-and-forget, only for visible leads
    if (bot.slackWebhookUrl && !hiddenByLimit) {
      const { fireSlackLeadNotification } = await import('@/lib/webhooks/slack')
      void fireSlackLeadNotification(bot.slackWebhookUrl, {
        botName: bot.name,
        name:    name  ?? null,
        email:   email ?? null,
        phone:   phone ?? null,
        notes:   notes ?? null,
      })
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
