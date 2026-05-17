'use client'

import { useState, useMemo } from 'react'
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

type Range = 'all' | 'today' | 'week' | 'month'

const chipBase = 'flex items-center gap-1.5 h-7 px-2.5 rounded-[4px] text-[11px] transition-colors border cursor-pointer'
const chipInactive = 'border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]'
const chipActive = 'border-[var(--of-primary)]/50 bg-[var(--of-primary)]/10 text-[var(--of-primary)] font-medium'

export function LeadsSearch({ leads, showBot = false }: LeadsSearchProps) {
  const [q, setQ] = useState('')
  const [range, setRange] = useState<Range>('all')

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const filtered = useMemo(() => {
    let result = leads

    if (range === 'today') {
      result = result.filter((l) => new Date(l.capturedAt) >= todayStart)
    } else if (range === 'week') {
      result = result.filter((l) => new Date(l.capturedAt) >= weekStart)
    } else if (range === 'month') {
      result = result.filter((l) => new Date(l.capturedAt) >= monthStart)
    }

    if (q) {
      const lq = q.toLowerCase()
      result = result.filter((l) =>
        [l.name, l.email, l.phone].some((v) => v?.toLowerCase().includes(lq)),
      )
    }

    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, q, range])

  const counts = {
    all: leads.length,
    today: leads.filter((l) => new Date(l.capturedAt) >= todayStart).length,
    week: leads.filter((l) => new Date(l.capturedAt) >= weekStart).length,
    month: leads.filter((l) => new Date(l.capturedAt) >= monthStart).length,
  }

  const chips: { id: Range; label: string }[] = [
    { id: 'all', label: 'all' },
    { id: 'today', label: 'today' },
    { id: 'week', label: '7d' },
    { id: 'month', label: 'month' },
  ]

  return (
    <div>
      {/* Filterbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--ink-subtle)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="name, email, phone…"
            className="pl-7 pr-3 h-7 text-[12px] bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)] transition-colors"
            style={{ fontFamily: 'var(--font-mono)', width: 220 }}
          />
        </div>
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setRange(c.id)}
            className={`${chipBase} ${range === c.id ? chipActive : chipInactive}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span>{c.label}</span>
            <span
              className={`text-[10px] px-1 rounded-[2px] ${range === c.id ? 'bg-[var(--of-primary)]/20 text-[var(--of-primary)]' : 'bg-[var(--surface-3)] text-[var(--ink-subtle)]'}`}
            >
              {counts[c.id]}
            </span>
          </button>
        ))}
        <div className="flex-1" />
        <span
          className="text-[11px] text-[var(--ink-subtle)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {filtered.length} / {leads.length} rows
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-[var(--hairline)] bg-[var(--surface)] px-4 py-10 text-center">
          <p className="text-sm text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
            no matches
          </p>
        </div>
      ) : (
        <LeadsTable leads={filtered} showBot={showBot} />
      )}
    </div>
  )
}
