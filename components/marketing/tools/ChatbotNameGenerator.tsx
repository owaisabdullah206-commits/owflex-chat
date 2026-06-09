'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import {
  pickNames,
  VIBE_LABELS,
  INDUSTRY_LABELS,
  type NameVibe,
  type NameIndustry,
} from '@/lib/data/chatbot-names'

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--ink)' }
const selectStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--bg)', color: 'var(--ink)', fontSize: 15,
}

export function ChatbotNameGenerator() {
  const [vibe, setVibe] = useState<NameVibe>('friendly')
  const [industry, setIndustry] = useState<NameIndustry>('general')
  const [names, setNames] = useState<string[]>(() => pickNames('friendly', 'general'))
  const [copied, setCopied] = useState<string | null>(null)
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'error'>('idle')

  function generate() {
    setNames(pickNames(vibe, industry))
  }

  async function generateWithAi() {
    setAiState('loading')
    try {
      const res = await fetch('/api/v1/tools/name-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe, industry }),
      })
      if (!res.ok) {
        setAiState('error')
        return
      }
      const data = (await res.json()) as { names?: string[] }
      if (data.names?.length) setNames(data.names)
      setAiState('idle')
    } catch {
      setAiState('error')
    }
  }

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(name)
      setCopied(name)
      setTimeout(() => setCopied((c) => (c === name ? null : c)), 1500)
    } catch {
      /* clipboard blocked, ignore */
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Inputs */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 14, padding: 24,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18,
      }}>
        <label style={field}>
          <span style={labelStyle}>Tone</span>
          <select style={selectStyle} value={vibe} onChange={(e) => setVibe(e.target.value as NameVibe)}>
            {(Object.keys(VIBE_LABELS) as NameVibe[]).map((v) => (
              <option key={v} value={v}>{VIBE_LABELS[v]}</option>
            ))}
          </select>
        </label>
        <label style={field}>
          <span style={labelStyle}>Industry</span>
          <select style={selectStyle} value={industry} onChange={(e) => setIndustry(e.target.value as NameIndustry)}>
            {(Object.keys(INDUSTRY_LABELS) as NameIndustry[]).map((i) => (
              <option key={i} value={i}>{INDUSTRY_LABELS[i]}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={generate}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: 'var(--of-primary)', color: 'white', border: 'none', cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} /> Generate names
        </button>
        <button
          onClick={generateWithAi}
          disabled={aiState === 'loading'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: 'transparent', color: 'var(--ink)',
            border: '1px solid var(--hairline-strong)', cursor: 'pointer',
          }}
        >
          <Sparkles size={16} /> {aiState === 'loading' ? 'Thinking...' : 'Generate with AI'}
        </button>
      </div>

      {aiState === 'error' && (
        <p style={{ fontSize: 13, color: 'var(--of-error)' }}>
          The AI generator is busy right now. The names below still work, or try again in a minute.
        </p>
      )}

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {names.map((name) => (
          <button
            key={name}
            onClick={() => copy(name)}
            title="Click to copy"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              background: 'var(--surface)', border: '1px solid var(--hairline)',
              borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
              color: 'var(--ink)', fontSize: 15, fontWeight: 600,
            }}
          >
            {name}
            {copied === name
              ? <Check size={15} color="var(--of-success)" />
              : <Copy size={15} color="var(--ink-subtle)" />}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-subtle)', lineHeight: 1.6 }}>
        Click any name to copy it. Pick a name that sounds natural in a greeting, like
        &quot;Hi, I&apos;m [name]&quot;. Test your top two or three in a real welcome message before you commit.
      </p>
    </div>
  )
}
