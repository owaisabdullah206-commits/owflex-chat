'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import { APP_VERSION } from '@/lib/version'

const RELEASES = [
  {
    version: 'v1.3.0',
    date: 'June 2026',
    tag: 'Latest',
    items: [
      'Lead pipeline: set every lead to New, Contacted, Won, or Lost straight from the dashboard or the client portal, with a live counts-per-stage summary so you can see what actually converted, not just how many leads came in',
      'Slack lead alerts: paste a Slack Incoming Webhook URL into bot settings and every new lead posts a formatted message to your channel the moment it lands',
      'Embed key rotation: rotate a compromised embed key in one click; the old key keeps working for a 24-hour grace window so deployed widgets stay live while you push the new key to production',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'June 2026',
    tag: 'Notifications',
    items: [
      'Instant lead notification email: the moment a visitor leaves their details, the bot owner gets an email with the name, email, phone, and a link to the conversation, so no lead sits unseen',
      'Reply language control per bot: pick Auto (mirror the visitor), English, Urdu, or Roman Urdu in bot settings and every reply follows that choice',
      'WhatsApp continue button: add a WhatsApp number in settings and the widget shows a “Continue on WhatsApp” button so visitors can move the chat to WhatsApp in one tap',
      'Domain lock by default: every bot is tied to its Store URL, so a copied embed key cannot be used to run your bot (and spend your credits) on someone else’s website',
      'Over-limit leads banner: leads captured past your plan limit are saved and surfaced with an upgrade prompt instead of being silently dropped',
      'Per-bot usage tab: conversations, messages, tokens, credits, and cost at a glance with model breakdown — see exactly how each bot is consuming resources',
    ],
  },
  {
    version: 'v1.1.0',
    date: 'May 2026',
    tag: 'Insights',
    items: [
      'Unanswered questions now show the full pair: each visitor question with the bot’s uncertain reply beneath it, plus a link to view the conversation, so you can see exactly what to add to the knowledge base',
      'Streaming SSE fix — Content-Encoding: none header prevents Next.js from gzip-buffering the stream; responses now appear token-by-token on all providers and connection types',
      'Response conciseness rule — bot replies in 1–3 sentences for greetings and simple queries; product cards carry the detail so the text stays clean; explicit detail requests ("tell me more about X") still get a full answer',
      'Model speed badges — all four model selectors in bot settings now show a tier pill (⚡ Ultra Fast / ⚡ Fast / ⚖️ Balanced / 🧠 Smart / 🔮 Experimental) and a latency note beneath each dropdown so you can compare before saving',
      'Quota exceeded document status — when the Jina embedding quota is hit the document row shows an amber clock badge "Quota exceeded" and a note that it will retry automatically the next day instead of a permanent red failure',
      'Live credit balance in dashboard header — compact balance/limit pill (e.g. 1.2M / 2M) sits beside the theme toggle on every dashboard page; auto-refreshes every 60 s; turns amber below 20% and red below 5%; click to go to the Usage page',
      'Admin audit auto-refresh — both audit log pages refresh every 30 seconds automatically; manual refresh button with timestamp shows when data was last fetched',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'May 2026',
    tag: 'Streaming',
    items: [
      'Streaming responses — token-by-token SSE output replaces single-shot JSON; typing indicator appears on first token for zero perceived latency',
      'Message ratings — thumbs up/down SVG icons appear below each bot reply; satisfaction percentage visible in the Analytics tab',
      'Per-page analytics — "Top pages" table in Analytics shows conversation count, message count, and escalation % per URL',
      'Lead webhook — configure an outbound URL per bot (Settings → Integrations); payload signed with HMAC-SHA256 for Zapier, Make, n8n, or any custom endpoint',
      'Chat history persistence — widget switches to localStorage with 24-hour TTL; messages replay automatically when a visitor returns to the page',
      'Bot preview panel — new "Preview" tab in the bot detail page loads your live widget in a sandboxed iframe for instant testing without leaving the dashboard',
      'Per-product CSV chunking — each product row is now embedded as its own atomic chunk; cross-row field splits that silently broke retrieval are eliminated',
      'RAG retrieval threshold lowered 0.40 → 0.20 — generic queries ("what lipsticks do you have?") now reliably surface catalog items',
      'WhatsApp number now reads from NEXT_PUBLIC_WHATSAPP_NUMBER env var on the contact page — update without a redeploy',
    ],
  },
  {
    version: 'v0.9.0',
    date: 'May 2026',
    tag: 'RAG Quality',
    items: [
      'Deterministic RAG text cleaning — nav menus, cookie banners, and footer boilerplate stripped across all crawled pages before embedding (frequency analysis, zero AI calls)',
      'Chunk quality filter — structural noise under 40 characters discarded automatically, reducing hallucination-inducing orphan headings and stray bullets',
      'Selective page crawling — include/exclude URL path glob filters (e.g. /docs/**, skip /blog) passed through to Firecrawl per crawl job',
      'CSV / Excel product catalog import — auto-detects Shopify and WooCommerce exports, strips HTML from descriptions, includes product image URL and product URL per passage',
      'Product catalog overwrite — unique identifier column picker (Handle / ID / SKU) prevents duplicate embeddings on re-upload of updated catalogs',
      'Platform prompt editor — guidance card explaining what belongs in the platform prompt, insert-example button, 3,000-character hard limit with live counter',
    ],
  },
  {
    version: 'v0.8.0',
    date: 'May 2026',
    tag: 'Operations',
    items: [
      'Document upload status indicators — live step-by-step progress (Queued → Parsing → Embedding → Finalizing)',
      'Pre-conversation lead form — collect visitor name, email, and phone before chat opens',
      'Human handoff detection — bot flags conversations for human review when it expresses uncertainty',
      'Enhanced conversation analytics — per-bot metrics, resolution rate, and escalation tracking',
      'Sub-tenant credit management — per-org credit caps configurable from admin panel',
      'BYOK — bring your own LLM key, encrypted at rest with AES-GCM',
      'Audit log viewer — searchable workspace action history for admin compliance',
      'Smart auto-routing updated — "auto" model option routes each query by complexity',
    ],
  },
  {
    version: 'v0.7.0',
    date: 'May 2026',
    tag: 'Routing',
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
  Latest:       'var(--of-primary)',
  Insights:     '#8B5CF6',
  Streaming:    '#06B6D4',
  'RAG Quality': '#8B5CF6',
  Operations:   '#10B981',
  Routing:      '#06B6D4',
  Billing:      'var(--of-success)',
  RAG:          '#8B5CF6',
  Portal:       '#F59E0B',
  'Multi-bot':  '#06B6D4',
  Dashboard:    'var(--ink-muted)',
  Foundation:   'var(--ink-subtle)',
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
            Current: {APP_VERSION}
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
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 24 }}>Team seats, WordPress plugin, weekly email digest, API access, custom portal subdomains, and more.</p>
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
