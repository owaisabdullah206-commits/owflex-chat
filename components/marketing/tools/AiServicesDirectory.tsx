'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { AI_SERVICES, CATEGORIES, type AIService, type Category } from '@/lib/data/ai-services'
import { USD_PKR_RATE, pkrToUsd } from '@/lib/currency'

type SortKey = 'featured' | 'cost-asc' | 'cost-desc' | 'profit-desc'

const SORT_LABELS: Record<SortKey, string> = {
  featured: 'Featured',
  'cost-asc': 'Setup cost: low to high',
  'cost-desc': 'Setup cost: high to low',
  'profit-desc': 'Profit margin: high to low',
}

// Renders a PKR range in the chosen currency with the symbol sized down. The
// JetBrains Mono face has no rupee glyph, so an unstyled ₨ falls back to a much
// larger font; pinning the symbol to the body font at a smaller size fixes that.
// Always converts from the PKR base exactly once.
function PriceRange({ pkr, currency }: { pkr: [number, number]; currency: 'PKR' | 'USD' }) {
  const symbol = currency === 'USD' ? '$' : '₨'
  const lo = currency === 'USD' ? pkrToUsd(pkr[0]) : pkr[0]
  const hi = currency === 'USD' ? pkrToUsd(pkr[1]) : pkr[1]
  const locale = currency === 'USD' ? 'en-US' : 'en-PK'
  const Sym = () => (
    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.66em', fontWeight: 700, marginRight: 1 }}>{symbol}</span>
  )
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
      <Sym />{lo.toLocaleString(locale)}<span style={{ margin: '0 1px' }}>–</span><Sym />{hi.toLocaleString(locale)}
    </span>
  )
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: 'var(--of-success)',
  Intermediate: 'var(--of-warning)',
  Advanced: 'var(--of-error)',
}

function ServiceCard({
  s,
  currency,
  isOpen,
  onToggle,
}: {
  s: AIService
  currency: 'PKR' | 'USD'
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isOpen ? 'var(--hairline-strong)' : 'var(--hairline)'}`,
        borderRadius: 14,
        padding: 24,
        display: 'grid',
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
              background: 'var(--of-primary-soft)', color: 'var(--of-primary-deep)',
            }}>{s.category}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
              border: `1px solid ${DIFFICULTY_COLOR[s.difficulty]}22`,
              color: DIFFICULTY_COLOR[s.difficulty],
              background: `${DIFFICULTY_COLOR[s.difficulty]}11`,
            }}>{s.difficulty}</span>
            {s.octivelyLink && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                background: 'var(--of-primary)', color: '#fff',
              }}>Powered by Octively</span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{s.name}</h3>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{s.tagline}</p>
        </div>

        {/* Setup cost (the only money figure shown per service) */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <PriceRange pkr={s.setupFeePkr ?? [0, 0]} currency={currency} />
          <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginTop: 2 }}>approx. setup cost</div>
          <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginTop: 1 }}>
            {s.profitMarginPct[0]}–{s.profitMarginPct[1]}% profit margin
          </div>
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8,
          border: '1px solid var(--hairline-strong)', background: 'transparent',
          color: 'var(--ink-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >
        {isOpen ? 'Show less' : 'How to sell this service'}
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>

      {/* Detail */}
      {isOpen && (
        <div style={{ display: 'grid', gap: 18, borderTop: '1px solid var(--hairline)', paddingTop: 18 }}>
          <Section title="What it is">{s.what}</Section>
          <Section title="How to deliver it">{s.howToDeliver}</Section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            <Section title="Tools you need">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {s.toolsUsed.map((t) => <li key={t} style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.8 }}>{t}</li>)}
              </ul>
            </Section>
            <Section title="Where to find clients">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {s.whereToFindClients.map((c) => <li key={c} style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.8 }}>{c}</li>)}
              </ul>
            </Section>
          </div>

          {s.octivelyLink && (
            <Link
              href="/dashboard/signup"
              style={{
                alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 9, background: 'var(--of-primary)', color: '#fff',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Start with Octively for free <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-subtle)' }}>{title}</p>
      {typeof children === 'string'
        ? <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7 }}>{children}</p>
        : children}
    </div>
  )
}

const pillBase: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 999, border: '1px solid var(--hairline-strong)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
}

export function AiServicesDirectory() {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('USD')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')
  const [sortBy, setSortBy] = useState<SortKey>('featured')
  // Accordion: only one service open at a time. null = all collapsed.
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  const filtered = activeCategory === 'All'
    ? AI_SERVICES
    : AI_SERVICES.filter((s) => s.category === activeCategory)

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'cost-asc':
        return (a.setupFeePkr?.[0] ?? 0) - (b.setupFeePkr?.[0] ?? 0)
      case 'cost-desc':
        return (b.setupFeePkr?.[1] ?? 0) - (a.setupFeePkr?.[1] ?? 0)
      case 'profit-desc':
        return b.profitMarginPct[1] - a.profitMarginPct[1]
      default:
        return 0
    }
  })

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Controls */}
      <div style={{ display: 'grid', gap: 12 }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c as Category | 'All')}
              style={{
                ...pillBase,
                background: activeCategory === c ? 'var(--ink)' : 'transparent',
                color: activeCategory === c ? 'var(--bg)' : 'var(--ink-muted)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort + currency */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)' }}>Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              style={{
                padding: '7px 12px', borderRadius: 9, border: '1px solid var(--hairline-strong)',
                background: 'var(--bg)', color: 'var(--ink)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['PKR', 'USD'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                style={{
                  ...pillBase,
                  padding: '6px 16px', fontSize: 13,
                  background: currency === c ? 'var(--ink)' : 'transparent',
                  color: currency === c ? 'var(--bg)' : 'var(--ink-muted)',
                }}
              >
                {c === 'PKR' ? '₨ PKR' : '$ USD'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-subtle)' }}>
        {sorted.length} service{sorted.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        {currency === 'USD' ? ` (USD at 1 USD = ${USD_PKR_RATE} PKR approx.)` : ''}
      </p>

      {/* Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
        {sorted.map((s) => (
          <ServiceCard
            key={s.slug}
            s={s}
            currency={currency}
            isOpen={openSlug === s.slug}
            onToggle={() => setOpenSlug((prev) => (prev === s.slug ? null : s.slug))}
          />
        ))}
      </div>
    </div>
  )
}
