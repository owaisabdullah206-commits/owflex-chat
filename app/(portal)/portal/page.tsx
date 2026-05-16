import { eq } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { getPortalStats } from '@/lib/db/queries/portal-stats'
import { BotOff } from 'lucide-react'
import { TopNav } from '@/components/portal/TopNav'
import { StatCard } from '@/components/portal/StatCard'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'
import { RelativeTime } from '@/components/shared/RelativeTime'

export default async function PortalPage({
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

  if (!bot) {
    return (
      <div className="min-h-screen">
        <TopNav userEmail={user.email} bots={bots} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--hairline)] flex items-center justify-center mx-auto mb-4">
            <BotOff className="h-6 w-6 text-[var(--ink-subtle)]" />
          </div>
          <h2 className="text-base font-semibold text-[var(--ink)] mb-2">Waiting for bot access</h2>
          <p className="text-sm text-[var(--ink-muted)] max-w-xs mx-auto">
            Your developer hasn&apos;t linked a chatbot to your account yet. Reach out to them to get started.
          </p>
        </div>
      </div>
    )
  }

  const [stats, recentLeads] = await Promise.all([
    getPortalStats(bot.id),
    db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        capturedAt: schema.leads.capturedAt,
      })
      .from(schema.leads)
      .where(eq(schema.leads.botId, bot.id))
      .orderBy(schema.leads.capturedAt)
      .limit(5),
  ])

  return (
    <div className="min-h-screen">
      <AutoRefresh intervalMs={30_000} />
      <TopNav userEmail={user.email} bots={bots} activeBotId={bot.id} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--ink)]">{bot.name}</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active" />
            </div>
            <p className="text-sm text-[var(--ink-muted)] mt-0.5">Your chatbot overview</p>
          </div>
          <RefreshButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Conversations this month" value={stats.conversationsThisMonth} delta={stats.convMonthDelta} />
          <StatCard label="Leads captured this month" value={stats.leadsThisMonth} delta={stats.leadsMonthDelta} />
          <StatCard label="New conversations this week" value={stats.conversationsThisWeek} />
        </div>

        {/* Recent leads preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--ink)]">Recent Leads</h2>
            {recentLeads.length > 0 && (
              <a href="/portal/leads" className="text-xs text-[var(--of-primary-text-light)] hover:underline">
                View all →
              </a>
            )}
          </div>
          {recentLeads.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
              <div className="h-0.5 bg-[var(--of-primary)]" />
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[var(--ink-muted)]">No leads captured yet.</p>
                <p className="text-xs text-[var(--ink-subtle)] mt-1">Leads appear here when visitors share their contact info.</p>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
              <div className="h-0.5 bg-[var(--of-primary)]" />
              <div className="divide-y divide-[var(--hairline)]">
                {recentLeads.map((lead) => {
                  const initials = (lead.name ?? lead.email ?? '?').slice(0, 2).toUpperCase()
                  return (
                    <div key={lead.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--of-primary-soft)] flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[var(--of-primary-text-light)]">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--ink)] truncate">
                          {lead.name ?? lead.email ?? 'Unknown lead'}
                        </p>
                        {lead.email && lead.name && (
                          <p className="text-xs text-[var(--ink-muted)] truncate">{lead.email}</p>
                        )}
                      </div>
                      <RelativeTime date={lead.capturedAt} className="text-xs text-[var(--ink-subtle)] shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
