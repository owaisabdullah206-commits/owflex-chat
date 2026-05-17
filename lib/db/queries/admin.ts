'use server'

import { revalidatePath } from 'next/cache'
import { and, count, desc, eq, sql, sum } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requirePlatformOwner } from '@/lib/auth/session'
import { SUPPORTED_MODELS } from '@/lib/ai/litellm'

const PKR_PRICES: Record<string, number> = {
  free:    0,
  starter: 2000,
  pro:     6000,
  agency:  15000,
}

// ── READ QUERIES ──────────────────────────────────────────────────────────────

export async function getAllDevelopers() {
  await requirePlatformOwner()

  return db
    .select({
      userId:                 schema.users.id,
      name:                   schema.users.name,
      email:                  schema.users.email,
      userCreatedAt:          schema.users.createdAt,
      orgId:                  schema.organizations.id,
      plan:                   schema.organizations.plan,
      conversationsThisMonth: schema.organizations.conversationsThisMonth,
      bannedAt:               schema.organizations.bannedAt,
      banReason:              schema.organizations.banReason,
      botCount: sql<number>`(
        SELECT COUNT(*)::int FROM bots WHERE org_id = ${schema.organizations.id}
      )`,
      creditBalance: sql<number>`COALESCE(
        (SELECT SUM(delta) FROM credit_transactions WHERE org_id = ${schema.organizations.id}), 0
      )::int`,
    })
    .from(schema.users)
    .innerJoin(schema.organizations, eq(schema.organizations.ownerId, schema.users.id))
    .where(eq(schema.users.role, 'developer'))
    .orderBy(desc(schema.users.createdAt))
}

export async function getPlatformStats() {
  await requirePlatformOwner()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [devCount, planBreakdown, botStats, monthlyMsgStats, costStats, creditRevenue, newSignups] =
    await Promise.all([
      // Total developers
      db.select({ total: count() })
        .from(schema.users)
        .where(eq(schema.users.role, 'developer')),

      // Plan breakdown for MRR
      db.select({ plan: schema.organizations.plan, cnt: count() })
        .from(schema.organizations)
        .groupBy(schema.organizations.plan),

      // Bot stats
      db.select({
        total:  count(),
        active: sql<number>`SUM(CASE WHEN is_active THEN 1 ELSE 0 END)::int`,
      }).from(schema.bots),

      // Messages + leads this month (org-level counters)
      db.select({
        totalMessages: sql<number>`COALESCE(SUM(conversations_this_month), 0)::int`,
        totalLeads:    sql<number>`COALESCE(SUM(leads_this_month), 0)::int`,
      }).from(schema.organizations),

      // All-time LLM cost
      db.select({ total: sum(schema.messages.costUsd) }).from(schema.messages),

      // Credit revenue (purchases only)
      db.select({ total: sum(schema.creditTransactions.delta) })
        .from(schema.creditTransactions)
        .where(eq(schema.creditTransactions.reason, 'purchase')),

      // New signups this month
      db.select({ cnt: count() })
        .from(schema.users)
        .where(and(
          eq(schema.users.role, 'developer'),
          sql`${schema.users.createdAt} >= ${monthStart}`,
        )),
    ])

  const mrr = planBreakdown.reduce(
    (acc, { plan, cnt }) => acc + (PKR_PRICES[plan] ?? 0) * cnt,
    0,
  )

  const paidCount = planBreakdown
    .filter(({ plan }) => plan !== 'free')
    .reduce((acc, { cnt }) => acc + cnt, 0)

  const llmCostUsd  = parseFloat(costStats[0]?.total ?? '0')
  const creditRevUsd = parseFloat(creditRevenue[0]?.total ?? '0')

  return {
    totalDevelopers:    devCount[0]?.total ?? 0,
    paidDevelopers:     paidCount,
    planBreakdown,
    totalBots:          botStats[0]?.total ?? 0,
    activeBots:         botStats[0]?.active ?? 0,
    totalMessages:      monthlyMsgStats[0]?.totalMessages ?? 0,
    totalLeads:         monthlyMsgStats[0]?.totalLeads ?? 0,
    estimatedMrrPkr:    mrr,
    llmCostUsd,
    creditRevenueUsd:   creditRevUsd,
    grossProfitUsd:     creditRevUsd - llmCostUsd,
    newSignupsThisMonth: newSignups[0]?.cnt ?? 0,
  }
}

