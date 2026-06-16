'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { LeadCard } from '@/components/portal/LeadCard'
import { formatPhone } from '@/lib/utils/phone'
import { LeadStatusSelect } from '@/components/shared/LeadStatusSelect'
import { LeadPipelineSummary } from '@/components/shared/LeadPipelineSummary'
import { toLeadStatus } from '@/lib/leads/status'

interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  capturedAt: Date
  conversationId: string | null
  status: string | null
}

interface LeadsSearchProps {
  leads: Lead[]
}

export function LeadsSearch({ leads }: LeadsSearchProps) {
  const [q, setQ] = useState('')

  const filtered = q
    ? leads.filter((l) =>
        [l.name, l.email, l.phone].some((v) =>
          v?.toLowerCase().includes(q.toLowerCase()),
        ),
      )
    : leads

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ink-subtle)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)]"
        />
      </div>

      <LeadPipelineSummary leads={filtered} className="mb-4" />

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-[var(--ink-muted)]">
            {q ? `No leads match "${q}".` : 'No leads yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
            <div className="h-0.5 bg-[var(--of-primary)]" />
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--hairline)]">
                <tr>
                  {['Name', 'Email', 'Phone', 'Status', 'Date', 'Chat'].map((h) => (
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
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--bg)] transition-colors">
                    <td className="px-4 py-3 text-[var(--ink)] font-medium">{lead.name ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">{lead.email ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">{formatPhone(lead.phone)}</td>
                    <td className="px-4 py-3">
                      <LeadStatusSelect leadId={lead.id} status={toLeadStatus(lead.status)} apiBase="/api/portal/leads" />
                    </td>
                    <td className="px-4 py-3 text-[var(--ink-subtle)] text-xs whitespace-nowrap">
                      <RelativeTime date={lead.capturedAt} />
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
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
