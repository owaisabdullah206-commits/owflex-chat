'use client'

import { useState } from 'react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'

const SECTIONS = [
  { id: 'collected', label: 'Data We Collect' },
  { id: 'use', label: 'How We Use It' },
  { id: 'third-parties', label: 'Third-Party Services' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'retention', label: 'Data Retention' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'contact', label: 'Contact' },
]

export default function PrivacyPage() {
  const [dark, setDark] = useState(false)
  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 80px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 64, alignItems: 'start' }}>
        {/* Sidebar */}
        <nav style={{ position: 'sticky', top: 88 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 12 }}>On this page</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} style={{ fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none' }}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div style={{ maxWidth: 680 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 8 }}>Legal</p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 48, fontFamily: 'var(--font-mono)' }}>Last updated: 22 May 2026</p>

          <Section id="collected" title="Data We Collect">
            <p>When you sign up or use Octively we collect:</p>
            <ul>
              <li><strong>Account data</strong> — name, email address, and (optionally) a profile picture via Google OAuth.</li>
              <li><strong>Organisation data</strong> — workspace name, plan tier, billing currency preference.</li>
              <li><strong>Bot and conversation data</strong> — embed keys, bot configuration, conversation transcripts, and lead captures sent through the embedded widget.</li>
              <li><strong>Usage and billing data</strong> — credit usage, payment reference numbers (we do not store full card details).</li>
              <li><strong>Log data</strong> — IP addresses, browser type, pages visited, and timestamps for security and debugging purposes.</li>
            </ul>
          </Section>

          <Section id="use" title="How We Use It">
            <p>We use your data to:</p>
            <ul>
              <li>Provide and improve the Octively platform.</li>
              <li>Send transactional emails (account verification, billing receipts, invitation emails to your clients).</li>
              <li>Send optional product update digests — you can unsubscribe at any time.</li>
              <li>Detect and prevent fraud or abuse.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do <strong>not</strong> sell your data or your clients&apos; data to third parties.</p>
          </Section>

          <Section id="third-parties" title="Third-Party Services">
            <p>Octively uses the following sub-processors:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600 }}>Service</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600 }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Neon PostgreSQL', 'Primary database (all structured data)'],
                  ['Upstash Redis', 'Session cache and credit counters'],
                  ['Resend', 'Transactional email delivery'],
                  ['LiteLLM / DeepSeek', 'AI inference — conversation data is sent to the LLM provider you configure'],
                  ['Cloudflare R2', 'Document storage for RAG knowledge bases'],
                  ['PayFast', 'PKR payment processing'],
                  ['Lemon Squeezy', 'USD payment processing'],
                  ['Vercel', 'Hosting and edge functions'],
                ].map(([svc, purpose]) => (
                  <tr key={svc} style={{ borderBottom: '1px solid var(--hairline)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{svc}</td>
                    <td style={{ padding: '10px 0', color: 'var(--ink-muted)' }}>{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="cookies" title="Cookies">
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Authentication sessions</strong> — a signed HTTP-only cookie keeps you logged in for up to 7 days.</li>
              <li><strong>Preferences</strong> — light/dark mode preference stored in <code>localStorage</code> (not sent to our servers).</li>
            </ul>
            <p>We do not use tracking or advertising cookies.</p>
          </Section>

          <Section id="retention" title="Data Retention">
            <p>We retain your data for as long as your account is active. If you close your account:</p>
            <ul>
              <li>Conversation transcripts and lead data are deleted within 30 days.</li>
              <li>Billing records are retained for 7 years to comply with financial regulations.</li>
              <li>Anonymised aggregate usage statistics may be retained indefinitely.</li>
            </ul>
          </Section>

          <Section id="rights" title="Your Rights">
            <p>Depending on your jurisdiction you have the right to access, correct, or delete your personal data. To exercise any of these rights, contact us at <a href="mailto:privacy@octively.com" style={{ color: 'var(--of-primary)' }}>privacy@octively.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section id="contact" title="Contact">
            <p>Questions about this policy? Reach out:</p>
            <p><strong>Email:</strong> <a href="mailto:privacy@octively.com" style={{ color: 'var(--of-primary)' }}>privacy@octively.com</a></p>
            <p><strong>Address:</strong> Octively, Karachi, Pakistan</p>
          </Section>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 52, scrollMarginTop: 88 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--hairline)' }}>{title}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-muted)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </section>
  )
}
