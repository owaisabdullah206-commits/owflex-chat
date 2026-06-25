'use server'

import { revalidatePath } from 'next/cache'
import { and, count, desc, eq, inArray, sql, sum } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requirePlatformOwner } from '@/lib/auth/session'
import { SUPPORTED_MODELS, getOrCanonicalIds } from '@/lib/ai/litellm'
import { Redis } from '@upstash/redis'
import { upgradePlanCredits, resetToPlantAllocation, PLAN_CREDIT_ALLOCATIONS, FREE_TIER_CREDITS } from '@/lib/credits'

function getRedis(): Redis {
  return new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

const PKR_PRICES: Record<string, number> = {
  free:       0,
  starter:    2500,
  pro:        7500,
  agency:     20000,
  enterprise: 0,  // custom pricing — excluded from MRR calc
}

// ── READ QUERIES ──────────────────────────────────────────────────────────────

export async function getAllDevelopers() {
  await requirePlatformOwner()

  const rows = await db
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
    })
    .from(schema.users)
    .innerJoin(schema.organizations, eq(schema.organizations.ownerId, schema.users.id))
    .where(eq(schema.users.role, 'developer'))
    .orderBy(desc(schema.users.createdAt))

  if (rows.length === 0) return []

  // Batch-fetch all credit balances from Redis in one mget call.
  // Redis is the authoritative balance source — credit_transactions is an audit log,
  // not a running total (debits and plan upgrades only touch Redis).
  const redis = getRedis()
  const keys  = rows.map((r) => `credits:${r.orgId}`)
  const rawValues = await redis.mget<(number | null)[]>(...keys)

  return rows.map((row, i) => {
    const raw = rawValues[i]
    const creditBalance = raw !== null && raw !== undefined
      ? Number(raw)
      : (PLAN_CREDIT_ALLOCATIONS[row.plan] ?? FREE_TIER_CREDITS)
    return { ...row, creditBalance }
  })
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

      // Plan breakdown for MRR — only orgs owned by developers
      db.select({ plan: schema.organizations.plan, cnt: count() })
        .from(schema.organizations)
        .innerJoin(schema.users, and(
          eq(schema.users.id, schema.organizations.ownerId),
          eq(schema.users.role, 'developer'),
        ))
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

  // Activation: developers who have created at least one bot
  const [activatedDevs] = await db
    .select({ cnt: sql<number>`COUNT(DISTINCT owner_id)::int` })
    .from(schema.organizations)
    .innerJoin(schema.bots, eq(schema.bots.orgId, schema.organizations.id))

  // Short-link total clicks
  const [linkClicks] = await db
    .select({ total: sql<number>`COALESCE(SUM(click_count), 0)::int` })
    .from(schema.shortLinks)

  const totalDevs   = devCount[0]?.total ?? 0
  const activatedCount = activatedDevs?.cnt ?? 0
  const activationRate = totalDevs > 0 ? Math.round((activatedCount / totalDevs) * 100) : 0
  const freeToPaidRate = totalDevs > 0 ? Math.round((paidCount       / totalDevs) * 100) : 0

  // Gross margin % = (creditRevUsd - llmCostUsd) / creditRevUsd * 100
  const grossMarginPct = creditRevUsd > 0
    ? Math.round(((creditRevUsd - llmCostUsd) / creditRevUsd) * 100)
    : null

  return {
    totalDevelopers:    totalDevs,
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
    grossMarginPct,
    newSignupsThisMonth: newSignups[0]?.cnt ?? 0,
    // Monitoring dashboard additions
    activatedDevelopers: activatedCount,
    activationRatePct:   activationRate,
    freeToPaidRatePct:   freeToPaidRate,
    shortLinkClicksTotal: linkClicks?.total ?? 0,
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
      .where(inArray(schema.modelPrices.modelId, [...SUPPORTED_MODELS]))
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

  const redis = getRedis()
  await Promise.all([
    // Update Redis (authoritative balance)
    redis.incrby(`credits:${orgId}`, amount),
    // Log the transaction for audit trail
    db.insert(schema.creditTransactions).values({
      orgId,
      delta:  amount,
      reason: 'admin_gift',
      refId:  `admin_gift_${orgId}_${Date.now()}`,
    }),
  ])

  revalidatePath('/dashboard/admin/developers')
  return {}
}

export async function changeOrgPlan(
  orgId: string,
  plan: string,
): Promise<{ error?: string }> {
  await requirePlatformOwner()
  const validPlans = ['free', 'starter', 'pro', 'agency', 'enterprise']
  if (!validPlans.includes(plan)) return { error: 'Invalid plan' }

  // Read the current plan BEFORE updating so we can compute the credit delta
  const [current] = await db
    .select({ plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, orgId))
    .limit(1)
  const fromPlan = current?.plan ?? 'free'

  await db.update(schema.organizations)
    .set({ plan })
    .where(eq(schema.organizations.id, orgId))

  // Top up (or trim) Redis balance by the difference between the two plan allocations
  await upgradePlanCredits(orgId, fromPlan, plan)

  revalidatePath('/dashboard/admin/developers')
  return {}
}

/**
 * Force-reset an org's Redis credit balance to their current plan's full allocation.
 * Use this when a plan was changed outside the normal payment flow (manual DB edit,
 * legacy migration, etc.) and the Redis balance is out of sync.
 */
