'use client'

import Link from 'next/link'
import { ArrowRight, Check, Palette, Globe, BarChart3, Users, Zap } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import { OctivelyButton } from '@/components/brand/OctivelyButton'

const FEATURES = [
  {
    Icon: Palette,
    title: 'White-label branding',
    body: 'Your logo. Your colours. Your domain (coming soon). Clients see your agency brand — never ours.',
  },
  {
    Icon: Users,
    title: 'Unlimited clients',
    body: 'The Agency plan puts no cap on how many client portals you create. Onboard one client or fifty.',
  },
  {
    Icon: Globe,
    title: 'Per-bot AI model',
    body: 'Cheap fast model for FAQ bots. Premium model for high-stakes clients. Billed by usage, not per seat.',
  },
  {
    Icon: BarChart3,
    title: 'Credit visibility',
    body: 'See exactly how many credits each bot consumes. Know your margins before the invoice arrives.',
  },
]

const AGENCY_PLAN = [
  'Unlimited bots',
  'Unlimited client portals',
  '50M credits / month',
  'White-label — remove all Octively references',
  'Custom logo & colours per client',
  'Priority support',
  'Monthly or annual billing (PKR + USD)',
]

const CLIENTS = [
  { name: 'Karachi Kurta Co.', initial: 'KK', bots: 2, status: 'Active', leads: 34, color: '#0EA5E9' },
  { name: 'Dawn Studio', initial: 'DS', bots: 1, status: 'Active', leads: 12, color: '#10B981' },
  { name: 'Pak Travels', initial: 'PT', bots: 3, status: 'Active', leads: 67, color: '#F59E0B' },
  { name: 'Lahore Auto Parts', initial: 'LA', bots: 1, status: 'Setup', leads: 0, color: '#6366F1' },
]

function AgencyDashboard() {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      border: '1px solid var(--hairline)',
      overflow: 'hidden',
      boxShadow: '0 24px 60px -12px rgba(12,10,9,.14), 0 8px 24px -8px rgba(12,10,9,.08)',
    }}>
      {/* Browser chrome */}
      <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 12px', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)' }}>
            admin.octively.com/clients
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Agency header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--of-primary)', display: 'grid', placeItems: 'center' }}>
            <Zap size={14} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: 'var(--ink)' }}>StackBot Agency</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', margin: 0 }}>Agency plan · 4 clients</p>
          </div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--of-primary)', background: 'var(--of-primary-soft)', border: '1px solid rgba(14,165,233,.2)', borderRadius: 999, padding: '2px 8px' }}>+ Invite client</span>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--hairline)' }}>
        {[
          { value: '4', label: 'Clients' },
          { value: '7', label: 'Active bots' },
          { value: '113', label: 'Leads / mo' },
        ].map(({ value, label }, i) => (
          <div key={label} style={{ textAlign: 'center', padding: '12px 8px', borderRight: i < 2 ? '1px solid var(--hairline)' : 'none' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{value}</p>
            <p style={{ fontSize: 10.5, color: 'var(--ink-muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Client list */}
      <div>
        <div style={{ padding: '8px 18px 4px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-subtle)' }}>Client</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-subtle)' }}>Leads</span>
        </div>
        {CLIENTS.map((client, i) => (
          <div
            key={client.name}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 18px',
              borderTop: '1px solid var(--hairline)',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: client.color + '20', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: client.color }}>{client.initial}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', margin: 0 }}>{client.bots} bot{client.bots > 1 ? 's' : ''}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: client.status === 'Active' ? 'var(--of-success)' : 'var(--ink-subtle)', margin: 0 }}>
                {client.status === 'Active' ? '● ' : '○ '}{client.status}
              </p>
              {client.leads > 0 && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--of-primary)', margin: 0 }}>{client.leads} leads</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ForAgenciesPage() {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      {/* Hero */}
      <section style={{ paddingBlock: '72px 64px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="mkt-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 540px)', gap: 40, alignItems: 'center' }}>
            {/* Left — copy */}
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 18 }}>For agencies</p>
              <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 54px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.07, marginBottom: 20 }}>
                Your clients.<br />Your brand.<br />Their chatbot.
              </h1>
              <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.65, maxWidth: 520, marginBottom: 36 }}>
                Build chatbots for 10 clients. Each one gets a portal that looks like it was built by you. Because it was.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <OctivelyButton href="/dashboard/signup" size="lg">
                  Start managing clients
                </OctivelyButton>
                <Link
                  href="/pricing"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 46, padding: '0 20px',
                    border: '1px solid var(--hairline)', borderRadius: 10,
                    color: 'var(--ink)', fontSize: 15, textDecoration: 'none',
                  }}
                >
                  See Agency pricing
                </Link>
              </div>
              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
                {['Unlimited clients', 'White-label ready', '14-day free trial'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-muted)' }}>
                    <Check size={13} style={{ color: 'var(--of-primary)', flexShrink: 0 }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            {/* Right — visual */}
            <div className="mkt-hero-mockup">
              <AgencyDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ paddingBlock: 72, background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 16 }}>The problem</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 18, lineHeight: 1.2 }}>
            You built a great chatbot.<br />Now each client wants their own window into it.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
            Spreadsheets. Forwarded emails. Weekly &ldquo;what did the bot say?&rdquo; calls. You&apos;re doing tech support for work that should run itself. Every new client makes it louder.
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>Built for agencies running bots at scale</h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', textAlign: 'center', marginBottom: 48 }}>One platform. Every client. Zero custom builds.</p>
          <div className="mkt-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {FEATURES.map(({ Icon, title, body }) => (
              <div key={title} style={{ padding: '28px 24px', border: '1px solid var(--hairline)', borderRadius: 14, background: 'var(--surface)' }}>
                <div style={{ width: 42, height: 42, background: 'var(--of-primary-soft)', borderRadius: 10, display: 'grid', placeItems: 'center', marginBottom: 18, color: 'var(--of-primary)' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ paddingBlock: 64, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, color: 'var(--of-primary)', lineHeight: 1, marginBottom: 8, opacity: 0.3, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
          <blockquote style={{ fontSize: 19, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--ink)', marginBottom: 28, marginTop: 0 }}>
            Tenant isolation is what got our retainer client to sign. They wouldn&apos;t touch a shared SaaS — now they review their own portal and never email me about it.
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--of-primary)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>FZ</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Fatima Z.</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>Co-founder · Stackbot Agency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agency plan card */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>Agency plan</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', textAlign: 'center', marginBottom: 32 }}>One plan. Unlimited clients. No per-seat nonsense.</p>
          <div style={{ border: '2px solid var(--of-primary)', borderRadius: 16, padding: '32px 28px', background: 'var(--surface)', boxShadow: '0 4px 24px rgba(14,165,233,.12)' }}>
            <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 999, background: 'var(--of-primary-soft)', border: '1px solid rgba(14,165,233,.25)', marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--of-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Most popular</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>₨20,000</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-muted)' }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 24 }}>Or $79/month in USD.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AGENCY_PLAN.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}>
                  <Check size={14} style={{ color: 'var(--of-primary)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: 'var(--ink-muted)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex' }}>
              <OctivelyButton href="/dashboard/signup" size="lg" className="flex-1 justify-center">
                Start 14-day free trial
              </OctivelyButton>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-subtle)', textAlign: 'center', marginTop: 12 }}>No card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
