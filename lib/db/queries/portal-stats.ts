import { and, count, eq, gte, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export interface PortalStats {
  conversationsThisMonth: number
  leadsThisMonth: number
  conversationsThisWeek: number
}

export async function getPortalStats(botId: string): Promise<PortalStats> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [convMonth, leadsMonth, convWeek] = await Promise.all([
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.botId, botId),
          gte(schema.conversations.startedAt, monthStart),
        ),
      ),
    db
      .select({ count: count() })
      .from(schema.leads)
      .where(
        and(
          eq(schema.leads.botId, botId),
          gte(schema.leads.capturedAt, monthStart),
        ),
      ),
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.botId, botId),
          gte(schema.conversations.startedAt, weekStart),
        ),
      ),
  ])

  return {
    conversationsThisMonth: convMonth[0]?.count ?? 0,
    leadsThisMonth: leadsMonth[0]?.count ?? 0,
    conversationsThisWeek: convWeek[0]?.count ?? 0,
  }
}
