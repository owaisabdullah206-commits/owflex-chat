'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'

interface CreditData {
  balance: number
  limit: number
  plan: string
}

/** Format large numbers compactly: 1_234_567 → "1.2M", 45_000 → "45K" */
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 100_000_000 ? 0 : 1)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`
  return n.toString()
}

export function HeaderCreditPill() {
  const [data,    setData]    = useState<CreditData | null>(null)
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)

  async function fetchBalance() {
    try {
      const res = await fetch('/api/dashboard/credits/balance', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json() as CreditData
      if (isMounted.current) { setData(json); setLoading(false) }
    } catch {
      // network error — keep showing previous data / skeleton
      if (isMounted.current) setLoading(false)
    }
  }

  useEffect(() => {
    isMounted.current = true
    fetchBalance()
    const id = setInterval(fetchBalance, 60_000)
    return () => { isMounted.current = false; clearInterval(id) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className="h-6 w-24 animate-pulse bg-[var(--surface-2)] rounded-sm" />
    )
  }

  if (!data) return null

  const pct = data.limit > 0 ? data.balance / data.limit : 0

  // Colour tiers: healthy → sky-teal, warning → amber, critical → red
  const pillColor =
    pct < 0.05 ? 'text-[var(--error-text)]   bg-[var(--of-error)]/10   border-[var(--of-error)]/30' :
    pct < 0.20 ? 'text-amber-400              bg-amber-500/10            border-amber-500/30'         :
                 'text-[var(--of-primary)]    bg-[var(--of-primary)]/10  border-[var(--of-primary)]/25'

  const iconColor =
    pct < 0.05 ? 'text-[var(--error-text)]' :
    pct < 0.20 ? 'text-amber-400'           :
                 'text-[var(--of-primary)]'

  return (
    <Link
      href="/dashboard/usage"
      title={`${data.balance.toLocaleString()} / ${data.limit.toLocaleString()} credits remaining`}
      className={`inline-flex items-center gap-1.5 px-2.5 h-7 border text-[11px] font-medium transition-opacity hover:opacity-80 ${pillColor}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <Zap className={`h-3 w-3 shrink-0 ${iconColor}`} />
      <span>{fmt(data.balance)}</span>
      <span className="text-[var(--ink-subtle)] opacity-60">/</span>
      <span className="text-[var(--ink-subtle)]">{fmt(data.limit)}</span>
    </Link>
  )
}
