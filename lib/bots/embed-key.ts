import { and, eq, gte, or } from 'drizzle-orm'
import { schema } from '@/lib/db'

// After rotation the previous key keeps working for this long, so already-deployed
// widgets stay live while the developer pushes the new key to production.
export const EMBED_KEY_GRACE_MS = 24 * 60 * 60 * 1000

// pk_ prefix + 29 hex chars = 32 chars total (matches createBot()).
export function generateEmbedKey(): string {
  return 'pk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 29)
}

/**
 * Drizzle condition that matches a bot by its live embed key, OR by a key that
 * was rotated within the last 24h grace window. Drop-in replacement for
 * `eq(schema.bots.embedKey, key)` in the public resolution routes.
 */
export function embedKeyMatch(key: string) {
  const graceStart = new Date(Date.now() - EMBED_KEY_GRACE_MS)
  return or(
    eq(schema.bots.embedKey, key),
    and(
      eq(schema.bots.previousEmbedKey, key),
      gte(schema.bots.embedKeyRotatedAt, graceStart),
    ),
  )
}
