/* Hallmark · component: select · genre: editorial · theme: adm-dark
 * states: default · hover · focus · active · disabled · open · error · success
 * contrast: pass (46–50)
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { SUPPORTED_MODELS, getModelMeta } from '@/lib/ai/litellm'

// Tier order controls the display sequence in the dropdown
const TIER_ORDER = [
  { badge: '⚡ Ultra Fast', label: 'Ultra Fast',    colorClass: 'text-sky-400'     },
  { badge: '⚡ Fast',       label: 'Fast',           colorClass: 'text-sky-400'     },
  { badge: '⚖️ Balanced',   label: 'Balanced',       colorClass: 'text-amber-400'   },
  { badge: '🧠 Smart',      label: 'Smart',          colorClass: 'text-violet-400'  },
  { badge: '🔮 Experimental', label: 'Experimental', colorClass: 'text-fuchsia-400' },
] as const

// Full Tailwind class strings — cannot be assembled dynamically
const PILL_COLORS: Record<string, string> = {
  'text-sky-400':     'ring-sky-400/30 bg-sky-400/10',
  'text-amber-400':   'ring-amber-400/30 bg-amber-400/10',
  'text-violet-400':  'ring-violet-400/30 bg-violet-400/10',
  'text-fuchsia-400': 'ring-fuchsia-400/30 bg-fuchsia-400/10',
}

interface ModelSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  /** sm = 1.5 py (smart-routing rows) · md = 2 py (standalone select) */
  size?: 'sm' | 'md'
}

export function ModelSelect({ value, onChange, disabled = false, id, size = 'md' }: ModelSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const meta = getModelMeta(value)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const pill = PILL_COLORS[meta.badgeColor] ?? PILL_COLORS['text-sky-400']

  const tierGroups = TIER_ORDER
    .map(tier => ({
      ...tier,
      models: SUPPORTED_MODELS.filter(m => getModelMeta(m).badge === tier.badge),
    }))
    .filter(g => g.models.length > 0)

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={[
          'w-full flex items-center gap-2 border bg-[var(--bg)] text-[var(--ink)] text-left transition-colors duration-100',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--of-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open
            ? 'border-[var(--of-primary)]'
            : 'border-[var(--hairline)] hover:border-[var(--hairline-strong)]',
          size === 'sm' ? 'px-2.5 py-1.5' : 'px-3 py-2',
        ].join(' ')}
      >
        {/* Badge pill */}
        <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 ring-1 ${pill} ${meta.badgeColor}`}>
          {meta.badge}
        </span>
        {/* Model name */}
        <span className={`flex-1 min-w-0 truncate font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {meta.label}
        </span>
        {/* Speed stat */}
        {meta.speed && (
          <span
            className="shrink-0 text-[10px] text-[var(--ink-subtle)] hidden sm:block"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {meta.speed}
          </span>
        )}
        <ChevronDown
          className={[
            'shrink-0 text-[var(--ink-muted)] transition-transform duration-150',
            open ? 'rotate-180' : '',
            size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
          ].join(' ')}
        />
      </button>

      {/* ── Dropdown panel ───────────────────────────────────────────────── */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-px bg-[var(--surface)] border border-[var(--of-primary)] shadow-2xl overflow-y-auto max-h-80">
          {tierGroups.map((group, idx) => (
            <div key={group.badge}>
              {/* Tier group header */}
              <div
                className={[
                  'flex items-center gap-2 px-3 py-1.5 bg-[var(--bg)]',
                  idx > 0 ? 'border-t border-[var(--hairline)]' : '',
                ].join(' ')}
              >
                <span className={`text-[9px] font-bold tracking-widest uppercase whitespace-nowrap ${group.colorClass}`}>
                  {group.label}
                </span>
                <span className="flex-1 h-px bg-[var(--hairline)]" />
              </div>

              {/* Model rows */}
              {group.models.map(m => {
                const mMeta = getModelMeta(m)
                const isSelected = m === value
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { onChange(m); setOpen(false) }}
                    className={[
                      'w-full flex items-center gap-2.5 px-3 py-2 text-left border-l-2 transition-colors duration-75',
                      isSelected
                        ? 'bg-[var(--of-primary)]/10 border-[var(--of-primary)]'
                        : 'border-transparent hover:bg-[var(--surface-2)] hover:border-[var(--hairline-strong)]',
                    ].join(' ')}
                  >
                    {/* Name */}
                    <span className={`flex-1 min-w-0 truncate text-xs font-medium ${isSelected ? 'text-[var(--of-primary)]' : 'text-[var(--ink)]'}`}>
                      {mMeta.label}
                    </span>
                    {/* Speed */}
                    {mMeta.speed && (
                      <span
                        className="shrink-0 text-[10px] text-[var(--ink-subtle)]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {mMeta.speed}
                      </span>
                    )}
                    {/* Checkmark column — always takes the space so alignment is stable */}
                    <span className={`shrink-0 w-3.5 flex items-center justify-center ${isSelected ? 'text-[var(--of-primary)]' : 'opacity-0 pointer-events-none'}`}>
                      <Check className="h-3 w-3" />
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
