import { notFound, redirect } from 'next/navigation'
import { and, asc, eq } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { TopNav } from '@/components/portal/TopNav'
import type { PortalConfig } from '@/components/portal/TopNav'
import { ChatTranscript } from '@/components/portal/ChatTranscript'
import { ClientDate } from '@/components/shared/ClientDate'

interface ConversationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const user = await requireClient()
  const { id } = await params

  // Tenant-isolated query: conversation must belong to a bot assigned to this client
  const [conversation] = await db
    .select({
      id:           schema.conversations.id,
      pageUrl:      schema.conversations.pageUrl,
      startedAt:    schema.conversations.startedAt,
      botName:      schema.bots.name,
      portalConfig: schema.bots.portalConfig,
    })
    .from(schema.conversations)
    .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
    .where(
      and(
        eq(schema.conversations.id, id),
        eq(schema.bots.clientUserId, user.id),
      ),
    )
    .limit(1)

  if (!conversation) notFound()

  const portalConfig = (conversation.portalConfig ?? null) as PortalConfig | null
  if (portalConfig?.showConversations === false) redirect('/portal')

  const messages = await db
    .select({
      id: schema.messages.id,
      role: schema.messages.role,
      content: schema.messages.content,
      createdAt: schema.messages.createdAt,
    })
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, id))
    .orderBy(asc(schema.messages.createdAt))

  return (
    <div className="min-h-screen">
      <TopNav userEmail={user.email} userName={user.name} portalConfig={portalConfig} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <a
            href="/portal/conversations"
            className="text-sm text-[var(--of-primary-text-light)] hover:underline"
          >
            ← All conversations
          </a>
          <div className="mt-3">
            <h1 className="text-lg font-bold text-[var(--ink)]">
              <ClientDate iso={conversation.startedAt} opts={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }} />
            </h1>
            {conversation.pageUrl && (
              <p className="text-xs text-[var(--ink-muted)] mt-0.5 truncate">
                {conversation.pageUrl}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
          <div className="h-0.5 bg-[var(--of-primary)]" />
          <div className="p-4 sm:p-6">
            <ChatTranscript messages={messages} botName={conversation.botName} />
          </div>
        </div>
      </div>
    </div>
  )
}
