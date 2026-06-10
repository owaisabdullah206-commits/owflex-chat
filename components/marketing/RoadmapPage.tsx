'use client'

import Link from 'next/link'
import { ArrowRight, Check, Zap, Clock } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'

const SHIPPED = [
  'RAG knowledge base — document & URL ingestion',
  'PDF upload + website scraping — knowledge base via dashboard UI',
  'Unanswered questions list — see every query the bot could not answer',
  'Multi-bot dashboard — manage every client from one place',
  'Routing intelligence — per-bot model selection',
  'Admin analytics — platform-wide usage visibility',
  'Credit packs — buy more without upgrading',
  'Embed widget — one script tag, live in minutes',
  'Google OAuth + email/password auth',
  'Client invitation flow — email invite to portal access',
  'Document upload status indicators — step-by-step progress UI',
  'Pre-conversation lead form — collect visitor info before chat opens',
  'Human handoff — bot flags conversations when it expresses uncertainty',
  'Enhanced conversation analytics — per-bot metrics and resolution rate',
  'Sub-tenant credit management — per-org credit caps from admin panel',
  'BYOK — bring your own LLM keys, encrypted at rest',
  'Audit log viewer — searchable workspace action history',
  'Deterministic RAG text cleaning — boilerplate removal, noise filtering before embedding',
  'Selective page crawling — include/exclude URL path glob filters per crawl job',
  'CSV / Excel product catalog import — Shopify and WooCommerce auto-detection',
  'Product catalog overwrite — re-upload without duplicates, unique identifier column picker',
  'Streaming responses — token-by-token SSE output with typing indicator, zero perceived latency',
  'Message ratings — thumbs up/down on each bot reply; satisfaction % in Analytics tab',
  'Per-page analytics — top-pages breakdown: conversations, messages, and escalation % per URL',
  'Lead webhook — outbound POST to Zapier, Make, n8n, or any endpoint with HMAC-SHA256 signing',
  'Chat history persistence — localStorage with 24-hour TTL; messages replay when visitor returns',
  'Bot preview panel — sandboxed iframe widget inside the dashboard for zero-context-switch testing',
  'Per-product CSV chunking — each catalog row embedded as an atomic chunk, no cross-row field splits',
  'RAG retrieval quality fix — generic product queries now reliably surface catalog items',
  'Instant lead notification email: bot owner emailed the moment a visitor leaves their contact details',
  'Reply language control: Auto, English, Urdu, or Roman Urdu per bot',
  'WhatsApp continue button: visitors move the chat to WhatsApp in one tap',
  'Domain lock by default: every bot is tied to its Store URL so a copied embed key cannot be reused elsewhere',
  'Over-limit leads banner: leads past your plan limit are saved and surfaced with an upgrade prompt',
]

const IN_PROGRESS = [
  { title: 'WordPress plugin', desc: 'One-click install, no manual script pasting.' },
  { title: 'Weekly email digest', desc: 'A Monday summary of each bot\'s conversations, new leads, and unanswered questions delivered to your inbox.' },
  { title: 'Team seats', desc: 'Invite colleagues to your workspace with role-based access controls.' },
]

const PLANNED = [
  { title: 'WhatsApp Business API channel', desc: 'Run your client\'s bot on their WhatsApp Business number, not just their website. The same knowledge base and lead capture, on the channel Pakistani customers actually use.' },
  { title: 'PayFast (PKR) + Lemon Squeezy (USD) billing', desc: 'Self-serve plan upgrades and credit top-ups via PayFast for Pakistani developers and Lemon Squeezy for international payments — no WhatsApp message required.' },
  { title: 'Embed key rotation', desc: 'Rotate a compromised embed key with a 24-hour grace window — deployed widgets stay live while you push the updated key to production.' },
  { title: 'Hybrid RAG — vector + full-text', desc: 'Combine cosine similarity with BM25 (Postgres tsvector) and re-rank the union. Exact product names and SKUs surface reliably even when embedding scores are low.' },
  { title: 'Custom portal subdomain', desc: 'Serve your client portal from portal.youragency.com instead of app.octively.com.' },
  { title: 'Full REST API access', desc: 'Programmatic CRUD for bots, conversations, and leads. Lead webhooks are already live — this adds the full read/write API surface.' },
  { title: 'Mobile app', desc: 'iOS and Android app for managing bots and reviewing leads on the go.' },
  { title: 'Self-hosted option', desc: 'Run Octively on your own infrastructure for regulated or on-prem Enterprise deployments.' },
]

export default function RoadmapPage() {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      {/* Hero */}
      <section style={{ paddingBlock: '72px 56px', borderBottom: '1px solid var(--hairline)', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 16 }}>Roadmap</p>
          <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>What we&apos;re building</h1>
          <p style={{ fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.65 }}>
            Honest, public tracking of what&apos;s done, in progress, and planned. No vague &ldquo;coming soon&rdquo; — just a real list.
          </p>
        </div>
      </section>

      {/* Three-column board */}
      <section style={{ paddingBlock: 64 }}>
        <div className="mkt-grid-3" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>

          {/* Shipped */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 10 }}>
              <Check size={15} style={{ color: 'var(--of-success)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--of-success)' }}>Shipped</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-subtle)', marginLeft: 'auto' }}>{SHIPPED.length} items</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SHIPPED.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', border: '1px solid var(--hairline)', borderRadius: 8, background: 'var(--surface)', fontSize: 13.5, lineHeight: 1.5 }}>
                  <Check size={13} style={{ color: 'var(--of-success)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: 'var(--ink-muted)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* In progress */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: 'rgba(14,165,233,0.06)', border: '1px solid var(--of-primary)', borderRadius: 10 }}>
              <Zap size={14} style={{ color: 'var(--of-primary)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--of-primary)' }}>In progress</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-subtle)', marginLeft: 'auto' }}>{IN_PROGRESS.length} items</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {IN_PROGRESS.map(({ title, desc }) => (
                <div key={title} style={{ padding: '16px 14px', border: '1px solid var(--of-primary)', borderRadius: 8, background: 'rgba(14,165,233,0.04)' }}>
                  <p style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 5, color: 'var(--ink)' }}>{title}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Planned */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 10 }}>
              <Clock size={14} style={{ color: 'var(--ink-subtle)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)' }}>Planned</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-subtle)', marginLeft: 'auto' }}>{PLANNED.length} items</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PLANNED.map(({ title, desc }) => (
                <div key={title} style={{ padding: '16px 14px', border: '1px solid var(--hairline)', borderRadius: 8, background: 'var(--surface)' }}>
                  <p style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 5, color: 'var(--ink-muted)' }}>{title}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-subtle)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature request note */}
      <section style={{ paddingBlock: 56, borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Have a feature request?</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 28, lineHeight: 1.6 }}>
            Talk to us directly. Most of what&apos;s on this list came from developer feedback.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link
              href="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 20px',
                background: 'var(--of-primary)', color: 'white',
                fontSize: 14, fontWeight: 500, borderRadius: 8, textDecoration: 'none',
              }}
            >
              Request a feature <ArrowRight size={13} />
            </Link>
            <Link
              href="/dashboard/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 20px',
                border: '1px solid var(--hairline)',
                background: 'var(--bg)', color: 'var(--ink)',
                fontSize: 14, fontWeight: 500, borderRadius: 8, textDecoration: 'none',
              }}
            >
              Start free
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
