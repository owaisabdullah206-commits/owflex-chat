'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MarketingNav } from '../MarketingNav'
import MarketingFooter from '../MarketingFooter'
import { useDarkMode } from '../useDarkMode'
import { FREE_TOOLS } from '@/lib/data/free-tools'

export function ToolsIndexPage() {
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
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500,
          }}>
            Free tools
          </span>
          <h1 style={{
            marginTop: 10, fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 700,
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            Free tools for selling and building AI chatbots
          </h1>
          <p style={{ marginTop: 14, fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: '60ch' }}>
            Calculators and generators for freelancers and agencies. No signup, no credit card. Use them to price
            a service, set up a bot, and win the client.
          </p>
        </div>
      </section>

      <section style={{ paddingBottom: 64 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {FREE_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.slug}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  background: 'var(--surface)', border: '1px solid var(--hairline)',
                  borderRadius: 14, padding: 22, textDecoration: 'none', color: 'var(--ink)',
                }}
                className="mkt-tool-card"
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{tool.title}</span>
                  <ArrowRight size={16} color="var(--of-primary)" />
                </span>
                <span style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55 }}>{tool.blurb}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
