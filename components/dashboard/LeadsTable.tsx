'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { formatPhone } from '@/lib/utils/phone'
import { LeadStatusSelect } from '@/components/shared/LeadStatusSelect'
import { toLeadStatus } from '@/lib/leads/status'

interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  capturedAt: Date
  conversationId: string | null
  status: string | null
  botName?: string
}

interface LeadsTableProps {
  leads: Lead[]
  showBot?: boolean
}

const thClass = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-3)] border-b border-[var(--hairline)]'
const tdClass = 'px-4 py-3 border-b border-[var(--hairline)] text-[13px]'

export function LeadsTable({ leads, showBot = false }: LeadsTableProps) {
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...leads].sort((a, b) => {
    const diff = new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    return sortAsc ? diff : -diff
  })

  if (leads.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)] py-4">
        No leads yet. They&apos;ll appear here once visitors submit their contact info via the embed.
      </p>
    )
  }

  return (
    <div className="border border-[var(--hairline)] overflow-hidden">
      <table className="w-full text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
        <thead>
          <tr>
            <th className={thClass}>name</th>
            <th className={thClass}>email</th>
            <th className={thClass}>phone</th>
            {showBot && <th className={thClass}>agent</th>}
            <th className={thClass}>status</th>
            <th className={thClass}>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
              >
                captured_at
                <span>{sortAsc ? '↑' : '↓'}</span>
              </button>
            </th>
            <th className={thClass}>chat</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface)]">
          {sorted.map((lead) => (
            <tr key={lead.id} className="odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors">
              <td className={`${tdClass} font-medium text-[var(--ink)]`}>{lead.name ?? '—'}</td>
              <td className={`${tdClass} text-[var(--ink-muted)]`}>{lead.email ?? '—'}</td>
              <td className={`${tdClass} text-[var(--ink-muted)]`}>{formatPhone(lead.phone)}</td>
              {showBot && (
                <td className={`${tdClass} text-[var(--ink-muted)]`}>{lead.botName ?? '—'}</td>
              )}
              <td className={tdClass}>
                <LeadStatusSelect leadId={lead.id} status={toLeadStatus(lead.status)} apiBase="/api/v1/leads" />
              </td>
              <td className={`${tdClass} text-[var(--ink-subtle)]`}>
                <RelativeTime date={lead.capturedAt} />
              </td>
              <td className={tdClass}>
                {lead.conversationId && (
                  <a
                    href={`/dashboard/conversations/${lead.conversationId}`}
                    className="text-[var(--of-primary)] hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
