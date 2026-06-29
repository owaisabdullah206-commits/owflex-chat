'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Shield, Lock, Eye, Webhook, ArrowRight } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'widget', label: 'Widget security' },
  { id: 'auth', label: 'Authentication' },
  { id: 'data', label: 'Data protection' },
  { id: 'api', label: 'API security' },
  { id: 'webhooks', label: 'Webhook integrity' },
  { id: 'infra', label: 'Infrastructure' },
  { id: 'audit', label: 'Audit logging' },
  { id: 'faq', label: 'FAQ' },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); io.unobserve(el) }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ color: 'var(--of-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</span>
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{label}</div>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 90, marginBottom: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--ink)' }}>{title}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-muted)' }}>
        {children}
      </div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.6 }}>
          <span style={{ color: 'var(--of-primary)', marginTop: 4, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--hairline)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', flexShrink: 0, marginLeft: 12 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: 18, fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-muted)' }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function SecurityPage() {
  const { dark, toggleDark } = useDarkMode()
  const [activeSection, setActiveSection] = useState('overview')
  const ticking = useRef(false)

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    const ids = TOC.map(t => t.id)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!ticking.current) {
              ticking.current = true
              requestAnimationFrame(() => {
                setActiveSection(entry.target.id)
                ticking.current = false
              })
            }
          }
        }
      },
      { rootMargin: '-89px 0px -50% 0px', threshold: 0 }
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      <div className="mkt-legal-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 80px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 64, alignItems: 'start' }}>
        {/* Sidebar */}
        <nav className="mkt-legal-sidebar" style={{ position: 'sticky', top: 88, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 12 }}>On this page</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TOC.map(({ id, label }) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', color: activeSection === id ? 'var(--of-primary)' : 'var(--ink-muted)', fontWeight: activeSection === id ? 600 : 400, textDecoration: 'none', transition: 'color .15s' }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div style={{ maxWidth: 680 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 8 }}>Trust</p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Security</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 48, fontFamily: 'var(--font-mono)' }}>Last updated: 26 June 2026</p>

          <Reveal>
            <div className="mkt-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 48 }}>
              <StatTile icon={<Shield size={18} />} value="3" label="Rate limiting layers on every public endpoint" />
              <StatTile icon={<Lock size={18} />} value="AES-256" label="Encryption at rest for API keys and credentials" />
              <StatTile icon={<Webhook size={18} />} value="HMAC" label="Signature verification on all outbound webhooks" />
              <StatTile icon={<Eye size={18} />} value="0" label="Cross-tenant data leakage since launch" />
            </div>
          </Reveal>

          <Section id="overview" title="Overview">
            <p>Octively is a multi-tenant platform. Your clients&apos; conversations, leads, and configuration data live alongside other organisations&apos; data in shared infrastructure. That makes security a design constraint, not an afterthought.</p>
            <p style={{ marginTop: 12 }}>This page documents our security approach.</p>
          </Section>

          <Section id="widget" title="Widget security">
            <p>The embed widget is a third-party script your clients add to their websites. We take that seriously.</p>
            <BulletList items={[
              'Each bot gets a unique, cryptographically generated embed key.',
              'Embed keys can be rotated at any time. The previous key has a short grace period so existing visitors are not disrupted.',
              'Widgets locked to a domain only respond to requests from that domain. Leaked keys from a locked widget cannot be used elsewhere.',
              'Embed keys are truncated in error logs to prevent full key leakage.',
            ]} />
            <p style={{ marginTop: 16, padding: '12px 16px', background: 'var(--of-primary-soft)', borderRadius: 10, fontSize: 13.5, color: 'var(--of-primary-deep)', lineHeight: 1.6 }}>
              <strong>Coming soon:</strong> iframe sandbox isolation. The widget will run inside a sandboxed iframe, completely isolated from the host page&apos;s DOM, cookies, and session tokens. This is the industry standard for enterprise chat widgets.
            </p>
          </Section>

          <Section id="auth" title="Authentication">
            <BulletList items={[
              'Email/password authentication with mandatory email verification. Unverified accounts cannot sign in.',
              'Social login options available.',
              'Session cookies are scoped per subdomain to prevent cross-subdomain conflicts.',
              'Rate limiting is enforced on all authentication endpoints.',
              'Authentication requests are restricted to known origins. Unknown origins are rejected.',
            ]} />
          </Section>

          <Section id="data" title="Data protection">
            <BulletList items={[
              'All database connections use TLS. Data in transit between our servers and the database is encrypted.',
              'API keys you provide (when using BYOK) are encrypted before storage.',
              'Every database query includes a tenant filter. There is no code path that returns data across organisations.',
              'Vector search queries (used for RAG knowledge bases) are filtered per bot. One bot\'s documents cannot appear in another bot\'s results.',
              'Lead ownership is verified before any update. A client can only modify leads belonging to their own bot.',
            ]} />
          </Section>

          <Section id="api" title="API security">
            <BulletList items={[
              'Rate limiting on all public embed endpoints. Each endpoint has independent limits.',
              'Input validation on every API route. Invalid input is rejected with a specific error code. No exceptions.',
              'Auth endpoints use a strict origin allowlist. Embed endpoints are configured to support the widget.',
              'Error responses return generic messages. Stack traces and internal errors never reach the client.',
              'Organisations can be suspended by the platform owner. Suspended orgs are blocked from all chat requests.',
            ]} />
          </Section>

          <Section id="webhooks" title="Webhook integrity">
            <p>If you use outbound webhooks (e.g., to Slack or custom endpoints), every delivery is signed.</p>
            <BulletList items={[
              'Outbound webhooks are signed with a shared secret. Your endpoint can verify the signature to confirm the payload is authentic.',
              'If no signing secret is configured, delivery is skipped entirely. No unsigned webhooks go out.',
              'Payment provider callbacks are verified with cryptographic signatures. Invalid signatures are rejected.',
            ]} />
          </Section>

          <Section id="infra" title="Infrastructure">
            <BulletList items={[
              'Production containers run with minimal privileges. No unnecessary services or tools are included.',
              'Server access is restricted. Brute-force protection is enabled.',
              'Only necessary network ports are open. All other traffic is blocked.',
              'Automatic security patches are applied to the operating system.',
              'Database and cache services are hosted externally and never directly exposed.',
            ]} />
          </Section>

          <Section id="audit" title="Audit logging">
            <p>Every significant action is logged with the actor, target, and timestamp.</p>
            <BulletList items={[
              'Actions tracked include: bot lifecycle events, document operations, client invitations, billing changes, and more.',
              'Logs are tenant-scoped. An organisation can only see its own audit trail.',
              'Audit writes are non-blocking. If logging fails, the primary action still succeeds.',
              'The audit log viewer is available on the dashboard for compliance review.',
            ]} />
          </Section>

          <Section id="faq" title="FAQ">
            <FAQItem
              q="Can Octively read my page's DOM or cookies?"
              a="No. The widget communicates with our API over HTTPS. It sends the conversation messages you configure and receives AI responses. It does not access your page's DOM, localStorage, cookies, or session tokens. The iframe sandbox (coming soon) will make this architecturally impossible."
            />
            <FAQItem
              q="Is the embed script a security risk?"
              a="Any third-party script carries some risk. We mitigate this with origin locking (the widget only works on your configured domain), embed key rotation, rate limiting, and CORS restrictions. For enterprise clients who need zero third-party scripts, we offer self-hosted widget options."
            />
            <FAQItem
              q="What about GDPR?"
              a="Octively is GDPR-ready. We provide a Data Processing Agreement (DPA) on request for Enterprise plans. We do not sell or share conversation data. Data is processed under zero-data-retention agreements with our AI providers. You can request data deletion at any time."
            />
            <FAQItem
              q="Do you train AI models on my clients' data?"
              a="No. Conversation data is sent to the AI provider you configure for inference only. We route through providers under zero-data-retention agreements. Your data is not used for training."
            />
            <FAQItem
              q="Can I bring my own API keys?"
              a="Yes. BYOK (Bring Your Own Key) lets you use your own AI provider keys. They are encrypted before storage and never exposed to other organisations."
            />
          </Section>

          <Reveal>
            <div style={{ marginTop: 48, padding: '32px 28px', background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 14, textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 12, color: 'var(--ink)' }}>Questions about our security practices?</p>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 20 }}>
                We are happy to answer specific questions or provide additional documentation for your compliance team.
              </p>
              <Link
                href="/contact"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, background: 'var(--of-primary)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'opacity .15s' }}
              >
                Contact us <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
