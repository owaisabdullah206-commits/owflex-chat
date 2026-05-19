import { count, eq, inArray } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { getBalance, FREE_TIER_CREDITS } from '@/lib/credits'
import { getStorageUsedMb } from '@/lib/limits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { PlanUsage } from '@/components/dashboard/PlanUsage'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function UsagePage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({
      id: schema.organizations.id,
      plan: schema.organizations.plan,
      conversationsThisMonth: schema.organizations.conversationsThisMonth,
      leadsThisMonth: schema.organizations.leadsThisMonth,
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
            <h1 className="text-xl font-bold text-[var(--ink)]">Usage</h1>
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

  const orgBots = await db
    .select({ id: schema.bots.id, clientUserId: schema.bots.clientUserId })
    .from(schema.bots)
    .where(eq(schema.bots.orgId, org.id))

  const botIds = orgBots.map((b) => b.id)
  const clientCount = new Set(
    orgBots.filter((b) => b.clientUserId).map((b) => b.clientUserId),
  ).size

  const [balance, storageMb, docRow] = await Promise.all([
    getBalance(org.id, org.plan),
    getStorageUsedMb(org.id),
    botIds.length > 0
      ? db
          .select({ c: count() })
          .from(schema.documents)
          .where(inArray(schema.documents.botId, botIds))
      : Promise.resolve([{ c: 0 }]),
  ])

  const docCount = docRow[0]?.c ?? 0

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
              <span className="text-[var(--ink-muted)]">usage</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--ink)] leading-tight">Usage</h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              bots · conversations · leads · storage · credits
            </p>
          </div>
          <div className="mt-1"><RefreshButton /></div>
        </div>
        <div className="px-4 sm:px-8 py-6">
          <PlanUsage
            plan={org.plan}
            balance={balance}
            freeTierCredits={FREE_TIER_CREDITS}
            botCount={orgBots.length}
            clientCount={clientCount}
            docCount={docCount}
            conversationsThisMonth={org.conversationsThisMonth}
            leadsThisMonth={org.leadsThisMonth}
            storageMb={storageMb}
          />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
