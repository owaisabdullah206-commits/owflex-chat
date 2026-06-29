import { eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { checkBotLimit } from '@/lib/limits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { NewBotWorkspace } from '@/components/dashboard/NewBotWorkspace'
import { getMarketingBaseUrl } from '@/lib/url'

export default async function NewBotPage() {
  const user = await requireDeveloper()
  // Free /tools pages live on the marketing site, not admin.octively.com
  const toolsBase = getMarketingBaseUrl()

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  const atLimit = org ? !(await checkBotLimit(org.id)).allowed : false

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Create a new agent</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">
            Set up your agent and get an embed script
          </p>
        </div>

        <div className="px-4 sm:px-8 py-8">
          {atLimit ? (
            <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-6 py-8 text-center max-w-xl">
              <p className="text-sm font-medium text-[var(--ink)] mb-2">Agent limit reached</p>
              <p className="text-xs text-[var(--ink-muted)] mb-4">
                Your {org?.plan ?? 'free'} plan allows a limited number of agents.
                Upgrade your plan to create more.
              </p>
              <a
                href="/dashboard/billing"
                className="inline-flex items-center px-4 py-2 rounded bg-[var(--of-primary)] text-white text-sm hover:opacity-90 transition-opacity"
              >
                Upgrade Plan
              </a>
            </div>
          ) : (
            <NewBotWorkspace toolsBase={toolsBase} />
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
