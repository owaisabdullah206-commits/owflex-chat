'use client'

import { useState, useTransition } from 'react'
import { RefreshCw, Pencil, X, Check, Zap, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  refreshModelPrices,
  upsertManualModelPrice,
  clearManualModelPrice,
  setModelPricePriority,
} from '@/lib/db/queries/admin'

type PriceRow = {
  id: string
  modelId: string
  promptPricePer1M: string
  completionPricePer1M: string
  effectiveFrom: Date
  source: string
} | null

type ModelEntry = {
  modelId: string
  manual:   PriceRow
  api:      PriceRow
  active:   PriceRow
  priority: 'manual' | 'openrouter-api'
}

function fmt(val: string | null | undefined) {
  if (!val) return '—'
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return `$${n.toFixed(4)}`
}

function SourceTag({ source, isActive }: { source: 'manual' | 'openrouter-api'; isActive: boolean }) {
  if (source === 'manual') {
    return (
      <span className={cn(
        'px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]',
        isActive
          ? 'bg-amber-500/15 text-amber-400 outline outline-1 outline-amber-500/30'
          : 'bg-[var(--surface-3)] text-[var(--ink-subtle)]',
      )}>
        Manual{isActive ? ' ★' : ''}
      </span>
    )
  }
  return (
    <span className={cn(
      'px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]',
      isActive
        ? 'bg-[var(--of-primary-soft)] text-[var(--of-primary)] outline outline-1 outline-[var(--of-primary)]/30'
        : 'bg-[var(--surface-3)] text-[var(--ink-subtle)]',
    )}>
      API{isActive ? ' ★' : ''}
    </span>
  )
}