// Returns the priority preference map from platformConfig
async function getModelPricePriorityMap(): Promise<Record<string, 'manual' | 'openrouter-api'>> {
  const [row] = await db
    .select({ p: schema.platformConfig.modelPricePriority })
    .from(schema.platformConfig)
    .where(eq(schema.platformConfig.id, 'default'))
    .limit(1)
  return (row?.p as Record<string, 'manual' | 'openrouter-api'>) ?? {}
}

// Returns the active price for a model.
// Priority per model: check platformConfig.modelPricePriority[modelId],
// default is 'manual' (manual wins when both sources exist).
// If only one source exists, that source is always used regardless of priority.
export async function getCurrentModelPrice(modelId: string) {
  const priorityMap = await getModelPricePriorityMap()
  const priority = priorityMap[modelId] ?? 'manual'

  const [price] = await db
    .select()
    .from(schema.modelPrices)
    .where(eq(schema.modelPrices.modelId, modelId))
    .orderBy(
      sql`CASE WHEN ${schema.modelPrices.source} = ${priority} THEN 0 ELSE 1 END`,
      desc(schema.modelPrices.effectiveFrom),
    )
    .limit(1)
  return price ?? null
}

export async function getModelPrices() {
  await requirePlatformOwner()

  const [priorityMap, rows] = await Promise.all([
    getModelPricePriorityMap(),
    db
      .select()
      .from(schema.modelPrices)
      .where(sql`${schema.modelPrices.modelId} = ANY(${SUPPORTED_MODELS})`)
      .orderBy(
        schema.modelPrices.modelId,
        desc(schema.modelPrices.effectiveFrom),
      ),
  ])

  // Group by modelId: latest manual price + latest API price per model
  const grouped = new Map<string, {
    manual: typeof rows[0] | null
    api:    typeof rows[0] | null
  }>()

  for (const row of rows) {
    if (!grouped.has(row.modelId)) grouped.set(row.modelId, { manual: null, api: null })
    const entry = grouped.get(row.modelId)!
    if (row.source === 'manual' && !entry.manual) entry.manual = row
    if (row.source === 'openrouter-api' && !entry.api) entry.api = row
  }

  // Include supported models with no prices yet
  for (const modelId of SUPPORTED_MODELS) {
    if (!grouped.has(modelId)) grouped.set(modelId, { manual: null, api: null })
  }

  return Array.from(grouped.entries()).map(([modelId, { manual, api }]) => {
    const priority: 'manual' | 'openrouter-api' = priorityMap[modelId] ?? 'manual'
    // The "active" row is whichever source matches priority, falling back to the other
    const active = (priority === 'manual' ? (manual ?? api) : (api ?? manual))
    return { modelId, manual, api, active, priority }
  })
}

// ── WRITE ACTIONS ─────────────────────────────────────────────────────────────

export async function giveCredits(
  orgId: string,
  amount: number,
  reason: string,
): Promise<{ error?: string }> {
  await requirePlatformOwner()
  if (amount === 0) return { error: 'Amount cannot be zero' }

  await db.insert(schema.creditTransactions).values({
    orgId,
    delta:  amount,
    reason: 'admin_gift',
    refId:  `admin_gift_${orgId}_${Date.now()}`,
  })

  revalidatePath('/dashboard/admin/developers')
  return {}
}

export async function changeOrgPlan(
  orgId: string,
  plan: string,
): Promise<{ error?: string }> {
  await requirePlatformOwner()
  const validPlans = ['free', 'starter', 'pro', 'agency']
  if (!validPlans.includes(plan)) return { error: 'Invalid plan' }

  await db.update(schema.organizations)
    .set({ plan })
    .where(eq(schema.organizations.id, orgId))

  revalidatePath('/dashboard/admin/developers')
  return {}
}

