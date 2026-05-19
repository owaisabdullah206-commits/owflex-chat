import { desc, eq } from 'drizzle-orm'
import { Redis } from '@upstash/redis'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { getBalance } from '@/lib/credits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { CreditBalance } from '@/components/dashboard/CreditBalance'
import { CreditStatusBanner } from '@/components/dashboard/CreditStatusBanner'
import { PlanUpgradeSection } from '@/components/dashboard/PlanUpgradeSection'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function BillingPage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({
      id: schema.organizations.id,
      plan: schema.organizations.plan,
    })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) {
    return (
      <div className="flex min-h-screen bg-[var(--bg)]">
        <Sidebar />
        <main className="flex-1 md:ml-56 pb-16 md:pb-0">
          <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
            <h1 className="text-xl font-bold text-[var(--ink)]">Billing</h1>
          </div>
          <div className="px-4 sm:px-8 py-6">
            <p className="text-sm text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
              No organization found.
            </p>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  const yyyyMM = new Date().toISOString().slice(0, 7)
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const [balance, transactions, graceTtl, graceUsed] = await Promise.all([
    getBalance(org.id),
    db
      .select({
        id: schema.creditTransactions.id,
        delta: schema.creditTransactions.delta,
        reason: schema.creditTransactions.reason,
        createdAt: schema.creditTransactions.createdAt,
      })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.orgId, org.id))
      .orderBy(desc(schema.creditTransactions.createdAt))
      .limit(20),
    redis.ttl(`credit_grace:${org.id}:${yyyyMM}`),
    redis.get(`credit_grace_used:${org.id}:${yyyyMM}`),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const graceActive = (graceTtl ?? 0) > 0
  const graceDisabled = graceUsed !== null && !graceActive

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <AutoRefresh intervalMs={30_000} />
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="flex items-start justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <div
              className="flex items-center gap-1 mb-0.5 text-[10px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span>dashboard</span>
              <span className="opacity-40">/</span>
              <span className="text-[var(--ink-muted)]">billing</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--ink)] leading-tight">Billing</h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              plans · top-ups · transactions
            </p>
          </div>
          <div className="mt-1"><RefreshButton /></div>
        </div>
        <div className="px-4 sm:px-8 py-6 space-y-8">
          <CreditStatusBanner graceActive={graceActive} graceDisabled={graceDisabled} plan={org.plan} />
          <PlanUpgradeSection currentPlan={org.plan} />
          <CreditBalance balance={balance} transactions={transactions} appUrl={appUrl} plan={org.plan} />
          {org.plan === 'starter' && (
            <div className="border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3 flex items-center gap-3">
              <span className="text-[11px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                weekly_digest= available on{' '}
                <span className="text-[var(--ink)]">pro+</span>
                {' · '}
                <a
                  href="/api/billing/payfast-plan-url?plan=pro"
                  className="text-[var(--accent)] hover:underline"
                >
                  upgrade →
                </a>
              </span>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
