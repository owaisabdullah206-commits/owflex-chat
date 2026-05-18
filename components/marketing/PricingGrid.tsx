'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Check, Minus, ArrowRight, ArrowUpRight,
  Sparkles, Shield, ChevronDown, Sun, Moon,
} from 'lucide-react'
import MarketingFooter from './MarketingFooter'

// ─── Reveal helper ────────────────────────────────────────────────────────────

function Reveal({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.unobserve(el) } },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type Currency = 'PKR' | 'USD'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Kick the tires',
    pkr: 0, usd: 0,
    bots: '1 bot',
    convos: '200 conversations/mo',
    cta: 'Start free',
    href: '/dashboard/signup',
    features: [
      '1 bot · 200 conversations / month',
      '15 leads / month',
      '5 FAQs per bot',
      '7-day conversation history',
      'Color-only widget customization',
      'Forced "Powered by OwFlex" badge',
      'Community support',
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Your first paid client',
    pkr: 2500, usd: 15,
    fullPkr: 3500, fullUsd: 19,
    bots: '2 bots',
    convos: '3,000 conversations/mo',
    cta: 'Start 14-day trial',
    href: '/dashboard/signup',
    features: [
      '2 bots · 3,000 conversations / month',
      'Unlimited leads + CSV export',
      '25 MB document storage',
      '30-day conversation history',
      '20 FAQs per bot',
      'Full widget customization',
      'Hide "Powered by OwFlex" badge',
      'Budget-tier models from every major provider',
      'Lead capture + strict mode controls',
      'Email support',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For developers serving multiple clients',
    pkr: 7500, usd: 29,
    fullPkr: 9000, fullUsd: 39,
    bots: '8 bots',
    convos: '15,000 conversations/mo',
    cta: 'Start 14-day trial',
    href: '/dashboard/signup',
    featured: true,
    features: [
      '8 bots · 15,000 conversations / month',
      'Unlimited history & leads',
      '100 MB document storage',
      '50 FAQs per bot',
      'Mid-tier flagships from OpenAI, Anthropic, Google, DeepSeek',
      'Smart auto-routing — save 60–80% on LLM costs',
      'PDF document upload + auto-chunking',
      'Website scraping (Firecrawl)',
      'Unanswered questions detection + weekly digest',
      'Human handoff & escalation alerts',
      'Advanced analytics + flagged conversations',
      'Priority email support',
    ],
  },
  {
    key: 'agency',
    name: 'Agency',
    tagline: 'For agencies running 10+ client bots',
    pkr: 20000, usd: 79,
    fullPkr: 22000, fullUsd: 99,
    bots: 'Unlimited bots',
    convos: '75,000 conversations/mo',
    cta: 'Start Agency trial',
    href: '/dashboard/signup',
    features: [
      'Unlimited bots · 75,000 conversations / mo',
      '500 MB document storage',
      'Full white-label — strip every OwFlex pixel',
      'Custom branding text + URL on widget',
      'Custom client-portal subdomains (chat.youragency.com)',
      'Sub-tenant client management',
      'Per-bot resource allocation',
      'All model tiers — including top-tier flagship',
      'Best credit top-up rate (40% off)',
      'API access + webhook integrations',
      'Dedicated onboarding + Slack support',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Sovereign · BYO-key · regulated',
    pkr: 'custom' as const, usd: 'custom' as const,
    bots: 'Unlimited',
    convos: 'Custom volume',
    cta: 'Talk to sales',
    href: '#',
    features: [
      'Everything in Agency',
      'BYOK — bring your own LLM API keys',
      'Audit log viewer + 1-year retention',
      'SOC 2 / DPA on request',
      'Optional self-hosted / on-prem deployment',
      'Custom data residency (PK, EU, US)',
      '99.9% SLA + named support engineer',
    ],
  },
] as const

type Plan = (typeof PLANS)[number]

function fmtPrice(pkr: number | 'custom', usd: number | 'custom', currency: Currency) {
  if (pkr === 0) return { display: currency === 'PKR' ? '₨0' : '$0', suffix: '' }
  if (pkr === 'custom') return { display: 'Custom', suffix: '' }
  if (currency === 'PKR') return { display: `₨${(pkr as number).toLocaleString()}`, suffix: '/mo' }
  return { display: `$${usd}`, suffix: '/mo' }
}

// ─── Comparison table data ────────────────────────────────────────────────────

const COMPARE_ROWS = [
  { section: 'Core' },
  { feat: 'Bots', values: ['1', '2', '8', 'Unlimited', 'Unlimited'] },
  { feat: 'Conversations / month', values: ['200', '3,000', '15,000', '75,000', 'Custom'] },
  { feat: 'Credits included / month', values: ['2M', '30M', '150M', '750M', 'Custom'] },
  { feat: 'Leads / month', values: ['15', '∞', '∞', '∞', '∞'] },
  { feat: 'FAQs per bot', values: ['5', '20', '50', '∞', '∞'] },
  { feat: 'Document storage', values: ['—', '25 MB', '100 MB', '500 MB', 'Custom'] },
  { feat: 'Conversation history', values: ['7 days', '30 days', 'Unlimited', 'Unlimited', 'Unlimited'] },

  { section: 'Widget & branding' },
  { feat: 'Full widget customization', values: ['Color only', true, true, true, true] },
  { feat: 'Hide "Powered by OwFlex"', values: [false, true, true, true, true] },
  { feat: 'Custom branding text + URL', values: [false, false, false, true, true] },
  { feat: 'White-label client portal', values: [false, false, false, true, true] },
  { feat: 'Custom portal subdomain', values: [false, false, false, true, true] },

  { section: 'AI & intelligence' },
  { feat: 'Model tier', values: ['Flash (hidden)', 'Budget', 'Mid-range', 'All tiers', 'All tiers'] },
  { feat: 'Smart auto-routing', values: [false, false, true, true, true] },
  { feat: 'Unanswered questions list', values: [false, false, true, true, true] },
  { feat: 'Document upload (PDF)', values: [false, false, true, true, true] },
  { feat: 'Website scraping', values: [false, false, true, true, true] },

  { section: 'Operations' },
  { feat: 'Lead capture on/off', values: [false, true, true, true, true] },
  { feat: 'Strict mode', values: [false, true, true, true, true] },
  { feat: 'Human handoff / escalation', values: [false, false, true, true, true] },
  { feat: 'Weekly email digest', values: [false, false, true, true, true] },
  { feat: 'Sub-tenant management', values: [false, false, false, true, true] },
  { feat: 'Audit log viewer', values: [false, false, false, false, true] },
  { feat: 'API access + webhooks', values: [false, false, false, true, true] },
  { feat: 'BYOK — bring your own LLM key', values: [false, false, false, false, true] },

  { section: 'Support' },
  { feat: 'Support level', values: ['Community', 'Email', 'Priority email', 'Dedicated', 'Dedicated + SLA'] },
] as const

// ─── Credit packs ─────────────────────────────────────────────────────────────

const CREDIT_PACKS = [
  { name: 'Starter Pack', pkr: 1000, usd: 4, value: 4, bonus: null, best: false },
  { name: 'Standard Pack', pkr: 2500, usd: 9, value: 10, bonus: '+11%', best: false },
  { name: 'Power Pack', pkr: 5000, usd: 18, value: 22, bonus: '+22%', best: false },
  { name: 'Agency Pack', pkr: 10000, usd: 36, value: 50, bonus: '+39%', best: true },
]

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'What counts as a "conversation"?', a: 'A unique session — one visitor\'s chat with your bot, no matter how many messages. Sessions reset after 30 minutes of inactivity. Easy to forecast.' },
  { q: 'What happens if I run out of credits mid-month?', a: 'Your bots fall back to your plan\'s included default model silently — your end users never see an error. You get an email and a dashboard banner: top up to restore premium models.' },
  { q: 'Can I switch between PKR and USD billing?', a: 'Yes — PKR is processed via PayFast (Pakistani cards / bank transfer / EasyPaisa). USD via Lemon Squeezy (cards / PayPal). You pick at checkout, switch by contacting support.' },
  { q: 'Is my clients\' conversation data used to train AI models?', a: 'No. We route through providers under zero-data-retention agreements (DeepSeek, OpenRouter, Groq). Messages are processed in transit only and discarded after the response.' },
  { q: 'Do you charge per seat?', a: 'No. Every plan is org-based, unlimited seats. Charge your clients however you want — OwFlex doesn\'t meter users.' },
  { q: 'Can my client self-serve and bypass me?', a: 'No. SMB clients only get portal access (app.owflex.com). Bot creation, billing, and model settings stay with the developer/agency — by design.' },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────

