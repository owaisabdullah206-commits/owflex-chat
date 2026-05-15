import { Redis } from '@upstash/redis'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

const FREE_TIER_CREDITS = 50_000

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

function creditKey(orgId: string): string {
  return `credits:${orgId}`
}

export async function getBalance(orgId: string): Promise<number> {
  const redis = getRedis()
  const val = await redis.get<number>(creditKey(orgId))
  return val !== null ? Number(val) : FREE_TIER_CREDITS
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

export async function getAllFreeOrgIds(): Promise<string[]> {
  const rows = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.plan, 'free'))
  return rows.map((r) => r.id)
}
