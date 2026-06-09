'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import {
  pickWelcomeMessages,
  TONE_LABELS,
  GOAL_LABELS,
  type MsgTone,
  type MsgGoal,
} from '@/lib/data/welcome-messages'

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--ink)' }
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--bg)', color: 'var(--ink)', fontSize: 15,
}

export function WelcomeMessageGenerator() {
  const [business, setBusiness] = useState('')
  const [tone, setTone] = useState<MsgTone>('friendly')
  const [goal, setGoal] = useState<MsgGoal>('support')
  const [messages, setMessages] = useState<string[]>(() => pickWelcomeMessages('friendly', 'support', ''))
  const [copied, setCopied] = useState<string | null>(null)
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'error'>('idle')

  function generate() {
    setMessages(pickWelcomeMessages(tone, goal, business))
  }

  async function generateWithAi() {
    setAiState('loading')
    try {
      const res = await fetch('/api/v1/tools/welcome-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, tone, goal }),
      })
      if (!res.ok) {
        setAiState('error')
        return
      }
      const data = (await res.json()) as { messages?: string[] }
      if (data.messages?.length) setMessages(data.messages)
      setAiState('idle')
    } catch {
      setAiState('error')
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      setTimeout(() => setCopied((c) => (c === text ? null : c)), 1500)
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
          <span style={labelStyle}>Tone</span>
          <select style={inputStyle} value={tone} onChange={(e) => setTone(e.target.value as MsgTone)}>
            {(Object.keys(TONE_LABELS) as MsgTone[]).map((t) => (
              <option key={t} value={t}>{TONE_LABELS[t]}</option>
            ))}
          </select>
        </label>
        <label style={field}>
          <span style={labelStyle}>Main goal</span>
          <select style={inputStyle} value={goal} onChange={(e) => setGoal(e.target.value as MsgGoal)}>
            {(Object.keys(GOAL_LABELS) as MsgGoal[]).map((g) => (
              <option key={g} value={g}>{GOAL_LABELS[g]}</option>
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
          <RefreshCw size={16} /> Generate messages
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
          The AI generator is busy right now. The messages below still work, or try again in a minute.
        </p>
      )}

      {/* Results */}
      <div style={{ display: 'grid', gap: 10 }}>
        {messages.map((msg) => (
          <button
            key={msg}
            onClick={() => copy(msg)}
            title="Click to copy"
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
              background: 'var(--surface)', border: '1px solid var(--hairline)',
              borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
              color: 'var(--ink)', fontSize: 15, lineHeight: 1.5,
            }}
          >
            <span>{msg}</span>
            {copied === msg
              ? <Check size={16} color="var(--of-success)" style={{ flexShrink: 0, marginTop: 2 }} />
              : <Copy size={16} color="var(--ink-subtle)" style={{ flexShrink: 0, marginTop: 2 }} />}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-subtle)', lineHeight: 1.6 }}>
        Click any message to copy it. Keep your opener short, say what the bot can do, and set one clear next step.
        Paste your favorite straight into your Octively bot&apos;s welcome message.
      </p>
    </div>
  )
}