const QUOTES_ROW_1 = [
  { q: 'Used to spend a full day writing weekly chatbot reports for clients. Now they log in and see live numbers — and I bill them ₨15k/mo for the dashboard. OwFlex paid for itself in week one.', name: 'Owais A.', role: 'Solo dev · Karachi', initials: 'OA' },
  { q: 'We were paying $497/mo for Stammer.ai and getting buried in feature bloat. Switched 7 client bots to OwFlex Agency. Cleaner portal, white-labelled, 80% less spend.', name: 'Hira K.', role: 'Agency owner · Lahore', initials: 'HK' },
  { q: 'The credit system is the killer feature. I let small clients use the included models, and upsell premium clients onto flagship tiers without lifting a finger.', name: 'Bilal Q.', role: 'Founder · TalkBox.pk', initials: 'BQ' },
  { q: 'I onboarded a tea-export client in 12 minutes. They were sending Urdu queries to the bot and getting Urdu replies. Their finance team now exports leads to CSV themselves.', name: 'Maryam S.', role: 'Freelancer · Islamabad', initials: 'MS' },
]
const QUOTES_ROW_2 = [
  { q: 'The white-label is real white-label. My client sees chat.boltagency.com, my logo on the widget, my email on receipts. Not a single OwFlex pixel anywhere.', name: 'Daniyal R.', role: 'Bolt Agency · Lahore', initials: 'DR' },
  { q: 'Switched four clients off Botpress in a weekend. Embed key swap, that\'s the whole migration. Conversation history came along via the import endpoint.', name: 'Saad M.', role: 'Indie dev · Faisalabad', initials: 'SM' },
  { q: 'Tenant isolation is what got our retainer client to actually sign. They wouldn\'t touch a shared SaaS — now they review their own portal and never email me about it.', name: 'Fatima Z.', role: 'Co-founder · Stackbot', initials: 'FZ' },
  { q: 'I bill in PKR via PayFast, my UK client pays USD via Lemon Squeezy, both land in the same dashboard. No more two-spreadsheet accounting.', name: 'Aamir T.', role: 'Agency · Karachi → London', initials: 'AT' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Nav({ currency, setCurrency, dark, onToggleDark }: { currency: Currency; setCurrency: (c: Currency) => void; dark: boolean; onToggleDark: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
        background: scrolled ? 'color-mix(in srgb, var(--bg) 82%, transparent)' : 'var(--bg)',
        backdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--hairline)' : '1px solid transparent',
        transition: 'background-color .2s, border-color .2s',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
            color: 'var(--ink)',
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--of-primary)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 16 }}>owflex</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', padding: '2px 6px', border: '1px solid var(--hairline)', borderRadius: 4 }}>BETA</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Currency toggle */}
          <div
            role="tablist"
            style={{
              display: 'inline-flex',
              padding: 3,
              gap: 2,
              background: 'var(--surface-2)',
              border: '1px solid var(--hairline)',
              borderRadius: 999,
            }}
          >
            {(['PKR', 'USD'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setCurrency(k)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: 0,
                  background: currency === k ? 'var(--surface)' : 'transparent',
                  color: currency === k ? 'var(--ink)' : 'var(--ink-subtle)',
                  fontSize: 12,
                  fontWeight: currency === k ? 500 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all .15s',
                }}
              >
                {k === 'PKR' ? '₨ PKR' : '$ USD'}
              </button>
            ))}
          </div>
          <button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            style={{
              width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--hairline)', borderRadius: 8, background: 'transparent',
              color: 'var(--ink-subtle)', cursor: 'pointer', flexShrink: 0,
            }}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link href="/dashboard/signin" style={{ height: 36, padding: '0 12px', display: 'inline-flex', alignItems: 'center', fontSize: 14, color: 'var(--ink-subtle)', border: '1px solid var(--hairline)', borderRadius: 8, textDecoration: 'none' }}>
            Sign in
          </Link>
          <Link href="/dashboard/signup" style={{ height: 36, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'white', background: 'var(--of-primary)', borderRadius: 8, textDecoration: 'none', border: '1px solid transparent' }}>
            Start free <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

