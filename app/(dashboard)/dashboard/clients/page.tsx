import { desc, eq, isNotNull, and } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { ClientPortalAccess } from '@/components/dashboard/ClientPortalAccess'
import type { PortalConfig } from '@/lib/db/queries/portal-config'

const thClass = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-3)] border-b border-[var(--hairline)]'
const tdClass = 'px-4 py-3 border-b border-[var(--hairline)] text-[13px] align-top'

export default async function ClientsPage() {
  const user = await requireDeveloper()

  const clients = await db
    .select({
      clientEmail:  schema.users.email,
      clientName:   schema.users.name,
      botId:        schema.bots.id,
      botName:      schema.bots.name,
      portalConfig: schema.bots.portalConfig,
      joinedAt:     schema.invitations.usedAt,
    })
    .from(schema.bots)
    .innerJoin(schema.users, eq(schema.bots.clientUserId, schema.users.id))
    .leftJoin(
      schema.invitations,
      and(
        eq(schema.invitations.botId, schema.bots.id),
        isNotNull(schema.invitations.usedAt),
      ),
    )
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(eq(schema.organizations.ownerId, user.id))
    .orderBy(desc(schema.invitations.usedAt))

  // Deduplicate: one row per bot
  const seen = new Set<string>()
  const rows = clients.filter((r) => {
    if (seen.has(r.botId)) return false
    seen.add(r.botId)
    return true
  })

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
              <span className="text-[var(--ink-muted)]">clients</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--ink)] leading-tight">Clients</h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="text-[var(--of-primary)]">{rows.length}</span> active {rows.length === 1 ? 'client' : 'clients'} across all agents
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-8">
            <div
              className="text-[32px] font-semibold text-[var(--ink-subtle)] mb-2 leading-none"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
            >
              0
            </div>
            <p
              className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              clients.active
            </p>
            <p className="text-sm text-[var(--ink-muted)] text-center max-w-xs mb-6 mt-3">
              Invite a client from any agent&apos;s detail page to get started.
            </p>
            <a
              href="/dashboard/bots"
              className="flex items-center h-8 px-4 text-[13px] font-medium bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Go to Agents →
            </a>
          </div>
        ) : (
          <div className="px-4 sm:px-8 py-6 overflow-x-auto">
            <div className="border border-[var(--hairline)] overflow-hidden">
              <table className="w-full text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr>
                    <th className={thClass}>email</th>
                    <th className={thClass}>name</th>
                    <th className={thClass}>agent</th>
                    <th className={thClass}>joined_at</th>
                    <th className={thClass}>portal_access</th>
                    <th className={thClass}>actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface)]">
                  {rows.map((row) => (
                    <tr key={row.botId} className="odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors">
                      <td className={`${tdClass} font-medium text-[var(--ink)]`}>
                        {row.clientEmail}
                      </td>
                      <td className={`${tdClass} text-[var(--ink-muted)]`}>
                        {row.clientName || '—'}
                      </td>
                      <td className={tdClass}>
                        <a
                          href={`/dashboard/bots/${row.botId}`}
                          className="text-[var(--of-primary)] hover:underline underline-offset-2"
                        >
                          {row.botName}
                        </a>
                      </td>
                      <td className={`${tdClass} text-[var(--ink-subtle)]`}>
                        {row.joinedAt ? <RelativeTime date={row.joinedAt} /> : '—'}
                      </td>
                      <td className={tdClass}>
                        <ClientPortalAccess
                          botId={row.botId}
                          initial={(row.portalConfig as PortalConfig | null) ?? {}}
                        />
                      </td>
                      <td className={tdClass}>
                        <a
                          href={`/dashboard/bots/${row.botId}?tab=overview`}
                          className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-2 transition-colors"
                        >
                          View agent
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
