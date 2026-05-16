import { and, count, eq, gte, lt } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export interface PortalStats {
  conversationsThisMonth: number
  leadsThisMonth: number
  conversationsThisWeek: number
  convMonthDelta: number | null
  leadsMonthDelta: number | null
}

export async function getPortalStats(botId: string): Promise<PortalStats> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [convMonth, leadsMonth, convWeek, convPrevMonth, leadsPrevMonth] = await Promise.all([
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, monthStart))),
    db
      .select({ count: count() })
      .from(schema.leads)
      .where(and(eq(schema.leads.botId, botId), gte(schema.leads.capturedAt, monthStart))),
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, weekStart))),
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(and(
        eq(schema.conversations.botId, botId),
        gte(schema.conversations.startedAt, prevMonthStart),
        lt(schema.conversations.startedAt, monthStart),
      )),
    db
      .select({ count: count() })
      .from(schema.leads)
      .where(and(
        eq(schema.leads.botId, botId),
        gte(schema.leads.capturedAt, prevMonthStart),
        lt(schema.leads.capturedAt, monthStart),
      )),
  ])

  const current = convMonth[0]?.count ?? 0
  const prev = convPrevMonth[0]?.count ?? 0
  const currentLeads = leadsMonth[0]?.count ?? 0
  const prevLeads = leadsPrevMonth[0]?.count ?? 0

  return {
    conversationsThisMonth: current,
    leadsThisMonth: currentLeads,
    conversationsThisWeek: convWeek[0]?.count ?? 0,
    convMonthDelta: prev === 0 ? null : Math.round(((current - prev) / prev) * 100),
    leadsMonthDelta: prevLeads === 0 ? null : Math.round(((currentLeads - prevLeads) / prevLeads) * 100),
  }
}