function PriceDisplay({ plan, dark, currency }: { plan: Plan; dark?: boolean; currency: Currency }) {
  const { display, suffix } = fmtPrice(plan.pkr, plan.usd, currency)
  const fullPkr = 'fullPkr' in plan ? plan.fullPkr : undefined
  const fullUsd = 'fullUsd' in plan ? plan.fullUsd : undefined
  const full = currency === 'PKR' ? fullPkr : fullUsd
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{display}</span>
        {suffix && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: dark ? 'var(--dark-ink-muted)' : 'var(--ink-muted)' }}>{suffix}</span>}
      </div>
      {full && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dark ? 'var(--dark-ink-muted)' : 'var(--ink-muted)', marginTop: 6 }}>
          <span style={{ textDecoration: 'line-through' }}>
            {currency === 'PKR' ? `₨${(fullPkr as number).toLocaleString()}` : `$${fullUsd}`}
          </span>{' '}
          <span style={{ color: 'var(--of-success)' }}>launch price</span>
        </div>
      )}
    </div>
  )
}

function FeatureList({ items, dark, dense }: { items: readonly string[]; dark?: boolean; dense?: boolean }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: dense ? 7 : 9 }}>
      {items.map((f, i) => (
        <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.45 }}>
          <span style={{ marginTop: 2, color: dark ? 'var(--of-primary-text-dark, #38BDF8)' : 'var(--of-primary)', flexShrink: 0 }}>
            <Check size={14} />
          </span>
          <span style={{ color: dark ? 'var(--dark-ink)' : 'var(--ink)' }}>{f}</span>
        </li>
      ))}
    </ul>
  )
}

