import { Redis } from '@upstash/redis'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { sendCreditGraceEmail } from '@/lib/email/credit-grace'

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

function graceKey(orgId: string, yyyyMM: string): string {
  return `credit_grace:${orgId}:${yyyyMM}`
}

function graceUsedKey(orgId: string, yyyyMM: string): string {
  return `credit_grace_used:${orgId}:${yyyyMM}`
}

function currentYYYYMM(): string {
  return new Date().toISOString().slice(0, 7)
}

export type GraceAction = 'fallback' | 'disable'

export async function handleCreditExhaustion(
  orgId: string,
  orgPlan: string,
  botName: string,
): Promise<{ action: GraceAction }> {
  try {
    // Free plan: Flash → Flash — no grace, no email, no disable
    if (orgPlan === 'free') return { action: 'fallback' }

    const redis = getRedis()
    const yyyyMM = currentYYYYMM()
    const activeKey = graceKey(orgId, yyyyMM)
    const usedKey = graceUsedKey(orgId, yyyyMM)

    // Check if grace is currently active (TTL > 0)
    const graceTtl = await redis.ttl(activeKey)
    if (graceTtl > 0) return { action: 'fallback' }

    // Check if grace was already consumed this cycle (key exists, grace expired)
    const graceUsed = await redis.get(usedKey)
    if (graceUsed !== null) return { action: 'disable' }

    // First exhaustion this billing cycle — start grace period
    await Promise.all([
      redis.set(activeKey, 1, { nx: true, ex: 7200 }),
      redis.set(usedKey, 1, { nx: true }),
    ])

    // Fetch org owner's email (only runs on first exhaustion)
    try {
      const [owner] = await db
        .select({ email: schema.users.email, name: schema.users.name })
        .from(schema.organizations)
        .innerJoin(schema.users, eq(schema.organizations.ownerId, schema.users.id))
        .where(eq(schema.organizations.id, orgId))
        .limit(1)

      if (owner?.email) {
        void sendCreditGraceEmail({ to: owner.email, botName })
      }
    } catch (emailErr) {
      console.error('[grace] failed to send grace email:', emailErr)
    }

    return { action: 'fallback' }
  } catch (err) {
    console.error('[grace] handleCreditExhaustion error:', err)
    // Fail open — return fallback to avoid breaking the widget
    return { action: 'fallback' }
  }
}
