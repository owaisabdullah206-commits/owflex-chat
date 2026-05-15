'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RefreshButtonProps {
  className?: string
}

export function RefreshButton({ className }: RefreshButtonProps) {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)

  function handleRefresh() {
    if (spinning) return
    setSpinning(true)
    router.refresh()
    setTimeout(() => setSpinning(false), 800)
  }

  return (
    <button
      onClick={handleRefresh}
      aria-label="Refresh data"
      title="Refresh"
      className={`p-1.5 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-40 ${className ?? ''}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={spinning ? { animation: 'spin 0.8s linear' } : undefined}
      >
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  )
}
