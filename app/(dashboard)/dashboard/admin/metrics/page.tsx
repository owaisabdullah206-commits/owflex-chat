import { requirePlatformOwner } from '@/lib/auth/session'
import { getPlatformStats } from '@/lib/db/queries/admin'
import { listShortLinks } from '@/lib/db/queries/links'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { CompetitiveNotes } from '@/components/dashboard/CompetitiveNotes'

// ── Primitive display components ──────────────────────────────────────────────

function Card({ children, span = 1 }: { children: React.ReactNode; span?: 1 | 2 | 3 }) {
  const spanClass = span === 2 ? 'md:col-span-2' : span === 3 ? 'md:col-span-3' : ''
  return (
    <div className={`bg-[var(--surface)] border border-[var(--hairline)] rounded-xl px-5 py-4 ${spanClass}`}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1"
      style={{ fontFamily: 'var(--font-mono)' }}>
      {children}
    </p>
  )
}

function Big({ children, color }: { children: React.ReactNode; color?: string }) {
  const str = typeof children === 'string' ? children : null
  return (
    <p className={`text-[28px] font-bold leading-none tracking-tight ${color ?? 'text-[var(--ink)]'}`}
      style={{ fontFamily: 'var(--font-mono)' }}>
      {str?.startsWith('₨') ? (
        <>
          <span style={{ fontSize: '0.55em', fontWeight: 600, verticalAlign: 'middle' }}>₨</span>
          {str.slice(1)}
        </>
      ) : children}
    </p>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-[var(--ink-muted)] mt-1">{children}</p>
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]"
        style={{ fontFamily: 'var(--font-mono)' }}>
        {children}
      </span>
      <div className="flex-1 h-px bg-[var(--hairline)]" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminMetricsPage() {
  await requirePlatformOwner()

  const [stats, links] = await Promise.all([
    getPlatformStats(),
    listShortLinks(),
  ])

  const grossColor = stats.grossProfitUsd >= 0 ? 'text-[var(--success-text)]' : 'text-[var(--error-text)]'
  const marginColor = (stats.grossMarginPct ?? 0) >= 70
    ? 'text-[var(--success-text)]'
    : (stats.grossMarginPct ?? 0) >= 40
      ? 'text-[var(--warning-text)]'
      : 'text-[var(--error-text)]'

  const topLinks = links.slice(0, 10)

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">

        {/* Page header */}
        <div className="flex items-start justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <div className="flex items-center gap-1 mb-0.5 text-[10px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-mono)' }}>
              <span>admin</span>
              <span className="opacity-40">/</span>
              <span className="text-[var(--ink-muted)]">metrics</span>
            </div>
            <h1 className="text-[17px] font-semibold text-[var(--ink)] leading-tight">
              Monitoring dashboard
            </h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-0.5">
              The 5 risk lenses. Any metric degrading 2–3 months straight is the real problem.
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 max-w-5xl">

          {/* ── Lens 1: Market ── */}
          <SectionHeader>1 · market</SectionHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <Label>Total signups</Label>
              <Big>{stats.totalDevelopers}</Big>
              <Sub>{stats.newSignupsThisMonth} new this month</Sub>
            </Card>
            <Card>
              <Label>Paying customers</Label>
              <Big color="text-[var(--of-primary)]">{stats.paidDevelopers}</Big>
              <Sub>
                {stats.planBreakdown
                  .filter(p => p.plan !== 'free')
                  .map(p => `${p.cnt} ${p.plan}`)
                  .join(' · ') || 'none yet'}
              </Sub>
            </Card>
            <Card>
              <Label>Demos booked</Label>
              <Big color="text-[var(--ink-subtle)]">—</Big>
              <Sub>Track manually in notes</Sub>
            </Card>
            <Card>
              <Label>Agencies interviewed</Label>
              <Big color="text-[var(--ink-subtle)]">—</Big>
              <Sub>Track manually in notes</Sub>
            </Card>
          </div>

          {/* ── Lens 2: Product ── */}
          <SectionHeader>2 · product</SectionHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <Label>Activation rate</Label>
              <Big color={stats.activationRatePct >= 60
                ? 'text-[var(--success-text)]'
                : stats.activationRatePct >= 30
                  ? 'text-[var(--warning-text)]'
                  : 'text-[var(--error-text)]'}>
                {stats.activationRatePct}%
              </Big>
              <Sub>Signups who created a bot ({stats.activatedDevelopers} / {stats.totalDevelopers})</Sub>
            </Card>
            <Card>
              <Label>Free → paid %</Label>
              <Big color={stats.freeToPaidRatePct >= 5
                ? 'text-[var(--success-text)]'
                : stats.freeToPaidRatePct >= 2
                  ? 'text-[var(--warning-text)]'
                  : 'text-[var(--error-text)]'}>
                {stats.freeToPaidRatePct}%
              </Big>
              <Sub>Target: 5–8% by month 3</Sub>
            </Card>
            <Card>
              <Label>Active bots</Label>
              <Big>{stats.activeBots}</Big>
              <Sub>{stats.totalBots} total created</Sub>
            </Card>
            <Card>
              <Label>Conversations / mo</Label>
              <Big>{stats.totalMessages.toLocaleString()}</Big>
              <Sub>{stats.totalLeads.toLocaleString()} leads captured</Sub>
            </Card>
          </div>

          {/* ── Lens 3: Financial ── */}
          <SectionHeader>3 · financial</SectionHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <Label>Est. MRR</Label>
              <Big>₨{stats.estimatedMrrPkr.toLocaleString()}</Big>
              <Sub>Subscription only · PKR</Sub>
            </Card>
            <Card>
              <Label>Credit revenue</Label>
              <Big>${stats.creditRevenueUsd.toFixed(2)}</Big>
              <Sub>All-time purchases · USD</Sub>
            </Card>
            <Card>
              <Label>LLM cost</Label>
              <Big color="text-[var(--error-text)]">${stats.llmCostUsd.toFixed(2)}</Big>
              <Sub>All-time · USD</Sub>
            </Card>
            <Card>
              <Label>Gross margin</Label>
              <Big color={marginColor}>
                {stats.grossMarginPct !== null ? `${stats.grossMarginPct}%` : 'n/a'}
              </Big>
              <Sub>
                <span className={grossColor}>${stats.grossProfitUsd.toFixed(2)}</span>
                {' '}profit · target ≥ 70%
              </Sub>
            </Card>
          </div>

          {/* ── Lens 4: Distribution ── */}
          <SectionHeader>4 · distribution</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <Label>Short-link clicks (total)</Label>
              <Big>{stats.shortLinkClicksTotal.toLocaleString()}</Big>
              <Sub>Across all {links.length} link{links.length !== 1 ? 's' : ''}</Sub>
            </Card>
            <Card span={2}>
              <Label>Top links by clicks</Label>
              {topLinks.length === 0 ? (
                <p className="text-[13px] text-[var(--ink-muted)] mt-1">No short links yet. Create them in Short links.</p>
              ) : (
                <table className="w-full text-[12px] mt-2">
                  <tbody>
                    {topLinks.map((l) => (
                      <tr key={l.id} className="border-b border-[var(--hairline)] last:border-0">
                        <td className="py-1.5 pr-3 text-[var(--of-primary-text-dark)]"
                          style={{ fontFamily: 'var(--font-mono)' }}>
                          /r/{l.code}
                        </td>
                        <td className="py-1.5 pr-3 text-[var(--ink-muted)] truncate max-w-[160px]">
                          {[l.utmSource, l.utmMedium, l.utmCampaign].filter(Boolean).join(' / ') || l.label || l.destinationUrl}
                        </td>
                        <td className="py-1.5 text-right font-bold text-[var(--ink)]"
                          style={{ fontFamily: 'var(--font-mono)' }}>
                          {l.clickCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
          <p className="text-[12px] text-[var(--ink-subtle)] mt-2">
            CAC and conversion-by-channel require GA4. Open Reports → Acquisition → Traffic acquisition,
            filter by <code className="bg-[var(--surface-2)] px-1 rounded">signup_complete</code> event.
          </p>

          {/* ── Lens 5: Competitive ── */}
          <SectionHeader>5 · competitive</SectionHeader>
          <CompetitiveNotes />

        </div>
      </main>
      <MobileNav />
    </div>
  )
}
