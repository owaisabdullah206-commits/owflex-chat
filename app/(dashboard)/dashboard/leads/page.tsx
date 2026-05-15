import { desc, eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { LeadsTable } from '@/components/dashboard/LeadsTable'

export default async function LeadsPage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  const leads = org
    ? await db
        .select({
          id: schema.leads.id,
          name: schema.leads.name,
          email: schema.leads.email,
          phone: schema.leads.phone,
          capturedAt: schema.leads.capturedAt,
          conversationId: schema.leads.conversationId,
          botName: schema.bots.name,
        })
        .from(schema.leads)
        .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
        .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
        .where(eq(schema.organizations.ownerId, user.id))
        .orderBy(desc(schema.leads.capturedAt))
    : []

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Leads</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">All leads captured across your bots</p>
        </div>

        <div className="px-4 sm:px-8 py-6 overflow-x-auto">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <h2 className="text-base font-semibold text-[var(--ink)] mb-1">No leads yet</h2>
              <p className="text-sm text-[var(--ink-muted)] text-center max-w-xs">
                Leads will appear here once your embedded chatbots start capturing visitor contact info.
              </p>
            </div>
          ) : (
            <LeadsTable leads={leads} showBot />
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
