'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'

const RELEASES = [
  {
    version: 'v0.7.0',
    date: 'May 2026',
    tag: 'Latest',
    items: [
      'Routing Intelligence page — per-bot model routing decisions with latency metrics',
      'Redis error logging for chat failures — surfaced in admin panel',
      'Admin analytics: developer counts, org-less user tracking, platform-wide usage',
      'Bot settings page sticky preview — live chatbot visible while editing',
      'Attribution footer for agency/enterprise — white-label with optional toggle',
      'Rebranded public surfaces from OwFlex → Octively',
    ],
  },
  {
    version: 'v0.6.0',
    date: 'Apr 2026',
    tag: 'Billing',
    items: [
      'PayFast integration (PKR payments) + Lemon Squeezy (USD payments)',
      'Credit packs — purchase additional AI credits without upgrading plan',
      'Bento-style plan cards on pricing and billing pages',
      'Annual billing toggle with 2-month discount',
      'Live plan usage meter in billing dashboard',
    ],
  },
  {
    version: 'v0.5.0',
    date: 'Mar 2026',
    tag: 'RAG',
    items: [
      'Knowledge base — document ingestion (PDF, DOCX, web URL)',
      'RAG retrieval at chat time — bot answers grounded in your documents',
      'Smart model routing toggle per bot',
      'Google Gemini text-embedding-004 for vector search',
      'Cloudflare R2 storage for uploaded documents',
    ],
  },
  {
    version: 'v0.4.0',
    date: 'Feb 2026',
    tag: 'Portal',
    items: [
      'Client portal — conversation history, lead captures, and settings',
      'White-label branding — custom logo, accent colour, powered-by text',
      'Embed widget v2 — floating chat bubble with lead capture form',
      'Client invitation flow — email invite → account creation → portal access',
    ],
  },
  {
    version: 'v0.3.0',
    date: 'Jan 2026',
    tag: 'Multi-bot',
    items: [
      'Multi-bot support — unlimited bots per workspace (plan limits apply)',
      'Bot settings page — model selection, greeting message, colour theme',
      'Live preview panel in bot settings — test without embedding',
      'Conversation viewer in dashboard',
    ],
  },
  {
    version: 'v0.2.0',
    date: 'Dec 2025',
    tag: 'Dashboard',
    items: [
      'Dashboard MVP — bots list, clients list, leads table',
      'Organisation and role system — developer vs. client',
      'Drizzle ORM + Neon PostgreSQL schema',
      'BetterAuth — email/password + Google OAuth',
    ],
  },
  {
    version: 'v0.1.0',
    date: 'Nov 2025',
    tag: 'Foundation',
    items: [
      'Initial project setup — Next.js 15 App Router, TypeScript strict mode',
      'Embed widget v1 — chat window with session persistence',
      'LiteLLM integration for model-agnostic inference',
      'First chatbot integration (DeepSeek)',
    ],
  },
]

const TAG_COLORS: Record<string, string> = {
  Latest: 'var(--of-primary)',
  Billing: 'var(--of-success)',
  RAG: '#8B5CF6',
  Portal: '#F59E0B',
  'Multi-bot': '#06B6D4',
  Dashboard: 'var(--ink-muted)',
  Foundation: 'var(--ink-subtle)',
}

export default function ChangelogPage() {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      {/* Header */}
      <section style={{ paddingBlock: '72px 56px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 16 }}>Changelog</p>
          <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 14 }}>What&apos;s shipped</h1>
          <p style={{ fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            We ship improvements every week. This is the full history.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, padding: '5px 12px', border: '1px solid var(--hairline)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-muted)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-success)', display: 'inline-block' }} />
            Current: v0.7.0-beta
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ paddingBlock: 64 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {RELEASES.map(({ version, date, tag, items }, idx) => (
              <div
                key={version}
                className="mkt-changelog-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: 32,
                  paddingBlock: 40,
                  borderBottom: idx < RELEASES.length - 1 ? '1px solid var(--hairline)' : 'none',
                }}
              >
                {/* Left */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      color: 'var(--ink)',
                    }}>
                      {version}
                    </span>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: TAG_COLORS[tag] ?? 'var(--ink-muted)',
                    marginBottom: 6,
                  }}>
                    {tag}
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-subtle)', margin: 0 }}>{date}</p>
                </div>

                {/* Right */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.6 }}>
                      <Check size={14} style={{ color: 'var(--of-primary)', flexShrink: 0, marginTop: 3 }} />
                      <span style={{ color: 'var(--ink-muted)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap CTA */}
      <section style={{ paddingBlock: 56, borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>See what&apos;s coming next</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 24 }}>WordPress plugin, custom domains, team seats, and more.</p>
          <Link
            href="/roadmap"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 40, padding: '0 20px',
              border: '1px solid var(--hairline)',
              background: 'var(--bg)', color: 'var(--ink)',
              fontSize: 14, fontWeight: 500, borderRadius: 8, textDecoration: 'none',
            }}
          >
            View roadmap <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
