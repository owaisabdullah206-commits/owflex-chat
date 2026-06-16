import { and, desc, eq, sql } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { PLAN_LIMITS } from '@/lib/limits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { LeadsSearch } from '@/components/dashboard/LeadsSearch'
import { Download, AlertTriangle, EyeOff } from 'lucide-react'

export default async function LeadsPage() {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan, leadsThisMonth: schema.organizations.leadsThisMonth })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  const [visibleLeads, hiddenCount] = org
    ? await Promise.all([
        // Visible leads only
        db
          .select({
            id: schema.leads.id,
            name: schema.leads.name,
            email: schema.leads.email,
            phone: schema.leads.phone,
            capturedAt: schema.leads.capturedAt,
            conversationId: schema.leads.conversationId,
            status: schema.leads.status,
            botName: schema.bots.name,
          })
          .from(schema.leads)
          .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
          .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
          .where(
            and(
              eq(schema.organizations.ownerId, user.id),
              eq(schema.leads.hiddenByLimit, false),
            ),
          )
          .orderBy(desc(schema.leads.capturedAt)),
        // Count of hidden leads
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.leads)
          .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
          .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
          .where(
            and(
              eq(schema.organizations.ownerId, user.id),
              eq(schema.leads.hiddenByLimit, true),
            ),
          )
          .then((rows) => rows[0]?.count ?? 0),
      ])
    : [[], 0]

  const planKey = ((org?.plan ?? 'free') in PLAN_LIMITS ? org?.plan ?? 'free' : 'free') as keyof typeof PLAN_LIMITS
  const leadsLimit = PLAN_LIMITS[planKey].leads
  const hasHidden = hiddenCount > 0

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
                {' '}leads.month · {visibleLeads.length} visible
                {hasHidden && (
                  <span className="text-amber-400"> · {hiddenCount} hidden</span>
                )}
              </p>
            )}
          </div>
          {visibleLeads.length > 0 && (
            planKey === 'free' ? (
              <a
                href="/dashboard/billing"
                title="CSV export is available on paid plans"
                className="flex items-center gap-1.5 h-8 px-3 text-[13px] border border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink-subtle)] hover:text-[var(--ink-muted)] transition-colors mt-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <Download className="h-3 w-3" />
                Export CSV
                <span className="text-[10px] px-1.5 py-0.5 border border-amber-500/40 text-amber-400 bg-amber-500/10">Starter+</span>
              </a>
            ) : (
              <a
                href="/api/v1/leads/export"
                download
                className="flex items-center gap-1.5 h-8 px-3 text-[13px] border border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--hairline-strong)] transition-colors mt-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <Download className="h-3 w-3" />
                Export CSV
              </a>
            )
          )}
        </div>

        <div className="px-4 sm:px-8 py-6 overflow-x-auto">
          {/* Hidden leads banner — shown when over-limit leads exist */}
          {hasHidden && (
            <div className="mb-6 flex items-start gap-3 border border-amber-400/30 bg-amber-400/8 px-4 py-3">
              <EyeOff className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-semibold text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  leads.hidden — {hiddenCount} lead{hiddenCount !== 1 ? 's' : ''} not visible
                </p>
                <p className="text-[12px] text-[var(--ink-muted)] mt-1">
                  Your <span className="text-[var(--ink)]">{org?.plan}</span> plan allows{' '}
                  <span className="text-[var(--ink)]">{leadsLimit === Infinity ? '∞' : leadsLimit}</span> leads/month.
                  Leads captured past that limit are saved but hidden from your dashboard and your clients.
                  Upgrade to make them visible.{' '}
                  <a
                    href="/dashboard/billing"
                    className="text-[var(--of-primary)] hover:underline font-medium"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Upgrade →
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Legacy limit-reached banner (no hidden leads yet but ceiling hit) */}
          {!hasHidden && org && leadsLimit !== Infinity && org.leadsThisMonth >= (leadsLimit as number) && (
            <div className="mb-6 flex items-start gap-3 border border-amber-400/30 bg-amber-400/8 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-semibold text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  leads.limit_reached — next leads will be hidden
                </p>
                <p className="text-[12px] text-[var(--ink-muted)] mt-1">
                  You have used your <span className="text-[var(--ink)]">{leadsLimit === Infinity ? '∞' : leadsLimit}</span> leads/month on the{' '}
                  <span className="text-[var(--ink)]">{org.plan}</span> plan.
                  Any new leads will still be saved but hidden until you upgrade.{' '}
                  <a
                    href="/dashboard/billing"
                    className="text-[var(--of-primary)] hover:underline font-medium"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Upgrade to capture unlimited leads →
                  </a>
                </p>
              </div>
            </div>
          )}

          {visibleLeads.length === 0 && !hasHidden ? (
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
            <LeadsSearch leads={visibleLeads} showBot />
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
