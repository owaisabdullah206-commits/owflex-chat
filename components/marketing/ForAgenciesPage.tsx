'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Palette, Globe, BarChart3, Users } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'

const FEATURES = [
  {
    Icon: Palette,
    title: 'White-label branding',
    body: 'Your logo. Your colours. Your domain (coming soon). Clients see your agency brand, never ours.',
  },
  {
    Icon: Users,
    title: 'Unlimited clients',
    body: 'The Agency plan puts no cap on how many client portals you create. Onboard one client or fifty.',
  },
  {
    Icon: Globe,
    title: 'Per-bot AI model',
    body: 'Use a cheap fast model for simple FAQ bots and a premium model for high-stakes clients. Billed by usage, not per seat.',
  },
  {
    Icon: BarChart3,
    title: 'Credit visibility',
    body: 'See exactly how many credits each bot is consuming. Know your margins before the invoice arrives.',
  },
]

const AGENCY_PLAN = [
  'Unlimited bots',
  'Unlimited client portals',
  '50M credits / month',
  'White-label branding — remove all Octively references',
  'Custom logo & colours per client',
  'Priority support',
  'Monthly or annual billing (PKR + USD)',
]

export default function ForAgenciesPage() {
  const [dark, setDark] = useState(false)

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={() => setDark((d) => !d)} />

      {/* Hero */}
      <section style={{ paddingBlock: '80px 72px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: 680 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 18 }}>For agencies</p>
            <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.07, marginBottom: 20 }}>
              Your clients.<br />Your brand.<br />Their chatbot.
            </h1>
            <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.65, maxWidth: 540, marginBottom: 36 }}>
              Build chatbots for 10 clients. Each one gets a portal that looks like it was built by you — because it was.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                href="/dashboard/signup"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 46, padding: '0 24px',
                  background: 'var(--of-primary)', color: 'white',
                  fontSize: 15, fontWeight: 500, borderRadius: 8, textDecoration: 'none',
                }}
              >
                Start managing clients <ArrowRight size={15} />
              </Link>
              <Link
                href="/pricing"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 46, padding: '0 20px',
                  border: '1px solid var(--hairline)', background: 'transparent',
                  color: 'var(--ink)', fontSize: 15, borderRadius: 8, textDecoration: 'none',
                }}
              >
                See Agency pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ paddingBlock: 72, background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 16 }}>The problem</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 18, lineHeight: 1.2 }}>
            You built a great chatbot. Now each client wants their own window into it.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
            Spreadsheets. Forwarded emails. Weekly &ldquo;what did the bot say?&rdquo; calls. You&apos;re doing tech support for conversations that should be self-serve. Every extra client multiplies the noise.
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 48, textAlign: 'center' }}>Everything an agency needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {FEATURES.map(({ Icon, title, body }) => (
              <div key={title} style={{ padding: '28px 24px', border: '1px solid var(--hairline)', background: 'var(--surface)' }}>
                <div style={{ width: 38, height: 38, background: 'var(--of-primary-soft)', display: 'grid', placeItems: 'center', marginBottom: 16, color: 'var(--of-primary)' }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ paddingBlock: 64, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <blockquote style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.55, color: 'var(--ink)', marginBottom: 24 }}>
            &ldquo;Tenant isolation is what got our retainer client to actually sign. They wouldn&apos;t touch a shared SaaS — now they review their own portal and never email me about it.&rdquo;
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--of-primary)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>FZ</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Fatima Z.</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>Co-founder · Stackbot</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agency plan card */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32, textAlign: 'center' }}>Agency plan</h2>
          <div style={{ border: '2px solid var(--of-primary)', padding: '32px 28px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>₨9,999</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-muted)' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AGENCY_PLAN.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}>
                  <Check size={14} style={{ color: 'var(--of-primary)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: 'var(--ink-muted)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/signup"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 44, width: '100%',
                background: 'var(--of-primary)', color: 'white',
                fontSize: 15, fontWeight: 500, borderRadius: 8, textDecoration: 'none',
              }}
            >
              Start Agency trial <ArrowRight size={15} />
            </Link>
            <p style={{ fontSize: 12, color: 'var(--ink-subtle)', textAlign: 'center', marginTop: 12 }}>14-day free trial · No card required</p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
