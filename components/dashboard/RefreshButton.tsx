'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

/**
 * Manual refresh button + 30-second auto-refresh for server-component pages.
 * Calls router.refresh() which re-runs server data fetches without a full
 * browser navigation. Drop this anywhere inside the page header.
 */
export function RefreshButton({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const refresh = useCallback(() => {
    setSpinning(true)
    router.refresh()
    setLastRefreshed(new Date())
    // Stop spin after 800 ms — just long enough to feel responsive
    setTimeout(() => setSpinning(false), 800)
  }, [router])

  // Auto-refresh on interval
  useEffect(() => {
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return (
    <div className="flex items-center gap-2">
      {lastRefreshed && (
        <span
          className="text-[10px] text-[var(--ink-subtle)] tabular-nums"
          style={{ fontFamily: 'var(--font-mono)' }}
          suppressHydrationWarning
        >
          refreshed {lastRefreshed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </span>
      )}
      <button
        onClick={refresh}
        title="Refresh data"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors text-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        <RefreshCw
          size={12}
          className={spinning ? 'animate-spin' : ''}
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-mono)' }}>
          Refresh
        </span>
      </button>
    </div>
  )
}
