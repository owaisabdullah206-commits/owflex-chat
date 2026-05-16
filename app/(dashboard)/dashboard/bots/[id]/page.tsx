import { notFound } from 'next/navigation'
import { and, count, desc, eq, gte } from 'drizzle-orm'
import { ChevronLeft } from 'lucide-react'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { listFaqs } from '@/lib/db/queries/faqs'
import { Suspense } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { OnboardingBanner } from '@/components/dashboard/OnboardingBanner'
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel'
import { EmbedCodeBlock } from '@/components/dashboard/EmbedCodeBlock'
import { InviteClientDialog } from '@/components/dashboard/InviteClientDialog'
import { StatCard } from '@/components/dashboard/StatCard'
import { ConversationTable } from '@/components/dashboard/ConversationTable'
import { LeadsTable } from '@/components/dashboard/LeadsTable'
import { BotSettingsForm } from '@/components/dashboard/BotSettingsForm'
import { BotToggle } from '@/components/dashboard/BotToggle'
import { DeleteBotButton } from '@/components/dashboard/DeleteBotButton'
import { FaqEditor } from '@/components/dashboard/FaqEditor'
import { UnansweredList } from '@/components/dashboard/UnansweredList'
import { DocumentsTab } from '@/components/dashboard/DocumentsTab'
import { SmartRoutingToggle } from '@/components/dashboard/SmartRoutingToggle'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

const TABS = ['Overview', 'Conversations', 'Leads', 'Settings', 'Knowledge Base', 'Documents', 'Unanswered'] as const

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
      orgId: schema.bots.orgId,
      orgPlan: schema.organizations.plan,
      smartRoutingEnabled: schema.bots.smartRoutingEnabled,
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
      <AutoRefresh intervalMs={30_000} />
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-3 flex-1">
            <a
              href="/dashboard/bots"
              className="inline-flex items-center gap-1 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Bots
            </a>
            <span className="text-[var(--hairline-md)]">/</span>
            <h1 className="text-lg font-semibold text-[var(--ink)]">{bot.name}</h1>
            <BotToggle botId={bot.id} initialActive={bot.isActive} />
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton />
            <InviteClientDialog botId={bot.id} />
            <DeleteBotButton botId={bot.id} botName={bot.name} />
          </div>
        </div>

        {/* Onboarding banner */}
        <Suspense fallback={null}>
          <OnboardingBanner botId={bot.id} />
        </Suspense>

        {/* Tab nav */}
        <div className="flex gap-1 px-4 sm:px-8 border-b border-[var(--hairline)] overflow-x-auto">
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
        <div className="px-4 sm:px-8 py-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="xl:col-span-2 space-y-6">
                {/* Live stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <p className="text-sm text-[var(--ink)] break-all" style={{ fontFamily: 'var(--font-mono)' }}>
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

              {/* Right column — quick actions */}
              <div className="hidden xl:block">
                <QuickActionsPanel botId={bot.id} />
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
            <div className="space-y-8">
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
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)] mb-1">Smart Routing</h2>
                <p className="text-xs text-[var(--ink-muted)] mb-4">
                  Classifies each message and routes complex questions to a stronger model, reducing average credit cost on mixed traffic.
                </p>
                <SmartRoutingToggle botId={bot.id} initialEnabled={bot.smartRoutingEnabled} />
              </div>
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

          {activeTab === 'documents' && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-1">Documents</h2>
              <p className="text-xs text-[var(--ink-muted)] mb-5">
                Upload files or add a URL. The bot will retrieve relevant context from these documents at chat time.
              </p>
              <DocumentsTab botId={bot.id} orgId={bot.orgId} plan={bot.orgPlan} />
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
      <MobileNav />
    </div>
  )
}
