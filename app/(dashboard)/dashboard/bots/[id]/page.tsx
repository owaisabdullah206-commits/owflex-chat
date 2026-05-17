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
import { BotTabSelect } from '@/components/dashboard/BotTabSelect'
import { ClientStatusCard } from '@/components/dashboard/ClientStatusCard'

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

  const [conversations, leads, convMonthCount, leadsMonthCount, convWeekCount, faqs, unansweredMessages, clientRows, inviteRows] = await Promise.all([
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
    // Client user assigned to this bot
    bot.clientUserId
      ? db
          .select({ id: schema.users.id, email: schema.users.email, name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.id, bot.clientUserId))
          .limit(1)
      : Promise.resolve([]),
    // Most recent invitation for this bot
    db
      .select({
        email: schema.invitations.email,
        expiresAt: schema.invitations.expiresAt,
        usedAt: schema.invitations.usedAt,
      })
      .from(schema.invitations)
      .where(eq(schema.invitations.botId, bot.id))
      .orderBy(desc(schema.invitations.createdAt))
      .limit(1),
  ])

  const clientUser = clientRows[0] ?? null
  const latestInvite = inviteRows[0] ?? null

  const clientProp = clientUser
    ? { email: clientUser.email, name: clientUser.name, joinedAt: latestInvite?.usedAt ?? null }
    : null

  const inviteProp = !clientUser && latestInvite
    ? { email: latestInvite.email, expiresAt: latestInvite.expiresAt, expired: latestInvite.expiresAt < now }
    : null

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <AutoRefresh intervalMs={30_000} />
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="flex-1 min-w-0">
            <div
              className="flex items-center gap-1 mb-0.5 text-[10px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <a href="/dashboard/bots" className="hover:text-[var(--ink-muted)] transition-colors">bots</a>
              <span className="opacity-40">/</span>
              <span className="text-[var(--ink-muted)] truncate">{bot.name}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-xl font-bold text-[var(--ink)] leading-tight truncate">{bot.name}</h1>
              <BotToggle botId={bot.id} initialActive={bot.isActive} />
            </div>
            <p className="text-[12px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              embed_key={bot.embedKey.slice(0, 16)}…
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <RefreshButton />
            <DeleteBotButton botId={bot.id} botName={bot.name} />
          </div>
        </div>

        {/* Onboarding banner */}
        <Suspense fallback={null}>
          <OnboardingBanner botId={bot.id} />
        </Suspense>

        {/* Tab nav */}
        <div className="sticky top-0 z-10 bg-[var(--bg)] border-b border-[var(--hairline)]">
          {/* Mobile dropdown */}
          <div className="px-4 py-2 sm:hidden">
            <BotTabSelect botId={bot.id} tabs={TABS} activeTab={activeTab} />
          </div>
          {/* Desktop tabs */}
          <div className="hidden sm:flex items-center gap-1 px-8 py-2 overflow-x-auto">
            {TABS.map((t) => {
              const slug = t.toLowerCase()
              const isActive = activeTab === slug
              return (
                <a
                  key={t}
                  href={`/dashboard/bots/${bot.id}?tab=${slug}`}
                  className={`flex items-center h-7 px-2.5 rounded-[4px] text-[11px] transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--of-primary)]/10 text-[var(--of-primary)] font-semibold border border-[var(--of-primary)]/30'
                      : 'text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] border border-transparent'
                  }`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {t.toLowerCase().replace(' ', '_')}
                </a>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-4 sm:px-8 py-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--hairline)] rounded-md overflow-hidden border border-[var(--hairline)]">
                <StatCard label="conversations.month" value={convMonthCount[0]?.count ?? 0} />
                <StatCard label="leads.month" value={leadsMonthCount[0]?.count ?? 0} tone="primary" />
                <StatCard label="conversations.week" value={convWeekCount[0]?.count ?? 0} />
              </div>

              {/* Embed code */}
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  embed_script
                </p>
                <EmbedCodeBlock embedKey={bot.embedKey} />
                <p className="text-xs text-[var(--ink-muted)] mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
                  paste before{' '}
                  <code className="px-1 py-0.5 rounded-[3px] bg-[var(--surface-2)] text-[var(--ink)]">
                    {'</body>'}
                  </code>
                </p>
              </div>

              {/* Bot Details + Client Access — same row on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="rounded-md border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hairline)]">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>embed_key</span>
                    <span className="text-[11px] text-[var(--ink)] break-all" style={{ fontFamily: 'var(--font-mono)' }}>{bot.embedKey}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hairline)]">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>model</span>
                    <span className="text-[12px] text-[var(--of-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>{bot.model}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-2" style={{ fontFamily: 'var(--font-mono)' }}>system_prompt</p>
                    <p className="text-xs text-[var(--ink-muted)] whitespace-pre-wrap leading-relaxed">{bot.systemPrompt}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <ClientStatusCard botId={bot.id} client={clientProp} invite={inviteProp} />
                  <QuickActionsPanel botId={bot.id} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div>
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  sessions
                </p>
                <span className="text-[11px] text-[var(--of-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {conversations.length}
                </span>
              </div>
              <ConversationTable conversations={conversations} />
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  leads.captured
                </p>
                <span className="text-[11px] text-[var(--of-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {leads.length}
                </span>
              </div>
              <LeadsTable leads={leads} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-5" style={{ fontFamily: 'var(--font-mono)' }}>bot_settings</p>
                <BotSettingsForm
                  botId={bot.id}
                  orgPlan={bot.orgPlan}
                  initial={{
                    name: bot.name,
                    systemPrompt: bot.systemPrompt,
                    model: bot.model,
                    ...(() => {
                      const wc = (bot.widgetConfig ?? {}) as Record<string, unknown>
                      return {
                        primaryColor:       (wc.primaryColor as string)  ?? '#0EA5E9',
                        position:           ((wc.position as string) === 'bottom-left' ? 'bottom-left' : 'bottom-right') as 'bottom-right' | 'bottom-left',
                        welcomeMessage:     (wc.welcomeMessage as string) ?? 'Hi! How can I help you today?',
                        leadCaptureEnabled: (wc.leadCaptureEnabled as boolean) !== false,
                        strictMode:         (wc.strictMode as boolean)    === true,
                        triggerIcon:        (wc.triggerIcon as string)    ?? 'message-circle',
                        borderRadius:       typeof wc.borderRadius === 'number' ? wc.borderRadius : 16,
                        tooltipEnabled:     (wc.tooltipEnabled as boolean) === true,
                        tooltipMessages:    Array.isArray(wc.tooltipMessages) ? (wc.tooltipMessages as string[]) : [],
                      }
                    })(),
                  }}
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>smart_routing</p>
                <p className="text-xs text-[var(--ink-muted)] mb-4">
                  Routes complex questions to a stronger model, reducing average credit cost on mixed traffic.
                </p>
                <SmartRoutingToggle botId={bot.id} initialEnabled={bot.smartRoutingEnabled} />
              </div>
            </div>
          )}

          {activeTab === 'knowledge base' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>knowledge_base</p>
                <p className="text-xs text-[var(--ink-muted)] mb-5">
                  Active entries are injected into the system prompt on every chat. Changes apply within 5 minutes.
                </p>
                <FaqEditor botId={bot.id} initialFaqs={faqs} />
              </div>
              <div className="hidden lg:block">
                <div className="rounded-md border border-[var(--hairline)] bg-[var(--surface)] p-4 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>tips</p>
                  <p className="text-xs text-[var(--ink-muted)]">Keep FAQ answers concise — they&apos;re injected on every message.</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    For longer docs, use the{' '}
                    <a href="?tab=documents" className="text-[var(--of-primary)] hover:underline" style={{ fontFamily: 'var(--font-mono)' }}>
                      documents
                    </a>{' '}
                    tab.
                  </p>
                  <div className="pt-2 border-t border-[var(--hairline)]">
                    <p className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      active={faqs.filter((f) => f.isActive).length} / total={faqs.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>documents</p>
              <p className="text-xs text-[var(--ink-muted)] mb-5">
                Upload files or add a URL. The bot retrieves relevant context from these documents at chat time.
              </p>
              <DocumentsTab botId={bot.id} orgId={bot.orgId} plan={bot.orgPlan} />
            </div>
          )}

          {activeTab === 'unanswered' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>unanswered_questions</p>
                <p className="text-xs text-[var(--ink-muted)] mb-5">
                  Responses where the bot expressed uncertainty. Add FAQ entries to fill these gaps.
                </p>
                <UnansweredList messages={unansweredMessages} />
              </div>
              <div className="hidden lg:block">
                <div className="rounded-md border border-[var(--hairline)] bg-[var(--surface)] p-4 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>what_to_do</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Add FAQ entries to fill the gaps so visitors get accurate answers.
                  </p>
                  <a href="?tab=knowledge base" className="block text-xs text-[var(--of-primary)] hover:underline" style={{ fontFamily: 'var(--font-mono)' }}>
                    → knowledge_base
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
