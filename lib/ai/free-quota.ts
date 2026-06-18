/**
 * Tracks OpenRouter :free variant usage against the known hard limits:
 *   20 req/min  (does NOT increase with $10 deposit)
 *   1000 req/day (requires $10 deposit; 50/day without)
 *
 * When either counter is at/above the limit we skip the :free variant
 * and route straight to the paid model — avoiding the 429 round-trip
 * latency hit that would otherwise add ~500ms before the paid fallback.
 *
 * Counters are shared across the entire platform (one OpenRouter key).
 * Slight over-counting under concurrent load is acceptable — the paid
 * fallback is always safe.
 */
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const FREE_RPM_LIMIT = 20
export const FREE_RPD_LIMIT = 1000

function quotaKeys() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const minute = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`
  return {
    rpm: `or:free:rpm:${minute}`,
    rpd: `or:free:rpd:${minute.slice(0, 8)}`,
  }
}

/** Returns true if both the per-minute and per-day free quotas have headroom. */
export async function canUseFree(): Promise<boolean> {
  try {
    const { rpm: rpmKey, rpd: rpdKey } = quotaKeys()
    const [rpmVal, rpdVal] = await Promise.all([
      redis.get<string>(rpmKey),
      redis.get<string>(rpdKey),
    ])
    const rpm = parseInt(rpmVal ?? '0') || 0
    const rpd = parseInt(rpdVal ?? '0') || 0
    return rpm < FREE_RPM_LIMIT && rpd < FREE_RPD_LIMIT
  } catch {
    return false // Redis unavailable — skip free to be safe
  }
}

/**
 * Increments both the per-minute and per-day counters.
 * Call fire-and-forget after deciding to use the free variant.
 * Sets TTL on first write: 2 min for RPM key, 25 h for RPD key.
 */
export async function trackFreeRequest(): Promise<void> {
  try {
    const { rpm: rpmKey, rpd: rpdKey } = quotaKeys()
    await Promise.all([
      redis.incr(rpmKey).then(async (v) => { if (v === 1) await redis.expire(rpmKey, 120) }),
      redis.incr(rpdKey).then(async (v) => { if (v === 1) await redis.expire(rpdKey, 90_000) }),
    ])
  } catch {
    // non-critical — ignore
  }
}

/** Returns live {rpm, rpd} counts for the admin dashboard. */
export async function getFreeQuotaUsage(): Promise<{ rpm: number; rpd: number }> {
  try {
    const { rpm: rpmKey, rpd: rpdKey } = quotaKeys()
    const [rpmVal, rpdVal] = await Promise.all([
      redis.get<string>(rpmKey),
      redis.get<string>(rpdKey),
    ])
    return {
      rpm: parseInt(rpmVal ?? '0') || 0,
      rpd: parseInt(rpdVal ?? '0') || 0,
    }
  } catch {
    return { rpm: 0, rpd: 0 }
  }
}