function CompareCell({ v }: { v: boolean | string }) {
  if (v === true) return <Check size={16} style={{ color: 'var(--of-success)' }} />
  if (v === false) return <span style={{ color: 'var(--ink-muted)', opacity: 0.45 }}><Minus size={16} /></span>
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>{v}</span>
}

// ─── Plan cards — Traditional layout ─────────────────────────────────────────

function PlanCardTraditional({ plan, currency }: { plan: Plan; currency: Currency }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14, padding: 22,
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 14, transition: 'border-color .2s',
    }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{plan.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{plan.tagline}</div>
      </div>
      <PriceDisplay plan={plan} currency={currency} />
      <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 12 }}>
        <FeatureList items={plan.features} dense />
      </div>
      <Link href={plan.href} style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--hairline)', textDecoration: 'none', transition: 'border-color .15s' }}>
        {plan.cta}
      </Link>
    </div>
  )
}

function PlanCardFeaturedSlim({ plan, currency }: { plan: Plan; currency: Currency }) {
  return (
    <div style={{
      background: 'var(--dark-bg)', color: 'var(--dark-ink)',
      borderRadius: 14, padding: 22,
      border: '1px solid var(--dark-hairline-strong)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex', flexDirection: 'column', gap: 14, position: 'relative',
    }}>
      <span style={{
        position: 'absolute', top: -10, right: 18,
        background: 'var(--of-primary)', color: 'white',
        borderRadius: 999, padding: '2px 10px',
        fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <Sparkles size={9} /> Most popular
      </span>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{plan.name}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-ink-muted)', marginTop: 2 }}>{plan.tagline}</div>
      </div>
      <PriceDisplay plan={plan} dark currency={currency} />
      <div style={{ borderTop: '1px solid var(--dark-hairline)', paddingTop: 12 }}>
        <FeatureList items={plan.features} dark dense />
      </div>
      <Link href={plan.href} style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'white', background: 'var(--of-primary)', textDecoration: 'none', border: '1px solid transparent' }}>
        {plan.cta} <ArrowRight size={14} />
      </Link>
    </div>
  )
}

