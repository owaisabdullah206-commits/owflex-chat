import { eq } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { getPortalStats } from '@/lib/db/queries/portal-stats'
import { TopNav } from '@/components/portal/TopNav'
import { StatCard } from '@/components/portal/StatCard'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function PortalPage() {
  const user = await requireClient()

  const [bot] = await db
    .select({
      id: schema.bots.id,
      name: schema.bots.name,
    })
    .from(schema.bots)
    .where(eq(schema.bots.clientUserId, user.id))
    .limit(1)

  if (!bot) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <TopNav userEmail={user.email} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-base font-semibold text-[var(--ink)] mb-2">No bot assigned yet</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Contact your developer to get access to your chatbot dashboard.
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
    <div className="min-h-screen bg-[var(--bg)]">
      <AutoRefresh intervalMs={30_000} />
      <TopNav userEmail={user.email} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-[var(--ink)]">{bot.name}</h1>
            <p className="text-sm text-[var(--ink-muted)] mt-0.5">Your chatbot overview</p>
          </div>
          <RefreshButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Conversations this month" value={stats.conversationsThisMonth} />
          <StatCard label="Leads captured this month" value={stats.leadsThisMonth} />
          <StatCard label="New conversations this week" value={stats.conversationsThisWeek} />
        </div>

        {/* Recent leads preview */}
        {recentLeads.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--ink)]">Recent Leads</h2>
              <a
                href="/portal/leads"
                className="text-xs text-[var(--of-primary-text-light)] hover:underline"
              >
                View all →
              </a>
            </div>
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] divide-y divide-[var(--hairline)]">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--ink)] truncate">
                      {lead.name ?? lead.email ?? 'Unknown lead'}
                    </p>
                    {lead.email && lead.name && (
                      <p className="text-xs text-[var(--ink-muted)] truncate">{lead.email}</p>
                    )}
                  </div>
                  <time className="text-xs text-[var(--ink-subtle)] shrink-0">
                    {new Date(lead.capturedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </time>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