export async function syncOrgCredits(
  orgId: string,
): Promise<{ newBalance: number; plan: string; error?: string }> {
  await requirePlatformOwner()

  const [org] = await db
    .select({ plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, orgId))
    .limit(1)

  if (!org) return { newBalance: 0, plan: '', error: 'Org not found' }

  const newBalance = await resetToPlantAllocation(orgId, org.plan)

  revalidatePath('/dashboard/admin/developers')
  return { newBalance, plan: org.plan }
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

// Auto-derived from SUPPORTED_MODELS + OR_CANONICAL_IDS in lib/ai/litellm.ts.
// To add a new model or fix an OR alias, edit litellm.ts — not here.
const OPENROUTER_ID_CANDIDATES: Record<string, string[]> = Object.fromEntries(
  SUPPORTED_MODELS.map((m) => [m, getOrCanonicalIds(m)]),
)

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

    // Build reverse lookup: OpenRouter ID → our LiteLLM model ID
    const orIdToLitellmId = new Map<string, string>()
    for (const [litellmId, candidates] of Object.entries(OPENROUTER_ID_CANDIDATES)) {
      for (const orId of candidates) {
        orIdToLitellmId.set(orId, litellmId)
      }
    }

    const now = new Date()
    const seen = new Set<string>() // deduplicate per LiteLLM ID
    const rows = json.data
      .filter((m) =>
        orIdToLitellmId.has(m.id) &&
        m.pricing?.prompt != null &&
        m.pricing?.completion != null,
      )
      .flatMap((m) => {
        const litellmId = orIdToLitellmId.get(m.id)!
        if (seen.has(litellmId)) return []
        seen.add(litellmId)
        return [{
          modelId:              litellmId,
          // OpenRouter returns USD per single token; convert to per 1M
          promptPricePer1M:     String(parseFloat(m.pricing!.prompt!) * 1_000_000),
          completionPricePer1M: String(parseFloat(m.pricing!.completion!) * 1_000_000),
          source:               'openrouter-api' as const,
          effectiveFrom:        now,
        }]
      })

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

// ── Per-message latency for one model (last 30 days, with delta) ─────────────
export async function getModelMessageLatency(model: string, days = 30) {
  await requirePlatformOwner()

  const rows = await db.execute<{
    id:           string
    latency_ms:   number
    delta_ms:     number | null  // null for the very first row
    tokens_used:  number
    input_tokens: number
    output_tokens: number
    ms_per_token: number | null
    cost_usd:     string
    bot_name:     string
    bot_id:       string
    created_at:   string
  }>(sql`
    SELECT
      m.id,
      m.latency_ms,
      (m.latency_ms - LAG(m.latency_ms) OVER (ORDER BY m.created_at ASC)) AS delta_ms,
      m.tokens_used,
      m.input_tokens,
      m.output_tokens,
      m.cost_usd,
      b.name   AS bot_name,
      b.id     AS bot_id,
      m.created_at,
      -- ms-per-output-token: proxy for generation speed (lower = faster GPU)
      CASE WHEN m.output_tokens > 0
           THEN ROUND(m.latency_ms::numeric / m.output_tokens, 1)
           ELSE NULL
      END AS ms_per_token
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN bots          b ON b.id = c.bot_id
    WHERE m.role       = 'assistant'
      AND m.model_used = ${model}
      AND m.latency_ms IS NOT NULL
      AND m.created_at > NOW() - INTERVAL '1 day' * ${days}
    ORDER BY m.created_at DESC
    LIMIT 500
  `)

  return rows.rows
}

// ── Model latency stats (last 30 days) ────────────────────────────────────────
export async function getModelLatencyStats() {
  await requirePlatformOwner()

  const rows = await db.execute<{
    model:         string
    message_count: number
    avg_ms:        number
    p50_ms:        number
    p95_ms:        number
    min_ms:        number
    max_ms:        number
  }>(sql`
    SELECT
      model_used                                                           AS model,
      COUNT(*)::int                                                        AS message_count,
      ROUND(AVG(latency_ms))::int                                         AS avg_ms,
      PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY latency_ms)::int      AS p50_ms,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::int      AS p95_ms,
      MIN(latency_ms)::int                                                AS min_ms,
      MAX(latency_ms)::int                                                AS max_ms
    FROM messages
    WHERE role       = 'assistant'
      AND latency_ms IS NOT NULL
      AND model_used IS NOT NULL
      AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY model_used
    ORDER BY message_count DESC
  `)

  return rows.rows
}

/**
 * Returns the latest active price for each supported model, grouped by modelId.
 * Used by the bot settings page to warn about expensive model selections.
 * Does NOT require platform owner auth (unlike getModelPrices).
 */
export async function getModelPriceSummary(): Promise<Record<string, { prompt: number; completion: number }>> {
  const rows = await db
    .select()
    .from(schema.modelPrices)
    .where(inArray(schema.modelPrices.modelId, [...SUPPORTED_MODELS]))

  // Last write wins — rows from DB are in insertion order, so later entries
  // (more recently refreshed) overwrite earlier ones.
  const latest = new Map<string, typeof rows[0]>()
  for (const row of rows) {
    latest.set(row.modelId, row)
  }

  const result: Record<string, { prompt: number; completion: number }> = {}
  for (const modelId of SUPPORTED_MODELS) {
    const price = latest.get(modelId)
    if (price) {
      result[modelId] = {
        prompt:     parseFloat(price.promptPricePer1M),
        completion: parseFloat(price.completionPricePer1M),
      }
    }
  }
  return result
}
