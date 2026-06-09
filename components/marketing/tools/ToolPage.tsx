'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { MarketingNav } from '../MarketingNav'
import MarketingFooter from '../MarketingFooter'
import { useDarkMode } from '../useDarkMode'

/**
 * Shared chrome for the free marketing tools (calculators + directory).
 * Renders the marketing nav, a header, the tool body, an email-capture CTA,
 * and the footer. Keep all copy em-dash free.
 */
export function ToolPage({
  eyebrow,
  title,
  intro,
  source,
  children,
}: {
  eyebrow: string
  title: string
  intro: string
  source: string
  children: React.ReactNode
}) {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div
      className={`marketing${dark ? ' dark' : ''}`}
      style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}
    >
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      <section style={{ paddingTop: 56, paddingBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div className="mkt-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--of-primary)',
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </span>
          <h1
            style={{
              marginTop: 10,
              fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          <p style={{ marginTop: 14, fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: '60ch' }}>
            {intro}
          </p>
        </div>
      </section>

      <section style={{ paddingBottom: 56 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>{children}</div>
      </section>

      <ToolCTA source={source} />
      <MarketingFooter />
    </div>
  )
}

/** Email capture + signup CTA band shared by every tool. */
function ToolCTA({ source }: { source: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    try {
      const res = await fetch('/api/v1/tools/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  const inputControl: React.CSSProperties = {
    height: 46,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid var(--hairline-strong)',
    background: 'var(--bg)',
    color: 'var(--ink)',
    fontSize: 14,
  }

  return (
    <section style={{ paddingBottom: 72 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 20,
            padding: '40px 32px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 2.6vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Ready to sell this as a service?
          </h2>
          <p style={{ marginTop: 10, color: 'var(--ink-muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 460, marginInline: 'auto' }}>
            Build the chatbot, embed it on your client&apos;s site, and give them their own branded portal.
            Start free, no credit card.
          </p>

          {/* Primary actions */}
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/dashboard/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: 46, padding: '0 24px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                background: 'var(--of-primary)', color: 'white', textDecoration: 'none',
              }}
            >
              Start free <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 46, padding: '0 24px', borderRadius: 10, fontSize: 15, fontWeight: 500,
                color: 'var(--ink)', border: '1px solid var(--hairline-strong)', textDecoration: 'none',
              }}
            >
              See pricing
            </Link>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: 420, margin: '28px auto 0' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--hairline-strong)' }} />
            <span style={{ fontSize: 12.5, color: 'var(--ink-subtle)', whiteSpace: 'nowrap' }}>or get the free playbook</span>
            <span style={{ flex: 1, height: 1, background: 'var(--hairline-strong)' }} />
          </div>

          {/* Email capture */}
          {state === 'done' ? (
            <p style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--of-success)', fontSize: 14, fontWeight: 500 }}>
              <Check size={16} /> Thanks. The freelancer playbook is on its way to your inbox.
            </p>
          ) : (
            <>
              <form onSubmit={submit} style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 440, marginInline: 'auto' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  style={{ ...inputControl, flex: 1, minWidth: 180 }}
                />
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  style={{
                    ...inputControl,
                    border: 'none', background: 'var(--ink)', color: 'var(--bg)',
                    fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {state === 'loading' ? 'Sending...' : 'Email it to me'}
                </button>
              </form>
              <p style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-subtle)' }}>
                {state === 'error'
                  ? <span style={{ color: 'var(--of-error)' }}>Something went wrong. Please try again.</span>
                  : 'How to price and sell AI chatbot retainers. No spam, unsubscribe anytime.'}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