export async function banOrg(
  orgId: string,
  reason: string,
): Promise<{ error?: string }> {
  await requirePlatformOwner()

  await db.update(schema.organizations)
    .set({ bannedAt: new Date(), banReason: reason || 'Suspended by admin' })
    .where(eq(schema.organizations.id, orgId))

  revalidatePath('/dashboard/admin/developers')
  return {}
}

export async function unbanOrg(orgId: string): Promise<{ error?: string }> {
  await requirePlatformOwner()

  await db.update(schema.organizations)
    .set({ bannedAt: null, banReason: null })
    .where(eq(schema.organizations.id, orgId))

  revalidatePath('/dashboard/admin/developers')
  return {}
}

export async function sendPasswordReset(email: string): Promise<{ error?: string }> {
  await requirePlatformOwner()

  try {
    const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/forget-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectTo: '/dashboard/login' }),
    })
    if (!res.ok) return { error: 'Failed to send reset email' }
  } catch {
    return { error: 'Failed to send reset email' }
  }

  return {}
}

export async function refreshModelPrices(): Promise<{ error?: string; count?: number }> {
  await requirePlatformOwner()

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
    })
    if (!res.ok) return { error: `OpenRouter API returned ${res.status}` }

    const json = await res.json() as {
      data: Array<{ id: string; pricing?: { prompt?: string; completion?: string } }>
    }

    const now = new Date()
    // Only fetch prices for models we actually support
    const rows = json.data
      .filter((m) =>
        (SUPPORTED_MODELS as readonly string[]).includes(m.id) &&
        m.pricing?.prompt != null &&
        m.pricing?.completion != null,
      )
      .map((m) => ({
        modelId:              m.id,
        // OpenRouter returns USD per single token; convert to per 1M
        promptPricePer1M:     String(parseFloat(m.pricing!.prompt!) * 1_000_000),
        completionPricePer1M: String(parseFloat(m.pricing!.completion!) * 1_000_000),
        source:               'openrouter-api' as const,
        effectiveFrom:        now,
      }))

    if (rows.length > 0) {
      await db.insert(schema.modelPrices).values(rows)
    }

    revalidatePath('/dashboard/admin/models')
    return { count: rows.length }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function upsertManualModelPrice(
  modelId: string,
  promptPricePer1M: number,
  completionPricePer1M: number,
): Promise<{ error?: string }> {
  await requirePlatformOwner()

  await db.insert(schema.modelPrices).values({
    modelId,
    promptPricePer1M:     String(promptPricePer1M),
    completionPricePer1M: String(completionPricePer1M),
    source:               'manual',
    effectiveFrom:        new Date(),
  })

  revalidatePath('/dashboard/admin/models')
  return {}
}

export async function setModelPricePriority(
  modelId: string,
  priority: 'manual' | 'openrouter-api',
): Promise<{ error?: string }> {
  await requirePlatformOwner()

  // Upsert platformConfig and merge the priority into the JSONB map
  await db
    .insert(schema.platformConfig)
    .values({
      id: 'default',
      systemPrompt: '',
      modelPricePriority: { [modelId]: priority },
    })
    .onConflictDoUpdate({
      target: schema.platformConfig.id,
      set: {
        modelPricePriority: sql`${schema.platformConfig.modelPricePriority} || ${JSON.stringify({ [modelId]: priority })}::jsonb`,
        updatedAt: new Date(),
      },
    })

  revalidatePath('/dashboard/admin/models')
  return {}
}

export async function clearManualModelPrice(modelId: string): Promise<{ error?: string }> {
  await requirePlatformOwner()

  await db.delete(schema.modelPrices)
    .where(and(
      eq(schema.modelPrices.modelId, modelId),
      eq(schema.modelPrices.source, 'manual'),
    ))

  revalidatePath('/dashboard/admin/models')
  return {}
}