function EditRow({ modelId, current, onDone }: { modelId: string; current: PriceRow; onDone: () => void }) {
  const [input,  setInput]  = useState(current ? parseFloat(current.promptPricePer1M).toFixed(4) : '')
  const [output, setOutput] = useState(current ? parseFloat(current.completionPricePer1M).toFixed(4) : '')
  const [error,  setError]  = useState('')
  const [pending, startTransition] = useTransition()

  function save() {
    const p = parseFloat(input)
    const c = parseFloat(output)
    if (isNaN(p) || isNaN(c) || p < 0 || c < 0) { setError('Enter valid non-negative numbers'); return }
    startTransition(async () => {
      const res = await upsertManualModelPrice(modelId, p, c)
      if (res.error) setError(res.error)
      else onDone()
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--ink-subtle)]">In</span>
        <input
          type="number"
          step="0.0001"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-24 px-2 py-1 text-xs bg-[var(--bg)] border border-[var(--hairline-md)] text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] font-mono"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--ink-subtle)]">Out</span>
        <input
          type="number"
          step="0.0001"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          className="w-24 px-2 py-1 text-xs bg-[var(--bg)] border border-[var(--hairline-md)] text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] font-mono"
        />
      </div>
      {error && <span className="text-[10px] text-[var(--of-error)]">{error}</span>}
      <button onClick={save} disabled={pending} className="p-1 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40 transition-colors">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button onClick={onDone} className="p-1 text-[var(--ink-muted)] hover:bg-[var(--surface-3)] transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function ModelPricesTable({ models, lastFetched }: { models: ModelEntry[]; lastFetched: Date | null }) {
  const [editing, setEditing]         = useState<string | null>(null)
  const [pending, startTransition]    = useTransition()
  const [refreshMsg, setRefreshMsg]   = useState('')

  function handleRefresh() {
    setRefreshMsg('')
    startTransition(async () => {
      const res = await refreshModelPrices()
      if (res.error) setRefreshMsg(`Error: ${res.error}`)
      else setRefreshMsg(`Fetched ${res.count} models.`)
    })
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={handleRefresh}
          disabled={pending}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide bg-[var(--of-primary)] text-white disabled:opacity-50 hover:bg-[var(--of-primary-hover)] transition-colors"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', pending && 'animate-spin')} />
          Refresh All Prices
        </button>
        {lastFetched && (
          <span className="text-[11px] text-[var(--ink-subtle)] font-mono">
            Last fetched: {new Date(lastFetched).toLocaleString()}
          </span>
        )}
        {refreshMsg && (
          <span className="text-[11px] text-[var(--of-primary)] font-mono">{refreshMsg}</span>
        )}
      </div>

      {/* Priority notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-[var(--surface)] border border-[var(--hairline)] border-l-2 border-l-[var(--of-primary)]">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--of-primary)]" />
        <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed">
          <span className="font-semibold text-[var(--ink)]">Priority</span> controls which price is used when both sources exist.
          The active source is marked <span className="font-semibold text-[var(--ink)]">★</span>.
          Changing priority takes effect on the next chat request.
        </p>
      </div>

      {/* Table */}
      <div className="border border-[var(--hairline)] overflow-hidden">
        <div className="h-[2px] bg-[var(--of-primary)]" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)] bg-[var(--surface)]">
              {['Model', 'Active Price', 'Manual', 'API Price', 'Priority', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(({ modelId, manual, api, active, priority }) => {
              const hasBoth = !!manual && !!api
              const isEditingThis = editing === modelId

              return (
                <tr key={modelId} className="border-b border-[var(--hairline)] hover:bg-[var(--surface-2)] transition-colors">
                  {/* Model ID */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[var(--ink)]">{modelId}</span>
                  </td>

                  {/* Active price */}
                  <td className="px-4 py-3">
                    {active ? (
                      <div>
                        <p className="font-mono text-xs text-[var(--ink)]">
                          {fmt(active.promptPricePer1M)} / {fmt(active.completionPricePer1M)}
                        </p>
                        <p className="text-[10px] text-[var(--ink-subtle)] mt-0.5 uppercase tracking-wide">in / out per 1M</p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--ink-subtle)] font-mono">—</span>
                    )}
                  </td>

                  {/* Manual price */}
                  <td className="px-4 py-3">
                    {isEditingThis ? (
                      <EditRow modelId={modelId} current={manual} onDone={() => setEditing(null)} />
                    ) : manual ? (
                      <div className="space-y-1.5">
                        <SourceTag source="manual" isActive={priority === 'manual'} />
                        <p className="font-mono text-xs text-[var(--ink)]">
                          {fmt(manual.promptPricePer1M)} / {fmt(manual.completionPricePer1M)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--ink-subtle)] font-mono">—</span>
                    )}
                  </td>

                  {/* API price */}
                  <td className="px-4 py-3">
                    {api ? (
                      <div className="space-y-1.5">
                        <SourceTag source="openrouter-api" isActive={priority === 'openrouter-api' || !manual} />
                        <p className="font-mono text-xs text-[var(--ink)]">
                          {fmt(api.promptPricePer1M)} / {fmt(api.completionPricePer1M)}
                        </p>
                        <p className="text-[10px] text-[var(--ink-subtle)] font-mono">
                          {new Date(api.effectiveFrom).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--ink-subtle)] font-mono">Not fetched</span>
                    )}
                  </td>

                  {/* Priority toggle */}
                  <td className="px-4 py-3">
                    {hasBoth ? (
                      <div className="flex border border-[var(--hairline-md)] w-fit text-[10px] font-bold uppercase tracking-wide">
                        <button
                          onClick={() => startTransition(async () => { await setModelPricePriority(modelId, 'manual') })}
                          className={cn(
                            'px-3 py-1.5 transition-colors',
                            priority === 'manual'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'text-[var(--ink-muted)] hover:bg-[var(--surface-2)]',
                          )}
                        >
                          Manual
                        </button>
                        <button
                          onClick={() => startTransition(async () => { await setModelPricePriority(modelId, 'openrouter-api') })}
                          className={cn(
                            'px-3 py-1.5 border-l border-[var(--hairline-md)] transition-colors',
                            priority === 'openrouter-api'
                              ? 'bg-[var(--of-primary-soft)] text-[var(--of-primary)]'
                              : 'text-[var(--ink-muted)] hover:bg-[var(--surface-2)]',
                          )}
                        >
                          API
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-subtle)]">
                        {manual ? 'Manual only' : api ? 'API only' : '—'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title={manual ? 'Edit manual price' : 'Set manual price'}
                        onClick={() => setEditing(isEditingThis ? null : modelId)}
                        className="p-1.5 hover:bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {manual && (
                        <button
                          title="Clear manual override"
                          onClick={() => startTransition(async () => { await clearManualModelPrice(modelId) })}
                          className="p-1.5 hover:bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--of-error-dark)] transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        title="Refresh from OpenRouter"
                        onClick={() => startTransition(async () => { await refreshModelPrices() })}
                        className="p-1.5 hover:bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
