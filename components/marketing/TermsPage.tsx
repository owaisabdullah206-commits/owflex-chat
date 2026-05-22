'use client'

import { useState } from 'react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'

const SECTIONS = [
  { id: 'definitions', label: 'Definitions' },
  { id: 'acceptable-use', label: 'Acceptable Use' },
  { id: 'billing', label: 'Payment & Billing' },
  { id: 'limits', label: 'Plan Limits' },
  { id: 'cancellation', label: 'Cancellation' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'law', label: 'Governing Law' },
  { id: 'contact', label: 'Contact' },
]

export default function TermsPage() {
  const [dark, setDark] = useState(false)
  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <div className="mkt-legal-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 80px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 64, alignItems: 'start' }}>
        {/* Sidebar */}
        <nav className="mkt-legal-sidebar" style={{ position: 'sticky', top: 88 }}>
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
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 48, fontFamily: 'var(--font-mono)' }}>Last updated: 22 May 2026</p>

          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-muted)', marginBottom: 40 }}>
            By creating an account or using Octively (&ldquo;the Service&rdquo;) you agree to these Terms. If you do not agree, do not use the Service.
          </p>

          <TSection id="definitions" title="Definitions">
            <p><strong>&ldquo;Service&rdquo;</strong> means the Octively platform, including the developer dashboard, client portal, embed widget, and all related APIs.</p>
            <p><strong>&ldquo;Developer&rdquo;</strong> means a user who creates an Octively workspace and builds or manages bots for their clients.</p>
            <p><strong>&ldquo;Client&rdquo;</strong> means a user invited by a Developer to access a client portal.</p>
            <p><strong>&ldquo;Credits&rdquo;</strong> means the consumable AI inference units used to power bot responses.</p>
          </TSection>

          <TSection id="acceptable-use" title="Acceptable Use">
            <p>You may not use the Service to:</p>
            <ul>
              <li>Transmit spam, phishing content, or malware.</li>
              <li>Violate any applicable law or regulation.</li>
              <li>Attempt to reverse-engineer, scrape, or overload the platform.</li>
              <li>Impersonate another person or organisation.</li>
              <li>Use the Service for any illegal or fraudulent purpose.</li>
            </ul>
            <p>We reserve the right to suspend accounts that violate these rules without prior notice.</p>
          </TSection>

          <TSection id="billing" title="Payment & Billing">
            <p>Paid plans are billed monthly or annually in advance. PKR payments are processed via PayFast; USD payments via Lemon Squeezy. Prices are displayed inclusive of applicable taxes where required by law.</p>
            <p>Credit packs are non-refundable once consumed. Unused credits from a monthly plan allowance do not roll over.</p>
            <p>We may change pricing with 30 days&apos; notice. If you do not agree to a price change, you may cancel before the new price takes effect.</p>
          </TSection>

          <TSection id="limits" title="Plan Limits">
            <p>Each plan has limits on bots, conversations per month, leads, and credits. If you exceed your plan limits, additional usage is blocked until the next billing cycle or until you purchase a credit pack. We will notify you when you reach 80% of your monthly limits.</p>
          </TSection>

          <TSection id="cancellation" title="Cancellation">
            <p>You may cancel your subscription at any time from the Billing page. Your access continues until the end of the current billing period. We do not offer pro-rated refunds for partial months.</p>
            <p>To permanently delete your account and all associated data, contact <a href="mailto:support@octively.com" style={{ color: 'var(--of-primary)' }}>support@octively.com</a>.</p>
          </TSection>

          <TSection id="liability" title="Limitation of Liability">
            <p>The Service is provided &ldquo;as is&rdquo; without warranty of any kind. To the maximum extent permitted by law, Octively shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill.</p>
            <p>Our total liability to you for any claim arising from use of the Service shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
          </TSection>

          <TSection id="law" title="Governing Law">
            <p>These Terms are governed by the laws of Pakistan. Any dispute shall be resolved in the courts of Karachi, Pakistan, unless otherwise required by applicable consumer protection law in your jurisdiction.</p>
          </TSection>

          <TSection id="contact" title="Contact">
            <p>Questions about these Terms? Contact us:</p>
            <p><strong>Email:</strong> <a href="mailto:legal@octively.com" style={{ color: 'var(--of-primary)' }}>legal@octively.com</a></p>
            <p><strong>Address:</strong> Octively, Karachi, Pakistan</p>
          </TSection>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}

function TSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 52, scrollMarginTop: 88 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--hairline)' }}>{title}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-muted)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </section>
  )
}
