import { and, desc, eq } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { TopNav } from '@/components/portal/TopNav'
import { LeadCard } from '@/components/portal/LeadCard'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function LeadsPage() {
  const user = await requireClient()

  const [bot] = await db
    .select({ id: schema.bots.id, name: schema.bots.name })
    .from(schema.bots)
    .where(eq(schema.bots.clientUserId, user.id))
    .limit(1)

  const leads = bot
    ? await db
        .select({
          id: schema.leads.id,
          name: schema.leads.name,
          email: schema.leads.email,
          phone: schema.leads.phone,
          notes: schema.leads.notes,
          capturedAt: schema.leads.capturedAt,
          conversationId: schema.leads.conversationId,
        })
        .from(schema.leads)
        .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
        .where(
          and(
            eq(schema.bots.clientUserId, user.id),
            eq(schema.leads.botId, bot.id),
          ),
        )
        .orderBy(desc(schema.leads.capturedAt))
    : []

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AutoRefresh intervalMs={30_000} />
      <TopNav userEmail={user.email} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[var(--ink)]">Leads</h1>
          <div className="flex items-center gap-2">
            <RefreshButton />
            {leads.length > 0 && (
              <Button variant="secondary" size="sm" asChild>
                <a href="/api/portal/leads/export" download>
                  <Download className="h-4 w-4 mr-1.5" />
                  Export CSV
                </a>
              </Button>
            )}
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">No leads yet</h3>
            <p className="text-sm text-[var(--ink-muted)]">
              Leads will appear here once your chatbot captures visitor contact info.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-[var(--surface)] rounded-xl border border-[var(--hairline)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--hairline)]">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Date', 'Chat'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--hairline)]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[var(--bg)] transition-colors">
                      <td className="px-4 py-3 text-[var(--ink)] font-medium">{lead.name ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--ink-muted)]">{lead.email ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--ink-muted)]">{lead.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--ink-subtle)] text-xs whitespace-nowrap">
                        {new Date(lead.capturedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {lead.conversationId && (
                          <a
                            href={`/portal/conversations/${lead.conversationId}`}
                            className="text-xs text-[var(--of-primary-text-light)] hover:underline"
                          >
                            View →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden grid gap-3">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
