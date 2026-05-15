import { desc, eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { getBalance } from '@/lib/credits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { CreditBalance } from '@/components/dashboard/CreditBalance'

export default async function SettingsPage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  const [balance, transactions] = await Promise.all([
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
          .limit(10)
      : Promise.resolve([]),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Settings</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">Account and workspace preferences</p>
        </div>
        <div className="px-8 py-6 space-y-8">
          {/* Account info */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Account</h2>
            <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)] max-w-xl">
              <div className="px-5 py-4">
                <p className="text-xs text-[var(--ink-muted)] mb-1">Name</p>
                <p className="text-sm text-[var(--ink)]">{user.name}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-[var(--ink-muted)] mb-1">Email</p>
                <p className="text-sm text-[var(--ink)]">{user.email}</p>
              </div>
              {org && (
                <div className="px-5 py-4">
                  <p className="text-xs text-[var(--ink-muted)] mb-1">Plan</p>
                  <p className="text-sm text-[var(--ink)] capitalize">{org.plan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Credits */}
          {org && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Credits</h2>
              <CreditBalance balance={balance} transactions={transactions} appUrl={appUrl} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
