import { requirePlatformOwner } from '@/lib/auth/session'
import { getPlatformStats } from '@/lib/db/queries/admin'
import { Sidebar } from '@/components/dashboard/Sidebar'

const PKR_PRICES: Record<string, number> = {
  free: 0, starter: 2000, pro: 6000, agency: 15000,
}

function BentoCard({
  children,
  className = '',
  accent = false,
  span = 1,
}: {
  children: React.ReactNode
  className?: string
  accent?: boolean
  span?: 1 | 2 | 3 | 4
}) {
  const spanClass = { 1: '', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4' }[span]
  return (
    <div className={`bg-[var(--surface)] ${spanClass} ${className}`}>
      {accent && <div className="h-[2px] bg-[var(--of-primary)] w-full" />}
      {children}
    </div>
  )
}

function MetricLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-1.5">
      {children}
    </p>
  )
}

function MetricValue({ children, size = 'lg' }: { children: React.ReactNode; size?: 'sm' | 'lg' | 'xl' }) {
  const sz = { sm: 'text-xl', lg: 'text-3xl', xl: 'text-4xl' }[size]
  return (
    <p className={`${sz} font-bold text-[var(--ink)] leading-none`} style={{ fontFamily: 'var(--font-mono)' }}>
      {children}
    </p>
  )
}

function MetricSub({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-[var(--ink-subtle)] mt-2">{children}</p>
}

export default async function AdminAnalyticsPage() {
  await requirePlatformOwner()
  const stats = await getPlatformStats()

  const freeCount  = stats.planBreakdown.find((p) => p.plan === 'free')?.cnt  ?? 0
  const grossColor = stats.grossProfitUsd >= 0 ? 'text-[var(--success-text)]' : 'text-[var(--error-text)]'

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        {/* Page header */}
        <div className="px-8 py-5 border-b border-[var(--hairline)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">Admin</p>
            <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Analytics</h1>
          </div>
        </div>

        <div className="px-8 py-6 max-w-6xl">

          {/* ── Row 1: Developer metrics (4-col bento) ───────────────────── */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3">
            Developers
          </p>
          <div className="border border-[var(--hairline)] mb-6">
            <div className="h-[2px] bg-[var(--of-primary)] w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--hairline)]">
              <BentoCard className="px-5 py-5">
                <MetricLabel>Total Developers</MetricLabel>
                <MetricValue size="xl">{stats.totalDevelopers}</MetricValue>
                <MetricSub>{stats.paidDevelopers} paid · {freeCount} free</MetricSub>
              </BentoCard>
              <BentoCard className="px-5 py-5">
                <MetricLabel>New This Month</MetricLabel>
                <MetricValue size="xl">{stats.newSignupsThisMonth}</MetricValue>
                <MetricSub>Signed up since month start</MetricSub>
              </BentoCard>
              <BentoCard className="px-5 py-5">
                <MetricLabel>Total Bots</MetricLabel>
                <MetricValue size="xl">{stats.totalBots}</MetricValue>
                <MetricSub>{stats.activeBots} active</MetricSub>
              </BentoCard>
              <BentoCard className="px-5 py-5">
                <MetricLabel>Messages / Month</MetricLabel>
                <MetricValue size="xl">{stats.totalMessages.toLocaleString()}</MetricValue>
                <MetricSub>{stats.totalLeads.toLocaleString()} leads captured</MetricSub>
              </BentoCard>
            </div>
          </div>

          {/* ── Row 2: Revenue + profit (3+1 bento) ─────────────────────── */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3">
            Revenue & Profit
          </p>
          <div className="border border-[var(--hairline)] mb-6">
            <div className="h-[2px] bg-[var(--of-primary)] w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--hairline)]">
              <BentoCard className="px-5 py-5">
                <MetricLabel>Est. MRR</MetricLabel>
                <MetricValue size="lg">₨{stats.estimatedMrrPkr.toLocaleString()}</MetricValue>
                <MetricSub>Subscription-only · PKR</MetricSub>
              </BentoCard>
              <BentoCard className="px-5 py-5">
                <MetricLabel>Credit Revenue</MetricLabel>
                <MetricValue size="lg">${stats.creditRevenueUsd.toFixed(2)}</MetricValue>
                <MetricSub>All-time purchases · USD</MetricSub>
              </BentoCard>
              <BentoCard className="px-5 py-5">
                <MetricLabel>LLM Cost</MetricLabel>
                <MetricValue size="lg">${stats.llmCostUsd.toFixed(4)}</MetricValue>
                <MetricSub>All-time token spend · USD</MetricSub>
              </BentoCard>
              <BentoCard className="px-5 py-5">
                <MetricLabel>Gross Profit</MetricLabel>
                <p className={`text-3xl font-bold leading-none ${grossColor}`} style={{ fontFamily: 'var(--font-mono)' }}>
                  ${stats.grossProfitUsd.toFixed(4)}
                </p>
                <MetricSub>Credit revenue − LLM cost</MetricSub>
              </BentoCard>
            </div>
          </div>

          {/* ── Row 3: Plan breakdown table ──────────────────────────────── */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3">
            Plan Breakdown
          </p>
          <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
            <div className="h-[2px] bg-[var(--of-primary)] w-full" />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--surface-3)]">
                  {['Plan', 'Developers', 'Price / mo (PKR)', 'MRR Contribution'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['free', 'starter', 'pro', 'agency'] as const).map((plan) => {
                  const row  = stats.planBreakdown.find((p) => p.plan === plan)
                  const cnt  = row?.cnt ?? 0
                  const price = PKR_PRICES[plan]
                  return (
                    <tr key={plan} className="border-b border-[var(--hairline)] odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink)]">{plan}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-[var(--ink)]">{cnt}</td>
                      <td className="px-5 py-3 font-mono text-[var(--ink-muted)]">
                        {price === 0 ? '—' : `₨${price.toLocaleString()}`}
                      </td>
                      <td className="px-5 py-3 font-mono text-[var(--ink)]">
                        {price === 0 ? '—' : `₨${(price * cnt).toLocaleString()}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  )
}
