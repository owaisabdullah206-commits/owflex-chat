import { count, desc, eq, inArray } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { getBalance, FREE_TIER_CREDITS } from '@/lib/credits'
import { getStorageUsedMb, PLAN_LIMITS } from '@/lib/limits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { CreditBalance } from '@/components/dashboard/CreditBalance'
import { PlanUsage } from '@/components/dashboard/PlanUsage'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function BillingPage() {
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
            <h1 className="text-lg font-semibold text-[var(--ink)]">Billing & Credits</h1>
          </div>
          <div className="px-4 sm:px-8 py-6">
            <p className="text-sm text-[var(--ink-muted)]">No organization found.</p>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  // Fetch bots first — needed for client count and doc count
  const orgBots = await db
    .select({ id: schema.bots.id, clientUserId: schema.bots.clientUserId })
    .from(schema.bots)
    .where(eq(schema.bots.orgId, org.id))

  const botIds = orgBots.map((b) => b.id)
  const clientCount = new Set(
    orgBots.filter((b) => b.clientUserId).map((b) => b.clientUserId),
  ).size

  const [balance, transactions, storageMb, docRow] = await Promise.all([
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
    getStorageUsedMb(org.id),
    botIds.length > 0
      ? db
          .select({ c: count() })
          .from(schema.documents)
          .where(inArray(schema.documents.botId, botIds))
      : Promise.resolve([{ c: 0 }]),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const docCount = docRow[0]?.c ?? 0

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <AutoRefresh intervalMs={30_000} />
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <h1 className="text-lg font-semibold text-[var(--ink)]">Billing & Credits</h1>
            <p className="text-sm text-[var(--ink-muted)] mt-0.5">Usage, credit balance, and top-ups</p>
          </div>
          <RefreshButton />
        </div>
        <div className="px-4 sm:px-8 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
            <div className="xl:col-span-3">
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
            <div className="xl:col-span-2">
              <CreditBalance balance={balance} transactions={transactions} appUrl={appUrl} />
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
