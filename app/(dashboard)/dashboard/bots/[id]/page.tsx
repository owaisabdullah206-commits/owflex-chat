import { notFound } from 'next/navigation'
import { and, count, desc, eq, gte } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { listFaqs } from '@/lib/db/queries/faqs'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { EmbedCodeBlock } from '@/components/dashboard/EmbedCodeBlock'
import { InviteClientDialog } from '@/components/dashboard/InviteClientDialog'
import { StatCard } from '@/components/dashboard/StatCard'
import { ConversationTable } from '@/components/dashboard/ConversationTable'
import { LeadsTable } from '@/components/dashboard/LeadsTable'
import { BotSettingsForm } from '@/components/dashboard/BotSettingsForm'
import { FaqEditor } from '@/components/dashboard/FaqEditor'
import { UnansweredList } from '@/components/dashboard/UnansweredList'
import { Badge } from '@/components/ui/badge'

const TABS = ['Overview', 'Conversations', 'Leads', 'Settings', 'Knowledge Base', 'Unanswered'] as const

interface BotDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function BotDetailPage({ params, searchParams }: BotDetailPageProps) {
  const user = await requireDeveloper()
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const [bot] = await db
    .select({
      id: schema.bots.id,
      name: schema.bots.name,
      systemPrompt: schema.bots.systemPrompt,
      model: schema.bots.model,
      embedKey: schema.bots.embedKey,
      isActive: schema.bots.isActive,
      createdAt: schema.bots.createdAt,
      clientUserId: schema.bots.clientUserId,
      widgetConfig: schema.bots.widgetConfig,
      orgPlan: schema.organizations.plan,
    })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, id), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!bot) notFound()

  const activeTab = tab.toLowerCase()

  // Parallel data fetching for all tabs
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [conversations, leads, convMonthCount, leadsMonthCount, convWeekCount, faqs, unansweredMessages] = await Promise.all([
    db
      .select({
        id: schema.conversations.id,
        pageUrl: schema.conversations.pageUrl,
        startedAt: schema.conversations.startedAt,
        messageCount: schema.conversations.messageCount,
      })
      .from(schema.conversations)
      .where(eq(schema.conversations.botId, bot.id))
      .orderBy(desc(schema.conversations.startedAt))
      .limit(100),
    db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        capturedAt: schema.leads.capturedAt,
        conversationId: schema.leads.conversationId,
      })
      .from(schema.leads)
      .where(eq(schema.leads.botId, bot.id))
      .orderBy(desc(schema.leads.capturedAt)),
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, bot.id), gte(schema.conversations.startedAt, monthStart))),
    db
      .select({ count: count() })
      .from(schema.leads)
      .where(and(eq(schema.leads.botId, bot.id), gte(schema.leads.capturedAt, monthStart))),
    db
      .select({ count: count() })
      .from(schema.conversations)
      .where(and(eq(schema.conversations.botId, bot.id), gte(schema.conversations.startedAt, weekStart))),
    listFaqs(bot.id),
    db
      .select({
        id:             schema.messages.id,
        content:        schema.messages.content,
        createdAt:      schema.messages.createdAt,
        conversationId: schema.messages.conversationId,
      })
      .from(schema.messages)
      .innerJoin(schema.conversations, eq(schema.messages.conversationId, schema.conversations.id))
      .where(and(
        eq(schema.conversations.botId, bot.id),
        eq(schema.messages.flaggedUnanswered, true),
      ))
      .orderBy(desc(schema.messages.createdAt))
      .limit(50),
  ])

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-3 flex-1">
            <a
              href="/dashboard/bots"
              className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              ← Bots
            </a>
            <span className="text-[var(--hairline-md)]">/</span>
            <h1 className="text-lg font-semibold text-[var(--ink)]">{bot.name}</h1>
            <Badge variant={bot.isActive ? 'default' : 'secondary'}>
              {bot.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <InviteClientDialog botId={bot.id} />
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 px-8 border-b border-[var(--hairline)]">
          {TABS.map((t) => {
            const slug = t.toLowerCase()
            const isActive = activeTab === slug
            return (
              <a
                key={t}
                href={`/dashboard/bots/${bot.id}?tab=${slug}`}
                className={`px-3 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'text-[var(--ink)] border-[var(--of-primary)]'
                    : 'text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)]'
                }`}
              >
                {t}
              </a>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="px-8 py-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-2xl">
              {/* Live stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Conversations this month" value={convMonthCount[0]?.count ?? 0} />
                <StatCard label="Leads this month" value={leadsMonthCount[0]?.count ?? 0} />
                <StatCard label="Conversations this week" value={convWeekCount[0]?.count ?? 0} />
              </div>

              {/* Embed code */}
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Embed Script</h2>
                <EmbedCodeBlock embedKey={bot.embedKey} />
                <p className="text-xs text-[var(--ink-muted)] mt-2">
                  Paste this script before the closing{' '}
                  <code style={{ fontFamily: 'var(--font-mono)' }} className="px-1 py-0.5 rounded bg-[var(--surface-2)]">
                    {'</body>'}
                  </code>{' '}
                  tag of any website.
                </p>
              </div>

              {/* Bot details */}
              <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
                <div className="px-5 py-4">
                  <p className="text-xs text-[var(--ink-muted)] mb-1">Embed Key</p>
                  <p className="text-sm text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {bot.embedKey}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-[var(--ink-muted)] mb-1">Model</p>
                  <p className="text-sm text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {bot.model}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-[var(--ink-muted)] mb-1">System Prompt</p>
                  <p className="text-sm text-[var(--ink)] whitespace-pre-wrap">{bot.systemPrompt}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-4">
                All Conversations
                <span className="ml-2 text-[var(--ink-muted)] font-normal" style={{ fontFamily: 'var(--font-mono)' }}>
                  ({conversations.length})
                </span>
              </h2>
              <ConversationTable conversations={conversations} />
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-4">
                All Leads
                <span className="ml-2 text-[var(--ink-muted)] font-normal" style={{ fontFamily: 'var(--font-mono)' }}>
                  ({leads.length})
                </span>
              </h2>
              <LeadsTable leads={leads} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-5">Bot Settings</h2>
              <BotSettingsForm
                botId={bot.id}
                orgPlan={bot.orgPlan}
                initial={{
                  name: bot.name,
                  systemPrompt: bot.systemPrompt,
                  model: bot.model,
                  primaryColor: ((bot.widgetConfig as { primaryColor?: string }) ?? {}).primaryColor ?? '#0EA5E9',
                  position: (((bot.widgetConfig as { position?: string }) ?? {}).position as 'bottom-right' | 'bottom-left') ?? 'bottom-right',
                  welcomeMessage: ((bot.widgetConfig as { welcomeMessage?: string }) ?? {}).welcomeMessage ?? 'Hi! How can I help you today?',
                  leadCaptureEnabled: ((bot.widgetConfig as { leadCaptureEnabled?: boolean }) ?? {}).leadCaptureEnabled !== false,
                  strictMode: ((bot.widgetConfig as { strictMode?: boolean }) ?? {}).strictMode === true,
                }}
              />
            </div>
          )}

          {activeTab === 'knowledge base' && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-1">Knowledge Base</h2>
              <p className="text-xs text-[var(--ink-muted)] mb-5">
                Active entries are injected into the bot&apos;s system prompt on every chat. Changes apply within 5 minutes.
              </p>
              <FaqEditor botId={bot.id} initialFaqs={faqs} />
            </div>
          )}

          {activeTab === 'unanswered' && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-1">Unanswered Questions</h2>
              <p className="text-xs text-[var(--ink-muted)] mb-5">
                Responses where the bot expressed uncertainty. Add FAQ entries to fill these gaps.
              </p>
              <UnansweredList messages={unansweredMessages} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
