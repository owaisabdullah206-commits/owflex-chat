'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'
import { FAQ_STARTERS, formatStarterText } from '@/lib/data/faq-starters'

interface Faq {
  question: string
  answer: string
}

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--ink)' }
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--bg)', color: 'var(--ink)', fontSize: 15, fontFamily: 'inherit',
}

// The universal starter questions shown before the user generates anything.
const STARTERS: Faq[] = FAQ_STARTERS.map((f) => ({ question: f.question, answer: `[${f.answerHint}]` }))

export function ChatbotFaqGenerator() {
  const [business, setBusiness] = useState('')
  const [details, setDetails] = useState('')
  const [faqs, setFaqs] = useState<Faq[]>(STARTERS)
  const [isAi, setIsAi] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [copiedAll, setCopiedAll] = useState(false)

  async function generate() {
    if (!details.trim()) {
      setState('error')
      return
    }
    setState('loading')
    try {
      const res = await fetch('/api/v1/tools/faq-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, details }),
      })
      if (!res.ok) {
        setState('error')
        return
      }
      const data = (await res.json()) as { faqs?: Faq[] }
      if (data.faqs?.length) {
        setFaqs(data.faqs)
        setIsAi(true)
      }
      setState('idle')
    } catch {
      setState('error')
    }
  }

  async function copyAll() {
    const text = isAi
      ? faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : formatStarterText()
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1800)
    } catch {
      /* clipboard blocked, ignore */
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Inputs */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 14, padding: 24, display: 'grid', gap: 18,
      }}>
        <label style={field}>
          <span style={labelStyle}>Business name (optional)</span>
          <input
            type="text"
            style={inputStyle}
            value={business}
            placeholder="e.g. Acme Tailors"
            onChange={(e) => setBusiness(e.target.value)}
          />
        </label>
        <label style={field}>
          <span style={labelStyle}>Describe your business, products, and services</span>
          <textarea
            style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
            value={details}
            placeholder="e.g. We are a tailoring shop in Karachi. We do custom stitching for men and women, alterations, and wedding wear. Turnaround is 5 to 7 days. We deliver across the city."
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={generate}
            disabled={state === 'loading'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: 'var(--of-primary)', color: 'white', border: 'none', cursor: 'pointer',
            }}
          >
            <Sparkles size={16} /> {state === 'loading' ? 'Generating...' : 'Generate FAQs with AI'}
          </button>
          {state === 'error' && (
            <span style={{ fontSize: 13, color: 'var(--of-error)' }}>
              {details.trim()
                ? 'The generator is busy. Use the starter questions below, or try again in a minute.'
                : 'Add a few details about your business first.'}
            </span>
          )}
        </div>
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
          {isAi ? 'Your generated FAQ' : 'Starter questions every business should answer'}
        </p>
        <button
          onClick={copyAll}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: 'transparent', color: 'var(--ink)',
            border: '1px solid var(--hairline-strong)', cursor: 'pointer',
          }}
        >
          {copiedAll ? <Check size={14} color="var(--of-success)" /> : <Copy size={14} />}
          {copiedAll ? 'Copied' : 'Copy all'}
        </button>
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gap: 10 }}>
        {faqs.map((f, i) => (
          <div
            key={`${f.question}-${i}`}
            style={{
              background: 'var(--surface)', border: '1px solid var(--hairline)',
              borderRadius: 12, padding: '16px 18px',
            }}
          >
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{f.question}</p>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55 }}>{f.answer}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-subtle)', lineHeight: 1.6 }}>
        {isAi
          ? 'Review the answers and fix anything that is not quite right. Then copy all and paste them into your Octively bot’s knowledge base.'
          : 'These are the questions to cover first. Add details above and generate a full FAQ tailored to your business, ready to paste into Octively.'}
      </p>
    </div>
  )
}
