'use client'

import { useState } from 'react'

// Approximate exchange rate — update when significantly off.
const USD_RATE = 285

function fmt(pkr: number, currency: 'PKR' | 'USD') {
  if (currency === 'USD') return '$' + Math.round(pkr / USD_RATE).toLocaleString('en-US')
  return '₨' + Math.round(pkr).toLocaleString('en-PK')
}

function planFor(convos: number) {
  if (convos <= 200) return { name: 'Free', pkr: 0 }
  if (convos <= 3000) return { name: 'Starter', pkr: 2500 }
  if (convos <= 15000) return { name: 'Pro', pkr: 7500 }
  return { name: 'Agency', pkr: 20000 }
}

function recommendedCharge(convos: number, pages: number, docs: number) {
  let base
  if (convos <= 200) base = 8000
  else if (convos <= 1000) base = 12000
  else if (convos <= 3000) base = 18000
  else if (convos <= 10000) base = 30000
  else base = 45000
  if (pages > 50 || docs > 10) base += 4000
  else if (pages > 15 || docs > 3) base += 2000
  return base
}

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--ink)' }
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--bg)', color: 'var(--ink)', fontSize: 15,
}

export function ChatbotPricingCalculator() {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('USD')
  const [visitors, setVisitors] = useState(5000)
  const [pages, setPages] = useState(20)
  const [docs, setDocs] = useState(5)
  const [convos, setConvos] = useState(1200)

  const plan = planFor(convos)
  const charge = recommendedCharge(convos, pages, docs)
  const margin = charge - plan.pkr
  const marginPct = charge > 0 ? Math.round((margin / charge) * 100) : 0

  const tiles = [
    { label: 'Recommended monthly charge', value: fmt(charge, currency), accent: true },
    { label: `Octively plan (${plan.name})`, value: plan.pkr === 0 ? 'Free' : `${fmt(plan.pkr, currency)}/mo` },
    { label: `Your margin (${marginPct}%)`, value: fmt(margin, currency) },
  ]

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Currency toggle */}
      <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-start' }}>
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

      {/* Inputs */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 14, padding: 24,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18,
      }}>
        <label style={field}>
          <span style={labelStyle}>Monthly website visitors</span>
          <input type="number" min={0} style={inputStyle} value={visitors} onChange={(e) => setVisitors(+e.target.value || 0)} />
        </label>
        <label style={field}>
          <span style={labelStyle}>Pages on the site</span>
          <input type="number" min={0} style={inputStyle} value={pages} onChange={(e) => setPages(+e.target.value || 0)} />
        </label>
        <label style={field}>
          <span style={labelStyle}>Knowledge documents</span>
          <input type="number" min={0} style={inputStyle} value={docs} onChange={(e) => setDocs(+e.target.value || 0)} />
        </label>
        <label style={field}>
          <span style={labelStyle}>Expected conversations / month</span>
          <input type="number" min={0} style={inputStyle} value={convos} onChange={(e) => setConvos(+e.target.value || 0)} />
        </label>
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {tiles.map((t) => (
          <div key={t.label} style={{
            background: t.accent ? 'var(--of-primary-soft)' : 'var(--surface)',
            border: `1px solid ${t.accent ? 'rgba(14,165,233,.35)' : 'var(--hairline)'}`,
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(22px, 2.6vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em',
              color: t.accent ? 'var(--of-primary-deep)' : 'var(--ink)',
            }}>{t.value}</div>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-subtle)' }}>{t.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-subtle)', lineHeight: 1.6 }}>
        These figures are a starting point based on typical retainers. Charge more if the bot handles bookings,
        lead qualification, or sales since those create direct revenue for your client.
        {currency === 'USD' && ` Rates shown in USD (1 USD = ${USD_RATE} PKR per SBP, Jul 2025). Switch to ₨ PKR to see local figures.`}
      </p>
    </div>
  )
}
