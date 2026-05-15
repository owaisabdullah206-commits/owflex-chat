import { desc, eq } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { TopNav } from '@/components/portal/TopNav'
import { ConversationList } from '@/components/portal/ConversationList'

export default async function ConversationsPage() {
  const user = await requireClient()

  const [bot] = await db
    .select({ id: schema.bots.id, name: schema.bots.name })
    .from(schema.bots)
    .where(eq(schema.bots.clientUserId, user.id))
    .limit(1)

  const conversations = bot
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

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <TopNav userEmail={user.email} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold text-[var(--ink)] mb-6">Conversations</h1>
        <ConversationList conversations={conversations} />
      </div>
    </div>
  )
}
