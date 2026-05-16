'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { LeadsTable } from './LeadsTable'

interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  capturedAt: Date
  conversationId: string | null
  botName?: string
}

interface LeadsSearchProps {
  leads: Lead[]
  showBot?: boolean
}

export function LeadsSearch({ leads, showBot = false }: LeadsSearchProps) {
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
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)]"
        />
      </div>
      {filtered.length === 0 && q ? (
        <p className="text-sm text-[var(--ink-muted)] py-4">No leads match &ldquo;{q}&rdquo;.</p>
      ) : (
        <LeadsTable leads={filtered} showBot={showBot} />
      )}
    </div>
  )
}
