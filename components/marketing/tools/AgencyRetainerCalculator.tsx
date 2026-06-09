'use client'

import { useState } from 'react'
import { USD_PKR_RATE } from '@/lib/currency'

const USD_RATE = USD_PKR_RATE

function fmt(pkr: number, currency: 'PKR' | 'USD') {
  if (currency === 'USD') return '$' + Math.round(pkr / USD_RATE).toLocaleString('en-US')
  return '₨' + Math.round(pkr).toLocaleString('en-PK')
}

function planFor(clients: number) {
  if (clients <= 1) return { name: 'Starter', pkr: 2500 }
  if (clients <= 8) return { name: 'Pro', pkr: 7500 }
  return { name: 'Agency', pkr: 20000 }
}

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--ink)', minHeight: 34, lineHeight: 1.3 }
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--bg)', color: 'var(--ink)', fontSize: 15,
}

export function AgencyRetainerCalculator() {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('USD')
  const [clients, setClients] = useState(10)
  // Store retainer in PKR internally; convert for display/input.
  const [retainerPkr, setRetainerPkr] = useState(12000)

  const retainerDisplay = currency === 'USD' ? Math.round(retainerPkr / USD_RATE) : retainerPkr
  function handleRetainer(raw: number) {
    setRetainerPkr(currency === 'USD' ? raw * USD_RATE : raw)
  }

  const plan = planFor(clients)
  const revenuePkr = clients * retainerPkr
  const profitPkr = revenuePkr - plan.pkr
  const annualPkr = profitPkr * 12
  const marginPct = revenuePkr > 0 ? Math.round((profitPkr / revenuePkr) * 100) : 0

  const tiles = [
    { label: 'Monthly recurring revenue', value: fmt(revenuePkr, currency) },
    { label: `Monthly profit (${marginPct}% margin)`, value: fmt(profitPkr, currency), accent: true },
    { label: 'Profit per year', value: fmt(annualPkr, currency) },
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
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18,
      }}>
        <label style={field}>
          <span style={labelStyle}>Clients on a chatbot retainer</span>
          <input type="number" min={1} style={inputStyle} value={clients} onChange={(e) => setClients(+e.target.value || 1)} />
        </label>
        <label style={field}>
          <span style={labelStyle}>What you charge each / month ({currency === 'PKR' ? '₨' : '$'})</span>
          <input type="number" min={0} style={inputStyle} value={retainerDisplay} onChange={(e) => handleRetainer(+e.target.value || 0)} />
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
        With {clients} {clients === 1 ? 'client' : 'clients'} you need the {plan.name} plan
        at {plan.pkr === 0 ? 'no cost' : fmt(plan.pkr, currency) + '/mo'}. Octively charges one flat
        rate, so adding more clients raises your profit without raising your per-client cost.
        {currency === 'USD' && ` Rates shown in USD (1 USD = ${USD_RATE} PKR approx.). Switch to ₨ PKR to see local figures.`}
      </p>
    </div>
  )
}
