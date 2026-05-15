import { and, count, desc, eq, gte, inArray } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export interface WeeklyStats {
  conversationCount: number
  leadCount: number
  unansweredQuestions: Array<{ content: string; conversationId: string; createdAt: Date }>
}

export async function getWeeklyStats(orgId: string): Promise<WeeklyStats> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Get all bot IDs for the org
  const orgBots = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .where(eq(schema.bots.orgId, orgId))

  if (orgBots.length === 0) {
    return { conversationCount: 0, leadCount: 0, unansweredQuestions: [] }
  }

  const botIds = orgBots.map((b) => b.id)

  const [convResult, leadResult, unanswered] = await Promise.all([
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(and(inArray(schema.conversations.botId, botIds), gte(schema.conversations.startedAt, since))),
    db
      .select({ count: count() })
      .from(schema.leads)
      .where(and(inArray(schema.leads.botId, botIds), gte(schema.leads.capturedAt, since))),
    db
      .select({
        content:        schema.messages.content,
        conversationId: schema.messages.conversationId,
        createdAt:      schema.messages.createdAt,
      })
      .from(schema.messages)
      .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
      .where(and(
        inArray(schema.conversations.botId, botIds),
        eq(schema.messages.flaggedUnanswered, true),
        gte(schema.messages.createdAt, since),
      ))
      .orderBy(desc(schema.messages.createdAt))
      .limit(3),
  ])

  return {
    conversationCount: convResult[0]?.count ?? 0,
    leadCount:         leadResult[0]?.count ?? 0,
    unansweredQuestions: unanswered,
  }
}
