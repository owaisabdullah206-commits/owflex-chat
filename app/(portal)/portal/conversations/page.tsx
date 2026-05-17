import { asc, desc, eq, inArray } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { TopNav } from '@/components/portal/TopNav'
import { ConversationList } from '@/components/portal/ConversationList'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ bot?: string }>
}) {
  const user = await requireClient()
  const { bot: botParam } = await searchParams

  const bots = await db
    .select({ id: schema.bots.id, name: schema.bots.name })
    .from(schema.bots)
    .where(eq(schema.bots.clientUserId, user.id))

  const bot = (botParam ? bots.find((b) => b.id === botParam) : null) ?? bots[0] ?? null

  const rawConversations = bot
    ? await db
        .select({
          id: schema.conversations.id,
          pageUrl: schema.conversations.pageUrl,
          startedAt: schema.conversations.startedAt,
          messageCount: schema.conversations.messageCount,
        })
        .from(schema.conversations)
        .where(eq(schema.conversations.botId, bot.id))
        .orderBy(desc(schema.conversations.startedAt))
    : []

  let conversations: (typeof rawConversations[number] & {
    hasLead: boolean
    preview: string | null
  })[] = rawConversations.map((c) => ({ ...c, hasLead: false, preview: null }))

  if (rawConversations.length > 0) {
    const convIds = rawConversations.map((c) => c.id)

    const [leadRows, previewRows] = await Promise.all([
      db
        .selectDistinct({ conversationId: schema.leads.conversationId })
        .from(schema.leads)
        .where(inArray(schema.leads.conversationId, convIds)),
      db
        .select({
          conversationId: schema.messages.conversationId,
          content: schema.messages.content,
        })
        .from(schema.messages)
        .where(
          inArray(schema.messages.conversationId, convIds),
        )
        .orderBy(asc(schema.messages.createdAt)),
    ])

    const leadSet = new Set(leadRows.map((r) => r.conversationId))
    const previewMap = new Map<string, string>()
    for (const msg of previewRows) {
      if (!previewMap.has(msg.conversationId)) {
        previewMap.set(msg.conversationId, msg.content.slice(0, 80))
      }
    }

    conversations = rawConversations.map((c) => ({
      ...c,
      hasLead: leadSet.has(c.id),
      preview: previewMap.get(c.id) ?? null,
    }))
  }

  return (
    <div className="min-h-screen">
      <AutoRefresh intervalMs={30_000} />
      <TopNav userEmail={user.email} userName={user.name} bots={bots} activeBotId={bot?.id} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[var(--ink)]">Conversations</h1>
          <RefreshButton />
        </div>
        <ConversationList conversations={conversations} />
      </div>
    </div>
  )
}
