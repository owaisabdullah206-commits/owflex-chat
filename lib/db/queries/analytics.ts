import { and, avg, count, desc, eq, gte, isNotNull, ne, sql, sum } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export async function getBotAnalytics(botId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [totals, escalated, avgMsgCount, unansweredCount, recentConvs] = await Promise.all([
    // Total conversations + messages in period
    db
      .select({
        conversations: count(schema.conversations.id),
        messages:      sql<number>`sum(${schema.conversations.messageCount})`,
      })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, since))),

    // Escalated (needs_human) — safe if column doesn't exist yet
    db
      .select({ count: sql<number>`count(*) FILTER (WHERE COALESCE(${schema.conversations.needsHuman}, false) = true)` })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, since))),

    // Avg messages per conversation
    db
      .select({ avg: avg(schema.conversations.messageCount) })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, since))),

    // Unanswered messages count
    db
      .select({ count: count() })
      .from(schema.messages)
      .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
      .where(and(
        eq(schema.conversations.botId, botId),
        eq(schema.messages.flaggedUnanswered, true),
        gte(schema.messages.createdAt, since),
      )),

    // 10 most recent conversations with message counts
    db
      .select({
        id:           schema.conversations.id,
        sessionId:    schema.conversations.sessionId,
        startedAt:    schema.conversations.startedAt,
        messageCount: schema.conversations.messageCount,
        needsHuman:   sql<boolean>`COALESCE(${schema.conversations.needsHuman}, false)`,
      })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, since)))
      .orderBy(desc(schema.conversations.startedAt))
      .limit(10),
  ])

  const totalConversations = totals[0]?.conversations ?? 0
  const totalMessages      = Number(totals[0]?.messages ?? 0)
  const escalatedCount     = escalated[0]?.count ?? 0
  const avgMessages        = parseFloat(avgMsgCount[0]?.avg ?? '0') || 0
  const unanswered         = unansweredCount[0]?.count ?? 0

  return {
    totalConversations,
    totalMessages,
    escalatedCount,
    avgMessagesPerConv: Math.round(avgMessages * 10) / 10,
    unansweredCount:    unanswered,
    resolutionRate:     totalConversations > 0
      ? Math.round(((totalConversations - escalatedCount) / totalConversations) * 100)
      : 100,
    recentConversations: recentConvs,
  }
}

// ── Per-page breakdown ────────────────────────────────────────────────────────

export async function getPageBreakdown(botId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      pageUrl:      schema.conversations.pageUrl,
      conversations: count(schema.conversations.id),
      messages:      sql<number>`COALESCE(SUM(${schema.conversations.messageCount}), 0)::int`,
      escalated:     sql<number>`COUNT(*) FILTER (WHERE COALESCE(${schema.conversations.needsHuman}, false) = true)::int`,
    })
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.botId, botId),
        gte(schema.conversations.startedAt, since),
        isNotNull(schema.conversations.pageUrl),
        ne(schema.conversations.pageUrl, ''),
      ),
    )
    .groupBy(schema.conversations.pageUrl)
    .orderBy(sql`count(${schema.conversations.id}) DESC`)
    .limit(20)

  return rows.map((r) => ({
    pageUrl:       r.pageUrl ?? '',
    conversations: r.conversations,
    messages:      Number(r.messages),
    escalated:     Number(r.escalated),
    escalationPct: r.conversations > 0
      ? Math.round((Number(r.escalated) / r.conversations) * 100)
      : 0,
  }))
}

// ── Rating summary ────────────────────────────────────────────────────────────

export async function getBotRatingSummary(botId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [result] = await db
    .select({
      thumbsUp:   sql<number>`COUNT(*) FILTER (WHERE ${schema.messages.rating} = 1)::int`,
      thumbsDown: sql<number>`COUNT(*) FILTER (WHERE ${schema.messages.rating} = -1)::int`,
    })
    .from(schema.messages)
    .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
    .where(
      and(
        eq(schema.conversations.botId, botId),
        gte(schema.messages.createdAt, since),
        isNotNull(schema.messages.rating),
      ),
    )

  return {
    thumbsUp:   Number(result?.thumbsUp ?? 0),
    thumbsDown: Number(result?.thumbsDown ?? 0),
  }
}

// ── Per-bot monthly usage stats ───────────────────────────────────────────────

export async function getBotUsage(botId: string) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [convRow, msgRow, tokenRow, costRow, creditRow, leadRow, modelRows] = await Promise.all([
    // Conversations this month
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, monthStart))),

    // Messages this month
    db
      .select({ total: sql<number>`COALESCE(SUM(${schema.conversations.messageCount}), 0)::int` })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, botId), gte(schema.conversations.startedAt, monthStart))),

    // Tokens this month (via messages → conversations join)
    db
      .select({ total: sql<number>`COALESCE(SUM(${schema.messages.tokensUsed}), 0)::int` })
      .from(schema.messages)
      .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
      .where(and(eq(schema.conversations.botId, botId), gte(schema.messages.createdAt, monthStart))),

    // Cost this month (USD)
    db
      .select({ total: sql<string>`COALESCE(SUM(${schema.messages.costUsd}), 0)` })
      .from(schema.messages)
      .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
      .where(and(eq(schema.conversations.botId, botId), gte(schema.messages.createdAt, monthStart))),

    // Credits used this month (from routing decisions)
    db
      .select({ total: sql<number>`COALESCE(SUM(${schema.routingDecisions.creditCost}), 0)::int` })
      .from(schema.routingDecisions)
      .where(and(eq(schema.routingDecisions.botId, botId), gte(schema.routingDecisions.createdAt, monthStart))),

    // Leads this month
    db
      .select({ count: count() })
      .from(schema.leads)
      .where(and(eq(schema.leads.botId, botId), gte(schema.leads.capturedAt, monthStart), eq(schema.leads.hiddenByLimit, false))),

    // Model breakdown — how many messages per model
    db
      .select({
        model: schema.messages.modelUsed,
        messages: count(),
        tokens: sql<number>`COALESCE(SUM(${schema.messages.tokensUsed}), 0)::int`,
        cost: sql<string>`COALESCE(SUM(${schema.messages.costUsd}), 0)`,
      })
      .from(schema.messages)
      .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
      .where(and(
        eq(schema.conversations.botId, botId),
        gte(schema.messages.createdAt, monthStart),
        isNotNull(schema.messages.modelUsed),
      ))
      .groupBy(schema.messages.modelUsed)
      .orderBy(sql`count(*) DESC`)
      .limit(10),
  ])

  return {
    conversations: convRow[0]?.count ?? 0,
    messages: msgRow[0]?.total ?? 0,
    tokens: tokenRow[0]?.total ?? 0,
    costUsd: parseFloat(costRow[0]?.total ?? '0'),
    creditsUsed: creditRow[0]?.total ?? 0,
    leads: leadRow[0]?.count ?? 0,
    modelBreakdown: modelRows.map((r) => ({
      model: r.model ?? 'unknown',
      messages: r.messages,
      tokens: r.tokens,
      costUsd: parseFloat(r.cost ?? '0'),
    })),
  }
}
