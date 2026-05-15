'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'

interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  capturedAt: Date
  conversationId: string | null
  botName?: string
}

interface LeadsTableProps {
  leads: Lead[]
  showBot?: boolean
}

export function LeadsTable({ leads, showBot = false }: LeadsTableProps) {
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...leads].sort((a, b) => {
    const diff = new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    return sortAsc ? diff : -diff
  })

  if (leads.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)] py-4">
        No leads yet. They'll appear here once visitors submit their contact info via the embed.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          {showBot && <TableHead>Bot</TableHead>}
          <TableHead>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
            >
              Date
              <span className="text-[10px]">{sortAsc ? '↑' : '↓'}</span>
            </button>
          </TableHead>
          <TableHead>Chat</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.name ?? '—'}</TableCell>
            <TableCell className="text-[var(--ink-muted)]">{lead.email ?? '—'}</TableCell>
            <TableCell className="text-[var(--ink-muted)]">{lead.phone ?? '—'}</TableCell>
            {showBot && (
              <TableCell className="text-[var(--ink-muted)]">{lead.botName ?? '—'}</TableCell>
            )}
            <TableCell>
              <span
                className="text-xs text-[var(--ink-muted)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {new Date(lead.capturedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </TableCell>
            <TableCell>
              {lead.conversationId && (
                <a
                  href={`/portal/conversations/${lead.conversationId}`}
                  className="text-[var(--of-primary-text-dark)] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
