import { desc, eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { getBalance } from '@/lib/credits'
import { getStorageUsedMb, PLAN_LIMITS } from '@/lib/limits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { CreditBalance } from '@/components/dashboard/CreditBalance'
import { StorageUsage } from '@/components/dashboard/StorageUsage'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function BillingPage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  const [balance, transactions, storageMb] = await Promise.all([
    org ? getBalance(org.id) : Promise.resolve(0),
    org
      ? db
          .select({
            id:        schema.creditTransactions.id,
            delta:     schema.creditTransactions.delta,
            reason:    schema.creditTransactions.reason,
            createdAt: schema.creditTransactions.createdAt,
          })
          .from(schema.creditTransactions)
          .where(eq(schema.creditTransactions.orgId, org.id))
          .orderBy(desc(schema.creditTransactions.createdAt))
          .limit(20)
      : Promise.resolve([]),
    org ? getStorageUsedMb(org.id) : Promise.resolve(0),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const plan = (org?.plan ?? 'free') as keyof typeof PLAN_LIMITS
  const maxStorageMb = PLAN_LIMITS[plan in PLAN_LIMITS ? plan : 'free'].storageMb

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
        <div className="px-4 sm:px-8 py-6 space-y-6">
          {org ? (
            <>
              <StorageUsage usedMb={storageMb} maxMb={maxStorageMb} plan={org.plan} />
              <CreditBalance balance={balance} transactions={transactions} appUrl={appUrl} />
            </>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">No organization found.</p>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
