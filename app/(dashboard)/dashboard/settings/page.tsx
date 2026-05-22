import { eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { SignOutButton } from '@/components/dashboard/SignOutButton'
import { EditableName } from '@/components/dashboard/EditableName'
import { ByokSettings } from '@/components/dashboard/ByokSettings'

export default async function SettingsPage() {
  const user = await requireDeveloper()

  const [[dbUser], [org]] = await Promise.all([
    db
      .select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1),
    db
      .select({ id: schema.organizations.id, plan: schema.organizations.plan, llmApiKey: schema.organizations.llmApiKey })
      .from(schema.organizations)
      .where(eq(schema.organizations.ownerId, user.id))
      .limit(1),
  ])

  const displayName = dbUser?.name ?? user.name ?? ''

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        {/* Page header */}
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div
            className="flex items-center gap-1 mb-0.5 text-[10px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span>dashboard</span>
            <span className="opacity-40">/</span>
            <span className="text-[var(--ink-muted)]">settings</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--ink)] leading-tight">Settings</h1>
          <p className="text-[13px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            account · workspace · session
          </p>
        </div>

        <div className="px-4 sm:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left — Account */}
            <div className="lg:col-span-2">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                account
              </p>
              <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
                {/* Setting row — name */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] mb-0.5"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      display_name
                    </p>
                    <p className="text-xs text-[var(--ink-muted)]">Shown in the dashboard and emails.</p>
                  </div>
                  <div className="ml-4 shrink-0">
                    <EditableName name={displayName} />
                  </div>
                </div>
                {/* Setting row — email */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] mb-0.5"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      email
                    </p>
                    <p className="text-xs text-[var(--ink-muted)]">Login and notification address.</p>
                  </div>
                  <p
                    className="text-[13px] text-[var(--ink)] ml-4"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {user.email}
                  </p>
                </div>
                {/* Setting row — plan */}
                {org && (
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] mb-0.5"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        plan
                      </p>
                      <p className="text-xs text-[var(--ink-muted)]">Your current subscription tier.</p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      <span
                        className="text-[13px] font-medium text-[var(--ink)] capitalize"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {org.plan}
                      </span>
                      <a
                        href="/dashboard/billing"
                        className="text-[11px] text-[var(--of-primary)] hover:underline underline-offset-2"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        View Billing →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Session */}
            <div className="space-y-6">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  session
                </p>
                <div className="border border-[var(--hairline)] bg-[var(--surface)] px-5 py-4">
                  <p
                    className="text-[11px] text-[var(--ink-muted)] mb-4"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Signed in as {user.email}
                  </p>
                  <SignOutButton />
                </div>
              </div>

              {/* BYOK */}
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  advanced
                </p>
                <ByokSettings hasKey={!!org?.llmApiKey} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
