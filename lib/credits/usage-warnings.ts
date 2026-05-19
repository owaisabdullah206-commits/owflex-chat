import { Redis } from '@upstash/redis'
import { sendUsageWarningEmail } from '@/lib/email/usage-warning'

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

type Metric = 'conversations' | 'credits' | 'leads'

export async function checkAndWarnUsage(
  orgId: string,
  metric: Metric,
  currentCount: number,
  limit: number,
  planName: string,
  developerEmail: string,
): Promise<void> {
  try {
    if (!limit || limit === Infinity) return

    const pct = Math.floor((currentCount / limit) * 100)

    const thresholdMet =
      metric === 'credits'
        ? pct <= 10   // credits: warn when ≤ 10% remaining
        : pct >= 90   // conversations/leads: warn when ≥ 90% used

    if (!thresholdMet) return

    const yyyyMM = new Date().toISOString().slice(0, 7)
    const redis = getRedis()
    const key = `limit_warn:${orgId}:${metric}:${yyyyMM}`
    const set = await redis.set(key, 1, { nx: true })

    if (set) {
      void sendUsageWarningEmail({
        to: developerEmail,
        metric,
        pctUsed: metric === 'credits' ? 100 - pct : pct,
        remaining: limit - currentCount,
        planName,
      })
    }
  } catch (err) {
    console.error('[usage-warnings] checkAndWarnUsage error:', err)
  }
}
