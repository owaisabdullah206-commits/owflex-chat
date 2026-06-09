'use client'

import { useState } from 'react'
import { Check, X, Search } from 'lucide-react'

interface ReadinessCheck {
  id: string
  label: string
  passed: boolean
  tip: string
}
interface ReadinessResult {
  score: number
  verdict: 'ready' | 'almost' | 'needs-work'
  headline: string
  checks: ReadinessCheck[]
  wordCount: number
}

const VERDICT_COLOR: Record<ReadinessResult['verdict'], string> = {
  ready: 'var(--of-success)',
  almost: 'var(--of-primary)',
  'needs-work': 'var(--of-error)',
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: 10,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--bg)', color: 'var(--ink)', fontSize: 15, flex: 1, minWidth: 220,
}

export function WebsiteReadinessChecker() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ReadinessResult | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function check(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/v1/tools/readiness-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data?.error ?? 'Something went wrong. Try again.')
        setState('error')
        return
      }
      setResult(data as ReadinessResult)
      setState('idle')
    } catch {
      setErrorMsg('Could not reach the checker. Try again in a minute.')
      setState('error')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <form onSubmit={check} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="url"
          style={inputStyle}
          value={url}
          placeholder="https://yourclient.com"
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Website URL"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 22px', borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: 'var(--of-primary)', color: 'white', border: 'none', cursor: 'pointer',
          }}
        >
          <Search size={16} /> {state === 'loading' ? 'Checking...' : 'Check website'}
        </button>
      </form>

      {state === 'error' && (
        <p style={{ fontSize: 14, color: 'var(--of-error)' }}>{errorMsg}</p>
      )}

      {state === 'loading' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 56, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--hairline)' }} />
          ))}
        </div>
      )}

      {result && state !== 'loading' && (
        <>
          {/* Score banner */}
          <div style={{
            background: 'var(--surface)', border: `1px solid ${VERDICT_COLOR[result.verdict]}`,
            borderRadius: 14, padding: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 700,
              color: VERDICT_COLOR[result.verdict], lineHeight: 1,
            }}>
              {result.score}/5
            </div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--ink)', flex: 1, minWidth: 200 }}>
              {result.headline}
            </p>
          </div>

          {/* Checks */}
          <div style={{ display: 'grid', gap: 10 }}>
            {result.checks.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  background: 'var(--surface)', border: '1px solid var(--hairline)',
                  borderRadius: 12, padding: '14px 16px',
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}>
                  {c.passed
                    ? <Check size={18} color="var(--of-success)" />
                    : <X size={18} color="var(--of-error)" />}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{c.label}</p>
                  {!c.passed && (
                    <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{c.tip}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p style={{ fontSize: 13, color: 'var(--ink-subtle)', lineHeight: 1.6 }}>
        This checks the page you enter, not the whole site. It is a quick read of whether a chatbot would have
        enough to work with. With Octively you can upload documents and scrape more pages to fill any gaps.
      </p>
    </div>
  )
}
