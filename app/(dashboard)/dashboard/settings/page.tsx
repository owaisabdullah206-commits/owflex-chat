import { eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { SignOutButton } from '@/components/dashboard/SignOutButton'
import { EditableName } from '@/components/dashboard/EditableName'

export default async function SettingsPage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Settings</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">Account and workspace preferences</p>
        </div>
        <div className="px-4 sm:px-8 py-6 space-y-8">
          {/* Account info */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Account</h2>
            <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)] max-w-xl">
              <div className="px-5 py-4">
                <p className="text-xs text-[var(--ink-muted)] mb-1.5">Name</p>
                <EditableName name={user.name} />
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

          {/* Credits link */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Billing</h2>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 text-sm text-[var(--of-primary-text-dark)] hover:underline"
            >
              View credit balance and purchase credits →
            </a>
          </div>

          {/* Session */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Session</h2>
            <SignOutButton />
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
