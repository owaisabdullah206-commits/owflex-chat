import { desc, eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { PLAN_LIMITS } from '@/lib/limits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { LeadsSearch } from '@/components/dashboard/LeadsSearch'
import { Download } from 'lucide-react'

export default async function LeadsPage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan, leadsThisMonth: schema.organizations.leadsThisMonth })
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

  const planKey = ((org?.plan ?? 'free') in PLAN_LIMITS ? org?.plan ?? 'free' : 'free') as keyof typeof PLAN_LIMITS
  const leadsLimit = PLAN_LIMITS[planKey].leads

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        {/* Page header */}
        <div className="flex items-start justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <div
              className="flex items-center gap-1 mb-0.5 text-[10px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span>dashboard</span>
              <span className="opacity-40">/</span>
              <span className="text-[var(--ink-muted)]">leads</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--ink)] leading-tight">Leads</h1>
            {org && (
              <p className="text-[13px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                <span className="text-[var(--of-primary)]">{org.leadsThisMonth}</span>
                <span className="text-[var(--ink-subtle)]">/{leadsLimit === Infinity ? '∞' : leadsLimit}</span>
                {' '}leads.month · {leads.length} total
              </p>
            )}
          </div>
          {leads.length > 0 && (
            <a
              href="/api/v1/leads/export"
              download
              className="flex items-center gap-1.5 h-8 px-3 text-[13px] border border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--hairline-strong)] transition-colors mt-1"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <Download className="h-3 w-3" />
              Export CSV
            </a>
          )}
        </div>

        <div className="px-4 sm:px-8 py-6 overflow-x-auto">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <div
                className="text-[32px] font-semibold text-[var(--ink-subtle)] mb-2 leading-none"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
              >
                0
              </div>
              <p
                className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                leads.captured
              </p>
              <p className="text-sm text-[var(--ink-muted)] text-center max-w-xs mt-3">
                Leads appear here once your bots start capturing visitor contact info.
              </p>
            </div>
          ) : (
            <LeadsSearch leads={leads} showBot />
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
