'use client'

import { useTransition, useState } from 'react'
import { setExpensiveModelThreshold } from '@/lib/db/queries/admin'

interface Props {
  currentThreshold: number | null
  defaultThreshold: number
}

export function ExpensiveThresholdForm({ currentThreshold, defaultThreshold }: Props) {
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(currentThreshold ?? defaultThreshold)
  const [saved, setSaved] = useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await setExpensiveModelThreshold(value)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        })
      }}
      className="flex items-center gap-3"
    >
      <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] shrink-0">
        expensive_threshold
      </label>
      <div className="relative">
        <span
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-muted)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          $
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-24 h-8 pl-5 pr-2 text-xs border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--of-primary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>
      <span className="text-[10px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
        /1M tokens
      </span>
      <button
        type="submit"
        disabled={isPending}
        className="h-7 px-3 text-[10px] font-medium rounded bg-[var(--of-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Saving...' : saved ? 'Saved' : 'Save'}
      </button>
      {currentThreshold !== null && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await setExpensiveModelThreshold(null)
              setValue(defaultThreshold)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            })
          }}
          className="h-7 px-3 text-[10px] font-medium rounded border border-[var(--hairline)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
        >
          Reset to default
        </button>
      )}
    </form>
  )
}
