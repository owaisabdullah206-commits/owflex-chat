'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  botId: string
  defaultQ?: string
  defaultFrom?: string
  defaultTo?: string
}

export function ConversationFilters({ botId, defaultQ = '', defaultFrom = '', defaultTo = '' }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(defaultQ)
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)

  function apply() {
    const params = new URLSearchParams({ tab: 'conversations' })
    if (q) params.set('q', q)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    router.push(`/dashboard/bots/${botId}?${params.toString()}`)
  }

  function clear() {
    setQ('')
    setFrom('')
    setTo('')
    router.push(`/dashboard/bots/${botId}?tab=conversations`)
  }

  const hasFilters = !!(defaultQ || defaultFrom || defaultTo)

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1">
          Search
        </label>
        <input
          type="text"
          placeholder="Search messages..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          className="w-full h-8 px-3 text-sm bg-[var(--surface-2)] border border-[var(--hairline-md)] text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)] transition-colors"
        />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1">
          From
        </label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-8 px-2 text-sm bg-[var(--surface-2)] border border-[var(--hairline-md)] text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] transition-colors"
        />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1">
          To
        </label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-8 px-2 text-sm bg-[var(--surface-2)] border border-[var(--hairline-md)] text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] transition-colors"
        />
      </div>
      <div className="flex items-end gap-2">
        <button
          onClick={apply}
          className="h-8 px-4 text-xs font-semibold bg-[var(--of-primary)] text-white hover:bg-[#0284C7] transition-colors"
        >
          Apply
        </button>
        {hasFilters && (
          <button
            onClick={clear}
            className="h-8 px-3 text-xs text-[var(--ink-muted)] border border-[var(--hairline)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
