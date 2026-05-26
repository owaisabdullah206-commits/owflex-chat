import { Redis } from '@upstash/redis'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { STRONG_MODEL } from '@/lib/ai/litellm'

export const FREE_TIER_CREDITS = 2_000_000

// The seed value used before the 2 M fix (May 2026).
// Used only in the one-time legacy-correction migration — do not reference elsewhere.
const LEGACY_FREE_SEED = 50_000

export const PLAN_CREDIT_ALLOCATIONS: Record<string, number> = {
  free:       2_000_000,
  starter:    30_000_000,
  pro:        150_000_000,
  agency:     750_000_000,
  enterprise: 750_000_000,
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

function creditKey(orgId: string): string {
  return `credits:${orgId}`
}

export async function getBalance(orgId: string, plan?: string): Promise<number> {
  const redis = getRedis()
  const val = await redis.get<number>(creditKey(orgId))
  if (val !== null) return Number(val)
  // Redis key missing — return the plan's full allocation so the UI is accurate
  return plan ? (PLAN_CREDIT_ALLOCATIONS[plan] ?? FREE_TIER_CREDITS) : FREE_TIER_CREDITS
}

export async function debit(
  orgId: string,
  estimate: number,
): Promise<{ ok: boolean; balance: number }> {
  const redis = getRedis()
  const key = creditKey(orgId)

  // Check current value before debiting
  const raw = await redis.get<number>(key)
  const current = raw !== null ? Number(raw) : null

  // Key is missing OR stuck at 0 from prior undo cycles with no real usage → reinitialize
  if (current === null || current === 0) {
    const hasTx = await db
      .select({ id: schema.creditTransactions.id })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.orgId, orgId))
      .limit(1)
    if (hasTx.length === 0) {
      await redis.set(key, FREE_TIER_CREDITS)
    }
  }

  const newBalance = await redis.decrby(key, estimate)
  if (newBalance < 0) {
    await redis.incrby(key, estimate)
    return { ok: false, balance: newBalance + estimate }
  }
  return { ok: true, balance: newBalance }
}

export async function refund(orgId: string, amount: number): Promise<void> {
  const redis = getRedis()
  await redis.incrby(creditKey(orgId), amount)
}

export async function logTransaction(
  orgId: string,
  delta: number,
  reason: string,
  refId?: string,
): Promise<void> {
  await db.insert(schema.creditTransactions).values({ orgId, delta, reason, refId }).onConflictDoNothing()
}

export async function resetFreeCredits(orgId: string): Promise<void> {
  const redis = getRedis()
  await redis.set(creditKey(orgId), FREE_TIER_CREDITS)
}

export async function initBalanceIfMissing(orgId: string): Promise<void> {
  const redis = getRedis()
  // SET NX — only sets if key does not exist, preserving accumulated balance
  await redis.set(creditKey(orgId), FREE_TIER_CREDITS, { nx: true })
}

const STRONG_MODEL_MULTIPLIER = 5

export function getDebitAmountForModel(modelId: string, baseEstimate: number): number {
  if (modelId === STRONG_MODEL) return baseEstimate * STRONG_MODEL_MULTIPLIER
  return baseEstimate
}

/**
 * Apply the credit delta when an org upgrades (or downgrades) their plan.
 * Uses INCRBY so any accumulated balance is preserved — only the gap between
 * the old plan's allocation and the new one is added/subtracted.
 *
 * Example: free (2 M) → agency (750 M) adds exactly 748 M credits.
 */
export async function upgradePlanCredits(
  orgId: string,
  fromPlan: string,
  toPlan: string,
): Promise<void> {
  const fromAlloc = PLAN_CREDIT_ALLOCATIONS[fromPlan] ?? FREE_TIER_CREDITS
  const toAlloc   = PLAN_CREDIT_ALLOCATIONS[toPlan]   ?? FREE_TIER_CREDITS
  const delta = toAlloc - fromAlloc
  if (delta === 0) return
  const redis = getRedis()
  await redis.incrby(creditKey(orgId), delta)
}

/**
 * One-time migration helper: corrects a legacy org whose Redis key was seeded
 * with LEGACY_FREE_SEED (50 K) instead of the correct FREE_TIER_CREDITS (2 M).
 *
 * Formula:
 *   delta = PLAN_CREDIT_ALLOCATIONS[currentPlan] - LEGACY_FREE_SEED
 *
 * This works for ANY plan the org is currently on:
 *   - Still free (2 M) → adds 1 950 000 so they reach the correct basis
 *   - Upgraded to agency (750 M) → adds 749 950 000, giving balance = 750 M - actual_debits ✓
 *
 * Safe to call multiple times: only applies if the current Redis balance ≤ LEGACY_FREE_SEED
 * (i.e. the org was seeded with the old 50 K value and has not been corrected yet).
 */
export async function correctLegacyOrgCredits(
  orgId: string,
  currentPlan: string,
): Promise<{ corrected: boolean; delta: number; newBalance: number }> {
  const redis = getRedis()
  const key   = creditKey(orgId)
  const raw   = await redis.get<number>(key)
  const balance = raw !== null ? Number(raw) : null

  // Skip if Redis key is absent (new org, no activity) or already above the old seed
  if (balance === null || balance > LEGACY_FREE_SEED) {
    return { corrected: false, delta: 0, newBalance: balance ?? 0 }
  }

  const allocation = PLAN_CREDIT_ALLOCATIONS[currentPlan] ?? FREE_TIER_CREDITS
  const delta = allocation - LEGACY_FREE_SEED
  if (delta <= 0) return { corrected: false, delta: 0, newBalance: balance }

  const newBalance = await redis.incrby(key, delta)
  return { corrected: true, delta, newBalance }
}

export async function getAllFreeOrgIds(): Promise<string[]> {
  const rows = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.plan, 'free'))
  return rows.map((r) => r.id)
}
