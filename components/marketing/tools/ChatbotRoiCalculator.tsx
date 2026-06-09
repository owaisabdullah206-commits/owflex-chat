'use client'

import { useState } from 'react'
import { USD_PKR_RATE } from '@/lib/currency'

const USD_RATE = USD_PKR_RATE

function fmt(pkr: number, currency: 'PKR' | 'USD') {
  if (currency === 'USD') return '$' + Math.round(pkr / USD_RATE).toLocaleString('en-US')
  return '₨' + Math.round(pkr).toLocaleString('en-PK')
}

// Conversion assumptions — conservative, based on typical SMB websites.
const CHAT_RATE = 0.08      // share of visitors who open the chat
const LEAD_RATE = 0.25      // share of chats that leave contact details
const CLOSE_RATE = 0.2      // share of leads that become customers
const DEFLECT_RATE = 0.6    // share of support questions answered by the bot
const MINUTES_PER_REQUEST = 6

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--ink)', minHeight: 34, lineHeight: 1.3 }

function inputStyle(currency: 'PKR' | 'USD'): React.CSSProperties {
  return {
    padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--hairline-strong)',
    background: 'var(--bg)', color: 'var(--ink)', fontSize: 15,
  }
}

export function ChatbotRoiCalculator() {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('USD')
  const [visitors, setVisitors] = useState(5000)
  const [leadValuePkr, setLeadValuePkr] = useState(8000)
  const [supportReqs, setSupportReqs] = useState(150)

  // Keep lead value in PKR internally; convert for display / input.
  const leadValueDisplay = currency === 'USD' ? Math.round(leadValuePkr / USD_RATE) : leadValuePkr
  function handleLeadValue(raw: number) {
    setLeadValuePkr(currency === 'USD' ? raw * USD_RATE : raw)
  }

  const chats = visitors * CHAT_RATE
  const leads = chats * LEAD_RATE
  const newRevenuePkr = leads * CLOSE_RATE * leadValuePkr
  const hoursSaved = (supportReqs * DEFLECT_RATE * MINUTES_PER_REQUEST) / 60

  const tiles = [
    { label: 'Estimated leads / month', value: Math.round(leads).toLocaleString('en-PK') },
    { label: 'Estimated new revenue / month', value: fmt(newRevenuePkr, currency), accent: true },
    { label: 'Support hours saved / month', value: `${Math.round(hoursSaved)} hrs` },
  ]

  const iStyle = inputStyle(currency)

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
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18,
      }}>
        <label style={field}>
          <span style={labelStyle}>Monthly website visitors</span>
          <input type="number" min={0} style={iStyle} value={visitors} onChange={(e) => setVisitors(+e.target.value || 0)} />
        </label>
        <label style={field}>
          <span style={labelStyle}>Avg value of one customer ({currency === 'PKR' ? '₨' : '$'})</span>
          <input type="number" min={0} style={iStyle} value={leadValueDisplay} onChange={(e) => handleLeadValue(+e.target.value || 0)} />
        </label>
        <label style={field}>
          <span style={labelStyle}>Support questions / month</span>
          <input type="number" min={0} style={iStyle} value={supportReqs} onChange={(e) => setSupportReqs(+e.target.value || 0)} />
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
        Assumes 8% of visitors chat, 25% leave contact details, and 20% of those become customers.
        The bot also handles about 60% of routine support questions.
        {currency === 'USD' && ` Rates shown in USD (1 USD = ${USD_RATE} PKR approx.). Switch to ₨ PKR to see local figures.`}
      </p>
    </div>
  )
}
