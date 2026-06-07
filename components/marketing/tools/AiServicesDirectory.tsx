'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AI_SERVICES, CATEGORIES, type AIService, type Category } from '@/lib/data/ai-services'

const USD_RATE = 285

function fmtRange(pkr: [number, number], currency: 'PKR' | 'USD') {
  if (currency === 'USD') {
    return `$${Math.round(pkr[0] / USD_RATE).toLocaleString('en-US')}–$${Math.round(pkr[1] / USD_RATE).toLocaleString('en-US')}`
  }
  return `₨${pkr[0].toLocaleString('en-PK')}–₨${pkr[1].toLocaleString('en-PK')}`
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: 'var(--of-success)',
  Intermediate: 'var(--of-warning)',
  Advanced: 'var(--of-error)',
}

function ServiceCard({ s, currency }: { s: AIService; currency: 'PKR' | 'USD' }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
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

        {/* Pricing */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
            {fmtRange(currency === 'PKR' ? s.monthlyRetainerPkr : [
              Math.round(s.monthlyRetainerPkr[0] / USD_RATE),
              Math.round(s.monthlyRetainerPkr[1] / USD_RATE),
            ] as [number, number], currency === 'PKR' ? 'PKR' : 'USD')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginTop: 2 }}>/month retainer</div>
          <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginTop: 1 }}>
            {s.profitMarginPct[0]}–{s.profitMarginPct[1]}% margin
          </div>
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 8,
          border: '1px solid var(--hairline-strong)', background: 'transparent',
          color: 'var(--ink-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >
        {open ? 'Show less' : 'How to sell this service'}
      </button>

      {/* Detail */}
      {open && (
        <div style={{ display: 'grid', gap: 14, borderTop: '1px solid var(--hairline)', paddingTop: 16 }}>
          <Section title="What it is">{s.what}</Section>
          <Section title="How to deliver it">{s.howToDeliver}</Section>
          <Section title="Tools you need">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {s.toolsUsed.map((t) => <li key={t} style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.8 }}>{t}</li>)}
            </ul>
          </Section>
          <Section title="Where to find clients in Pakistan">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {s.whereToFindClients.map((c) => <li key={c} style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.8 }}>{c}</li>)}
            </ul>
          </Section>
          {s.setupFeePkr && (
            <Section title="Typical setup fee">
              {fmtRange(s.setupFeePkr, 'PKR')} one-time
              {currency === 'USD' && ` (about ${fmtRange([
                Math.round(s.setupFeePkr[0] / USD_RATE),
                Math.round(s.setupFeePkr[1] / USD_RATE),
              ] as [number, number], 'USD')})`}
            </Section>
          )}
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

export function AiServicesDirectory() {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('USD')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')

  const filtered = activeCategory === 'All'
    ? AI_SERVICES
    : AI_SERVICES.filter((s) => s.category === activeCategory)

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c as Category | 'All')}
              style={{
                padding: '6px 14px', borderRadius: 999, border: '1px solid var(--hairline-strong)',
                background: activeCategory === c ? 'var(--ink)' : 'transparent',
                color: activeCategory === c ? 'var(--bg)' : 'var(--ink-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Currency toggle */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['PKR', 'USD'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                padding: '6px 16px', borderRadius: 999, border: '1px solid var(--hairline-strong)',
                background: currency === c ? 'var(--ink)' : 'transparent',
                color: currency === c ? 'var(--bg)' : 'var(--ink-muted)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {c === 'PKR' ? '₨ PKR' : '$ USD'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-subtle)' }}>
        {filtered.length} service{filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        {currency === 'USD' ? ' (USD at 1 USD = 280 PKR approx.)' : ''}
      </p>

      {/* Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((s) => <ServiceCard key={s.slug} s={s} currency={currency} />)}
      </div>
    </div>
  )
}
