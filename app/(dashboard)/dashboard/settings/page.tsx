import { eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { SignOutButton } from '@/components/dashboard/SignOutButton'
import { EditableName } from '@/components/dashboard/EditableName'
import { CreditCard } from 'lucide-react'

export default async function SettingsPage() {
  const user = await requireDeveloper()

  // Query DB directly for the current name — BetterAuth's session cookie caches
  // the name at login time and won't reflect updates made via the settings form.
  const [[dbUser], [org]] = await Promise.all([
    db
      .select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1),
    db
      .select({ id: schema.organizations.id, plan: schema.organizations.plan })
      .from(schema.organizations)
      .where(eq(schema.organizations.ownerId, user.id))
      .limit(1),
  ])

  const displayName = dbUser?.name ?? user.name ?? ''

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Settings</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">Account and workspace preferences</p>
        </div>

        <div className="px-4 sm:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left — Account */}
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Account</h2>
              <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
                <div className="px-5 py-4">
                  <p className="text-xs text-[var(--ink-muted)] mb-1.5">Name</p>
                  <EditableName name={displayName} />
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

            {/* Right — Billing + Session */}
            <div className="space-y-4">
              {/* Billing */}
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Billing</h2>
                <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-[var(--ink-muted)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--ink)]">Credits &amp; Usage</p>
                      <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                        View your credit balance, usage stats, and top up.
                      </p>
                    </div>
                  </div>
                  <a
                    href="/dashboard/billing"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--of-primary-text-dark)] hover:underline"
                  >
                    Go to Billing →
                  </a>
                </div>
              </div>

              {/* Session */}
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">Session</h2>
                <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] p-5">
                  <p className="text-xs text-[var(--ink-muted)] mb-3">
                    You are signed in as <span className="text-[var(--ink)]">{user.email}</span>
                  </p>
                  <SignOutButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