// ─── Testimonials marquee ─────────────────────────────────────────────────────

function TestimonialCard({ q, dark }: { q: (typeof QUOTES_ROW_1)[0]; dark: boolean }) {
  return (
    <div style={{
      flexShrink: 0, width: 380,
      background: dark ? 'var(--dark-surface)' : 'var(--surface)',
      border: `1px solid ${dark ? 'var(--dark-hairline)' : 'var(--hairline)'}`,
      borderRadius: 14, padding: 22,
      display: 'flex', flexDirection: 'column', gap: 14,
      color: dark ? 'var(--dark-ink)' : 'var(--ink)',
    }}>
      <Sparkles size={14} style={{ color: 'var(--of-primary)', flexShrink: 0 }} />
      <div style={{ fontSize: 14, lineHeight: 1.55 }}>&ldquo;{q.q}&rdquo;</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 6, borderTop: `1px solid ${dark ? 'var(--dark-hairline)' : 'var(--hairline)'}` }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--of-primary)', display: 'grid', placeItems: 'center', color: 'white', fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>
          {q.initials}
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{q.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: dark ? 'var(--dark-ink-muted)' : 'var(--ink-muted)' }}>{q.role}</div>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction, speed, dark }: { items: typeof QUOTES_ROW_1; direction: 'L' | 'R'; speed: number; dark: boolean }) {
  const loop = [...items, ...items]
  return (
    <div style={{ width: '100%', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
      <div style={{ display: 'flex', gap: 14, width: 'max-content', animation: `marquee${direction} ${speed}s linear infinite` }}>
        {loop.map((q, i) => <TestimonialCard key={i} q={q} dark={dark} />)}
      </div>
    </div>
  )
}

function TestimonialsSection({ dark }: { dark: boolean }) {
  return (
    <section style={{ paddingBlock: 72, overflow: 'hidden', background: dark ? 'var(--dark-bg)' : 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 32 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500 }}>
          From the field
        </span>
        <h2 style={{ marginTop: 10, maxWidth: 760, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: dark ? 'var(--dark-ink)' : 'var(--ink)' }}>
          Built by an agency dev for agency devs.
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MarqueeRow items={QUOTES_ROW_1} direction="L" speed={64} dark={dark} />
        <MarqueeRow items={QUOTES_ROW_2} direction="R" speed={72} dark={dark} />
      </div>
    </section>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function PricingGrid() {
  const [currency, setCurrency] = useState<Currency>('PKR')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  const freePlan = PLANS[0]
  const starterPlan = PLANS[1]
  const proPlan = PLANS[2]
  const agencyPlan = PLANS[3]
  const enterprisePlan = PLANS[4]

  return (
    <div className={`marketing${darkMode ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <Nav currency={currency} setCurrency={setCurrency} dark={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />

      {/* Pricing Header */}
      <section style={{ paddingTop: 64, paddingBottom: 40, position: 'relative', overflow: 'hidden' }}>
        <div className="mkt-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(14,165,233,.3)', background: 'var(--of-primary-soft)', color: 'var(--of-primary-deep)', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-primary)' }} />
            Launch pricing — locked for founding members
          </span>
          <h1 style={{ maxWidth: 820, fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0 }}>
            Developer plans built for <span style={{ color: 'var(--of-primary)' }}>Pakistani agencies</span> and freelancers.
          </h1>
          <p style={{ textAlign: 'center', fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.65, maxWidth: '60ch', margin: 0 }}>
            Local pricing in PKR. Fair USD for the rest of the world. Every plan includes a monthly credit allowance — top up only when you outgrow it.
          </p>
          {/* Currency toggle */}
          <div role="tablist" style={{ display: 'inline-flex', padding: 4, gap: 2, background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 999 }}>
            {(['PKR', 'USD'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setCurrency(k)}
                style={{
                  padding: '8px 20px', borderRadius: 999, border: 0,
                  background: currency === k ? 'var(--surface)' : 'transparent',
                  color: currency === k ? 'var(--ink)' : 'var(--ink-subtle)',
                  fontSize: 13, fontWeight: currency === k ? 500 : 400,
                  cursor: 'pointer', transition: 'all .15s',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: currency === k ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {k === 'PKR' ? '₨ — Pakistan' : '$ — International'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional Plan Grid */}
      <section style={{ paddingBlock: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[freePlan, starterPlan, proPlan, agencyPlan].map((plan) => {
                const isFeat = 'featured' in plan && !!(plan as { featured?: boolean }).featured
                return isFeat
                  ? <PlanCardFeaturedSlim key={plan.key} plan={plan} currency={currency} />
                  : <PlanCardTraditional key={plan.key} plan={plan} currency={currency} />
              })}
            </div>
          </Reveal>
          {/* Enterprise banner */}
          <Reveal style={{ marginTop: 14 }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--hairline)',
              borderLeft: '3px solid var(--of-primary)',
              borderRadius: 14, padding: '22px 26px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={16} style={{ color: 'var(--of-primary)' }} /> {enterprisePlan.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-subtle)', marginTop: 4, maxWidth: 540 }}>
                  {enterprisePlan.tagline} — BYOK, audit logs, SLA, optional on-prem. Talk to us about data residency, model preferences, and integration needs.
                </div>
              </div>
              <Link href={enterprisePlan.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'white', background: 'var(--of-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Talk to sales <ArrowUpRight size={14} />
              </Link>
            </div>
          </Reveal>
          <Reveal style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>Annual: pay 10 months, get 12</span>
              <span style={{ color: 'var(--hairline-strong)' }}>·</span>
              <span>All prices exclude PK sales tax where applicable</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Credit Packs */}
      <section style={{ paddingBlock: 80, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
            <div style={{ maxWidth: 620 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500 }}>
                Credit top-ups
              </span>
              <h2 style={{ marginTop: 10, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Outgrew your plan's allowance? Top up. Credits never expire.
              </h2>
              <p style={{ marginTop: 12, fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                Top-tier flagship models from OpenAI, Anthropic, and Google consume credits. Default models stay included in your plan. Bigger packs come with bigger bonuses.
              </p>
            </div>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--of-primary)', textDecoration: 'none', fontWeight: 500 }}>
              See credit rates <ArrowUpRight size={14} />
            </a>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {CREDIT_PACKS.map((p, i) => {
              const { display } = fmtPrice(p.pkr, p.usd, currency)
              return (
                <Reveal key={i} delay={i * 70}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 10, padding: 20,
                    background: p.best ? 'color-mix(in srgb, var(--of-primary) 4%, var(--surface))' : 'var(--surface)',
                    border: `1px solid ${p.best ? 'rgba(14,165,233,.4)' : 'var(--hairline)'}`,
                    borderRadius: 14, position: 'relative',
                    transition: 'border-color .2s',
                  }}>
                    {p.best && (
                      <span style={{ position: 'absolute', top: -10, right: 14, background: 'var(--of-primary)', color: 'white', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        BEST VALUE
                      </span>
                    )}
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>{display}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-subtle)' }}>
                      ${p.value} in credits
                      {p.bonus && (
                        <span style={{ background: 'var(--of-success-soft)', color: 'var(--of-success)', borderRadius: 999, padding: '2px 6px', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                          {p.bonus} bonus
                        </span>
                      )}
                    </div>
                    <a href="#" style={{ marginTop: 6, display: 'flex', justifyContent: 'center', padding: '9px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--hairline)', textDecoration: 'none' }}>
                      Top up
                    </a>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="compare" style={{ paddingBlock: 80, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500 }}>
              Compare plans
            </span>
            <h2 style={{ marginTop: 10, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Every feature, side by side.
            </h2>
          </Reveal>
          <Reveal>
            <div style={{ overflowX: 'auto', border: '1px solid var(--hairline)', borderRadius: 14, background: 'var(--surface)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880, fontSize: 13.5 }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-2)' }}>
                    <th
                      style={{
                        textAlign: 'left', padding: '20px 20px',
                        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12,
                        color: 'var(--ink)', letterSpacing: '0.04em', textTransform: 'uppercase', width: '32%',
                        borderBottom: '2px solid var(--hairline)',
                      }}
                    >
                      Feature
                    </th>
                    {PLANS.map((p, i) => {
                      const { display, suffix } = fmtPrice(p.pkr, p.usd, currency)
                      const isFeat = 'featured' in p && !!(p as { featured?: boolean }).featured
                      return (
                        <th
                          key={i}
                          style={{
                            padding: '18px 14px', textAlign: 'left', fontWeight: 600,
                            borderLeft: '1px solid var(--hairline)',
                            borderBottom: '2px solid var(--hairline)',
                            background: isFeat ? 'color-mix(in srgb, var(--of-primary) 5%, var(--surface-2))' : 'var(--surface-2)',
                            minWidth: 120, verticalAlign: 'top',
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {p.name}
                            {isFeat && (
                              <span style={{ background: 'var(--of-primary)', color: 'white', borderRadius: 999, padding: '1px 6px', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                                POPULAR
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>{display}</span>
                            {suffix && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>{suffix}</span>}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) =>
                    'section' in row ? (
                      <tr key={i}>
                        <td colSpan={6} style={{ fontFamily: 'var(--font-mono)', padding: '18px 20px 8px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 500, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
                          {row.section}
                        </td>
                      </tr>
                    ) : (
                      <tr key={i} style={{ borderTop: '1px solid var(--hairline)' }}>
                        <td style={{ padding: '13px 20px', color: 'var(--ink)', fontSize: 14 }}>{row.feat}</td>
                        {(row.values as unknown as (boolean | string)[]).map((v, j) => (
                          <td
                            key={j}
                            style={{
                              padding: '13px 14px', textAlign: 'left',
                              borderLeft: '1px solid var(--hairline)',
                              background: ('featured' in PLANS[j] && !!(PLANS[j] as { featured?: boolean }).featured) ? 'color-mix(in srgb, var(--of-primary) 3%, var(--surface))' : 'transparent',
                            }}
                          >
                            <CompareCell v={v} />
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection dark={false} />

      {/* FAQ */}
      <section style={{ paddingBlock: 80, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 56 }}>
          <Reveal>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500 }}>
              FAQ
            </span>
            <h2 style={{ marginTop: 10, fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Common pricing questions.
            </h2>
            <p style={{ marginTop: 14, marginBottom: 18, color: 'var(--ink-subtle)', fontSize: 15, lineHeight: 1.6 }}>
              Don&apos;t see yours? Talk to Owais directly — DMs open in the freelancer/agency communities OwFlex was built for.
            </p>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--hairline)', textDecoration: 'none' }}>
              Ask on WhatsApp <ArrowUpRight size={13} />
            </a>
          </Reveal>
          <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${isOpen ? 'var(--hairline-strong)' : 'var(--hairline)'}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'border-color .15s',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '18px 22px',
                      background: 'transparent',
                      border: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      size={16}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform .2s',
                        color: 'var(--ink-muted)',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 22px 20px', fontSize: 14, color: 'var(--ink-subtle)', lineHeight: 1.6 }}>{f.a}</div>
                  )}
                </div>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ paddingBlock: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline-strong)', borderRadius: 20, padding: '56px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center', position: 'relative', overflow: 'hidden' }} className="mkt-grid-bg">
              <span style={{ fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(14,165,233,.3)', background: 'var(--of-primary-soft)', color: 'var(--of-primary-deep)', fontWeight: 500, position: 'relative' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-primary)' }} />
                Free forever · No credit card
              </span>
              <h2 style={{ position: 'relative', maxWidth: 700, fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Start in 60 seconds. Bill your first retainer this week.
              </h2>
              <p style={{ position: 'relative', maxWidth: 540, fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                Create your first bot portal, drop in the embed script, invite your client. That&apos;s the whole onboarding.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', marginTop: 4 }}>
                <Link href="/dashboard/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: 'var(--of-primary)', color: 'white', textDecoration: 'none', border: '1px solid transparent' }}>
                  Create your first bot portal <ArrowRight size={16} />
                </Link>
                <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '13px 22px', borderRadius: 10, fontSize: 15, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--hairline-strong)', textDecoration: 'none' }}>
                  Talk to Owais
                </a>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', position: 'relative', fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
                Pay in PKR or USD · Cancel any time
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
