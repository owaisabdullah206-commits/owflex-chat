'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Check, Minus, ArrowRight, ArrowUpRight,
  Sparkles, Shield, ChevronDown,
} from 'lucide-react'
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon'
import MarketingFooter from './MarketingFooter'
import { MarketingNav } from './MarketingNav'
import { useDarkMode } from './useDarkMode'

// ─── WhatsApp helper ──────────────────────────────────────────────────────────
function waHref(text: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

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
      '2M credits included / month',
      '15 leads / month',
      '7-day conversation history',
      '3 docs · 5 MB storage · 10-product CSV catalog',
      'Color-only widget customization',
      'Forced "Powered by Octively" badge',
      'WordPress plugin',
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
    cta: 'Get started',
    href: '/dashboard/signup',
    features: [
      '2 bots · 3,000 conversations / month',
      '30M credits included / month',
      'Unlimited leads / month',
      '25 MB document storage · 30-day history',
      'Full widget customization',
      'Can turn off "Powered by Octively" badge',
      'Lead capture on/off · strict mode',
      'AI-powered responses',
      'WordPress plugin · email support',
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
    cta: 'Get started',
    href: '/dashboard/signup',
    featured: true,
    features: [
      '8 bots · 15,000 conversations / month',
      '150M credits included / month',
      'Unlimited leads / month',
      '100 MB document storage · unlimited history',
      'Enhanced responses · advanced analytics',
      'Per-page analytics, top conversation pages breakdown',
      'Message ratings, thumbs up/down, satisfaction score',
      'Lead webhook, push to Zapier, n8n, Make, or CRM',
      'Unanswered questions list',
      'Weekly email digest',
      'PDF, DOCX, CSV / Excel upload + website scraping',
      'Selective page crawling, include/exclude path filters',
      'Smart model routing',
      'Human handoff & escalation (email reply)',
      'WhatsApp Business API channel (Phase 6)',
      'WordPress plugin · priority email support',
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
    cta: 'Get started',
    href: '/dashboard/signup',
    features: [
      'Unlimited bots · 75,000 conversations / month',
      '750M credits / month · better top-up rate',
      'Unlimited leads',
      '500 MB document storage · unlimited history',
      'Full performance · analytics suite',
      'Full white-label, custom branding text + URL',
      'White-label portal login + custom subdomain',
      'Live chat handoff, real-time agent takeover in the widget',
      'Sub-tenant management · per-bot allocation',
      'Lead webhook + full REST API access',
      'WhatsApp Business API channel (Phase 6)',
      'Audit log viewer · dedicated support',
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
    href: '/contact',
    features: [
      'Everything in Agency',
      'Custom conversation & credit volume',
      'BYOK, bring your own LLM API keys',
      'Dedicated support + SLA',
      'SOC 2 / DPA on request',
      'Optional self-hosted / on-prem deployment',
      'Custom data residency (PK, EU, US)',
    ],
  },
] as const

type Plan = (typeof PLANS)[number]
type Billing = 'monthly' | 'annual'

function fmtPrice(pkr: number | 'custom', usd: number | 'custom', currency: Currency, billing: Billing = 'monthly') {
  if (pkr === 0) return { display: currency === 'PKR' ? '₨0' : '$0', suffix: '' }
  if (pkr === 'custom') return { display: 'Custom', suffix: '' }
  const annualFactor = billing === 'annual' ? (10 / 12) : 1
  if (currency === 'PKR') {
    const monthly = Math.round((pkr as number) * annualFactor / 100) * 100
    return { display: `₨${monthly.toLocaleString()}`, suffix: billing === 'annual' ? '/mo · billed yearly' : '/mo' }
  }
  const monthly = Math.round((usd as number) * annualFactor)
  return { display: `$${monthly}`, suffix: billing === 'annual' ? '/mo · billed yearly' : '/mo' }
}

// ─── Comparison table data ────────────────────────────────────────────────────

const COMPARE_ROWS = [
  { section: 'Core limits' },
  { feat: 'Bots', values: ['1', '2', '8', 'Unlimited', 'Unlimited'] },
  { feat: 'Conversations / month', values: ['200', '3,000', '15,000', '75,000', 'Custom'] },
  { feat: 'Credits included / month', values: ['2M', '30M', '150M', '750M', 'Custom'] },
  { feat: 'Addon credit top-ups', values: [false, true, true, 'Better rate', 'Best rate'] },
  { feat: 'Leads / month', values: ['15', '∞', '∞', '∞', '∞'] },
  { feat: 'Document storage', values: ['5 MB', '25 MB', '100 MB', '500 MB', 'Custom'] },
  { feat: 'Conversation history', values: ['7 days', '30 days', 'Unlimited', 'Unlimited', 'Unlimited'] },

  { section: 'Widget & branding' },
  { feat: 'Full widget customization', values: ['Color only', true, true, true, true] },
  { feat: '"Powered by Octively" badge', values: ['Forced ON', 'Can turn off', 'Can turn off', 'Custom / OFF', 'Custom / OFF'] },
  { feat: 'Custom branding text + URL', values: [false, false, false, true, true] },
  { feat: 'White-label portal login', values: [false, false, false, true, true] },
  { feat: 'Custom portal subdomain', values: [false, false, false, true, true] },
  { feat: 'Separate client portal', values: [true, true, true, 'White-label', 'White-label'] },

  { section: 'AI & intelligence' },
  { feat: 'Analytics', values: ['Basic', 'Basic', 'Advanced + flagged', 'Full', 'Full'] },
  { feat: 'Per-page analytics, top conversation pages', values: [false, false, true, true, true] },
  { feat: 'Message ratings & satisfaction score', values: [false, false, true, true, true] },
  { feat: 'Smart auto-routing', values: [false, false, true, true, true] },
  { feat: 'Unanswered questions list', values: [false, false, true, true, true] },
  { feat: 'Document upload, PDF, DOCX, CSV / Excel', values: ['3 docs', false, true, true, true] },
  { feat: 'Website scraping', values: [false, false, true, true, true] },
  { feat: 'Selective page crawling, path include/exclude filters', values: [false, false, true, true, true] },
  { feat: 'CSV / Excel product catalog import (Shopify & WooCommerce)', values: ['10 products', false, true, true, true] },

  { section: 'Operations' },
  { feat: 'Lead capture on/off', values: [false, true, true, true, true] },
  { feat: 'Lead pipeline (New / Contacted / Won / Lost)', values: [true, true, true, true, true] },
  { feat: 'Strict mode', values: [false, true, true, true, true] },
  { feat: 'Trigger tooltip', values: [true, true, true, true, true] },
  { feat: 'Human handoff / escalation (email reply)', values: [false, false, true, true, true] },
  { feat: 'Live chat handoff (real-time widget takeover)', values: [false, false, false, true, true] },
  { feat: 'Weekly email digest', values: [false, false, true, true, true] },
  { feat: 'Sub-tenant management', values: [false, false, false, true, true] },
  { feat: 'Per-bot resource allocation', values: [false, false, false, true, true] },
  { feat: 'API access', values: [false, false, false, true, true] },
  { feat: 'Lead webhook, Zapier / n8n / Make / custom endpoint', values: [false, false, true, true, true] },
  { feat: 'WhatsApp Business API channel (Phase 6)', values: [false, false, 'Add-on', 'Add-on', 'Add-on'] },
  { feat: 'Full REST API access', values: [false, false, false, true, true] },
  { feat: 'Audit log viewer', values: [false, false, false, true, true] },
  { feat: 'BYOK, bring your own LLM key', values: [false, false, false, false, true] },
  { feat: 'WordPress plugin', values: [true, true, true, true, true] },

  { section: 'Support' },
  { feat: 'Support level', values: ['Community', 'Email', 'Priority email', 'Dedicated', 'Dedicated + SLA'] },
] as const

// ─── Competitor comparison ──────────────────────────────────────────────────────
// Columns map 1:1 to each row's `values` array. Octively is first (us: true).
// Competitor figures are published entry rates as of May 2026 (see footnote in UI).

const COMPETITORS = [
  { name: 'Octively', us: true },
  { name: 'Stammer.ai', us: false },
  { name: 'ConvoCore', us: false },
  { name: 'ChatLab', us: false },
] as const

const COMPARE_VS_ROWS = [
  { label: 'Lowest paid plan', values: ['₨2,500 / $15 per mo', '$49 / mo', '$49 / mo', '$15 / mo'] },
  { label: 'Full white-label entry price', values: ['₨20,000 / $79 per mo', '$497 / mo', '$497 / mo', '$360 / mo'] },
  { label: 'Free plan (permanent, no timer)', values: [true, false, false, false] },
  { label: 'No per-message fees', values: [true, 'No (+$0.001–$0.03/msg)', 'No (usage billed extra)', 'No (+$7/1K credits)'] },
  { label: 'No per-seat / per-bot charges', values: [true, false, false, 'No (+$7/seat)'] },
  { label: 'Flat, predictable monthly price', values: [true, false, false, false] },
  { label: 'Built-in client portal', values: [true, 'Paid add-on', true, true] },
  { label: 'White-label branding', values: [true, true, true, true] },
  { label: 'RAG knowledge base (PDF/URL/CSV)', values: [true, 'Basic URL only', 'Basic', 'Limited'] },
  { label: 'Urdu / Roman Urdu reply language', values: [true, false, false, false] },
  { label: 'PKR pricing + PayFast payments', values: [true, false, false, false] },
  { label: 'Lead pipeline (New/Contacted/Won/Lost)', values: [true, false, false, false] },
  { label: 'Pricing under $20/mo available', values: [true, false, false, true] },
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
  { q: 'What counts as a "conversation"?', a: 'A unique session, one visitor\'s chat with your bot, no matter how many messages. Sessions reset after 30 minutes of inactivity. Easy to forecast.' },
  { q: 'What happens if I run out of credits mid-month?', a: 'Your bots fall back to your plan\'s included default model silently, your end users never see an error. You get an email and a dashboard banner: top up to restore premium models.' },
  { q: 'How does billing work, PKR vs USD?', a: 'We handle upgrades and top-ups manually for now. Message us on WhatsApp with your preferred currency (PKR or USD) and plan, and we\'ll sort the payment and activate your plan within the hour.' },
  { q: 'Is my clients\' conversation data used to train AI models?', a: 'No. We route through providers under zero-data-retention agreements (DeepSeek, OpenRouter, Groq). Messages are processed in transit only and discarded after the response.' },
  { q: 'Do you charge per seat?', a: 'No. Every plan is org-based, unlimited seats. Charge your clients however you want, Octively doesn\'t meter users.' },
  { q: 'Can my client self-serve and bypass me?', a: 'No. SMB clients only get portal access (app.Octively.com). Bot creation, billing, and model settings stay with the developer/agency, by design.' },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────

const QUOTES_ROW_1 = [
  { q: 'Friday used to be report day. Screenshots, Excel, emailing PDFs to three different clients. Now I just tell them to log into their portal. One of them pays me ₨15k a month basically for that dashboard.', name: 'Ahmed R.', role: 'Solo dev · Karachi', initials: 'AR' },
  { q: 'We were on Stammer\'s $197 agency plan and using maybe a third of it. Moved 7 client bots over in a week. My clients never noticed anything changed, which honestly is the whole point of white label.', name: 'Hira K.', role: 'Agency owner · Lahore', initials: 'HK' },
  { q: 'I keep small clients on the default model and put the two who pay more on a smarter one. Took me a while to realize I could price my own plans around that. The per-bot credit budget does the policing for me.', name: 'Bilal Q.', role: 'TalkBox.pk', initials: 'BQ' },
  { q: 'My tea exporter client types in Urdu and the bot replies in Urdu. I did nothing special to set that up. Their accounts guy downloads the leads CSV himself now instead of calling me every Monday.', name: 'Maryam S.', role: 'Freelancer · Islamabad', initials: 'MS' },
]
const QUOTES_ROW_2 = [
  { q: 'My client sees my logo on the widget and their own portal login, nothing else. One of them genuinely thinks my team built the whole thing. I\'m not correcting him.', name: 'Daniyal R.', role: 'Bolt Agency · Lahore', initials: 'DR' },
  { q: 'Moved four client bots off Botpress in a weekend. Re-uploaded the training docs, swapped the embed script. Nobody noticed, which I\'m taking as a compliment.', name: 'Saad M.', role: 'Indie dev · Faisalabad', initials: 'SM' },
  { q: 'Our retainer client refused anything where their data sits in a shared dashboard. Separate logins, each client seeing only their own bot, that\'s what closed it. The "any updates?" emails have stopped.', name: 'Fatima Z.', role: 'Stackbot', initials: 'FZ' },
  { q: 'Half my clients are in Karachi, the rest are in the UK. Rupee pricing is why I signed up, I was done paying card fees on dollar subscriptions. The UK clients just see their own branded portal and never ask what\'s underneath.', name: 'Aamir T.', role: 'Agency · Karachi → London', initials: 'AT' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

// Renders a price string with the leading ₨ / $ glyph shrunk so it doesn't
// overpower the number (the ₨ glyph is wide — "Rs" — in JetBrains Mono).
function CurrencyText({ text, symbolSize }: { text: string; symbolSize: number | string }) {
  const hasSym = text.startsWith('₨') || text.startsWith('$')
  if (!hasSym) return <>{text}</>
  return (
    <>
      <span style={{ fontSize: symbolSize }}>{text[0]}</span>
      {text.slice(1)}
    </>
  )
}

function PriceDisplay({ plan, dark, currency, billing = 'monthly' }: { plan: Plan; dark?: boolean; currency: Currency; billing?: Billing }) {
  const { display, suffix } = fmtPrice(plan.pkr, plan.usd, currency, billing)
  const fullPkr = 'fullPkr' in plan ? plan.fullPkr : undefined
  const fullUsd = 'fullUsd' in plan ? plan.fullUsd : undefined
  const full = currency === 'PKR' ? fullPkr : fullUsd
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {/* Render ₨ / $ symbol smaller so it doesn't overpower the number */}
          {(display.startsWith('₨') || display.startsWith('$')) && (
            <span style={{ fontSize: 26 }}>{display[0]}</span>
          )}
          {(display.startsWith('₨') || display.startsWith('$')) ? display.slice(1) : display}
        </span>
        {suffix && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: dark ? 'var(--dark-ink-muted)' : 'var(--ink-muted)' }}>{suffix}</span>}
      </div>
      {billing === 'monthly' && full && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dark ? 'var(--dark-ink-muted)' : 'var(--ink-muted)', marginTop: 6 }}>
          <span style={{ textDecoration: 'line-through' }}>
            <span style={{ fontSize: 9 }}>{currency === 'PKR' ? '₨' : '$'}</span>
            {currency === 'PKR' ? (fullPkr as number).toLocaleString() : fullUsd}
          </span>{' '}
          <span style={{ color: 'var(--of-success)' }}>launch price</span>
        </div>
      )}
      {billing === 'annual' && plan.pkr !== 0 && plan.pkr !== 'custom' && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--of-success)', marginTop: 6 }}>
          2 months free, save {currency === 'PKR' ? `₨${Math.round((plan.pkr as number) * 2).toLocaleString()}` : `$${Math.round((plan.usd as number) * 2)}`}
        </div>
      )}
    </div>
  )
}

function FeatureList({ items, dark, dense }: { items: readonly string[]; dark?: boolean; dense?: boolean }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: dense ? 7 : 9 }}>
      {items.map((f, i) => {
        const m = f.match(/^(.*?)\s*\(Phase \d+\)(.*)$/)
        const text = m ? (m[1] + m[2]).trim() : f
        const soon = !!m
        return (
          <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.45 }}>
            <span style={{ marginTop: 2, color: dark ? 'var(--of-primary-text-dark, #38BDF8)' : 'var(--of-primary)', flexShrink: 0 }}>
              <Check size={14} />
            </span>
            <span style={{ color: dark ? 'var(--dark-ink)' : 'var(--ink)' }}>
              {text}
              {soon && (
                <span style={{
                  display: 'inline-flex', verticalAlign: 'middle', marginLeft: 6,
                  fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: dark ? 'var(--dark-ink-muted)' : 'var(--ink-subtle)',
                  background: dark ? 'rgba(255,255,255,.07)' : 'var(--surface-2)',
                  border: `1px solid ${dark ? 'var(--dark-hairline)' : 'var(--hairline)'}`,
                  borderRadius: 999, padding: '1px 6px',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  soon
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function CompareCell({ v }: { v: boolean | string }) {
  if (v === true) return <Check size={16} style={{ color: 'var(--of-success)' }} />
  if (v === false) return <span style={{ color: 'var(--ink-muted)', opacity: 0.45 }}><Minus size={16} /></span>
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}><CurrencyText text={v} symbolSize="0.78em" /></span>
}

// ─── Plan cards, Traditional layout ─────────────────────────────────────────

function PlanCardTraditional({ plan, currency, billing }: { plan: Plan; currency: Currency; billing: Billing }) {
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
      <PriceDisplay plan={plan} currency={currency} billing={billing} />
      <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 12 }}>
        <FeatureList items={plan.features} dense />
      </div>
      <Link href={plan.href} style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--hairline)', textDecoration: 'none', transition: 'border-color .15s' }}>
        {plan.cta}
      </Link>
    </div>
  )
}

function PlanCardFeaturedSlim({ plan, currency, billing }: { plan: Plan; currency: Currency; billing: Billing }) {
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
      <PriceDisplay plan={plan} dark currency={currency} billing={billing} />
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
  const [billing, setBilling] = useState<Billing>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { dark: darkMode, toggleDark } = useDarkMode()

  const freePlan = PLANS[0]
  const starterPlan = PLANS[1]
  const proPlan = PLANS[2]
  const agencyPlan = PLANS[3]
  const enterprisePlan = PLANS[4]

  return (
    <div className={`marketing${darkMode ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav
        dark={darkMode}
        onToggleDark={toggleDark}
      />

      {/* Pricing Header */}
      <section style={{ paddingTop: 64, paddingBottom: 40, position: 'relative', overflow: 'hidden' }}>
        <div className="mkt-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(14,165,233,.3)', background: 'var(--of-primary-soft)', color: 'var(--of-primary-deep)', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-primary)' }} />
            Launch pricing, locked for founding members
          </span>
          <h1 style={{ maxWidth: 820, fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0 }}>
            Developer plans built for <span style={{ color: 'var(--of-primary)' }}>Pakistani agencies</span> and freelancers.
          </h1>
          <p style={{ textAlign: 'center', fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.65, maxWidth: '60ch', margin: 0 }}>
            Local pricing in PKR. Fair USD for the rest of the world. Every plan includes a monthly credit allowance, top up only when you outgrow it.
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
                {k === 'PKR' ? '₨ Pakistan' : '$ International'}
              </button>
            ))}
          </div>
          {/* Billing period toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 999, border: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
            <button
              onClick={() => setBilling('monthly')}
              style={{ border: 0, cursor: 'pointer', padding: '2px 10px', borderRadius: 999, fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: billing === 'monthly' ? 500 : 400, color: billing === 'monthly' ? 'var(--ink)' : 'var(--ink-subtle)', background: billing === 'monthly' ? 'var(--surface)' : 'transparent', transition: 'all .15s' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              style={{ border: 0, cursor: 'pointer', padding: '2px 10px', borderRadius: 999, fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: billing === 'annual' ? 500 : 400, color: billing === 'annual' ? 'var(--ink)' : 'var(--ink-subtle)', background: billing === 'annual' ? 'var(--surface)' : 'transparent', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Annual
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--of-success)', background: 'var(--of-success-soft)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 999, padding: '1px 6px' }}>
                2 months free
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Traditional Plan Grid */}
      <section style={{ paddingBlock: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div className="mkt-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[freePlan, starterPlan, proPlan, agencyPlan].map((plan) => {
                const isFeat = 'featured' in plan && !!(plan as { featured?: boolean }).featured
                return isFeat
                  ? <PlanCardFeaturedSlim key={plan.key} plan={plan} currency={currency} billing={billing} />
                  : <PlanCardTraditional key={plan.key} plan={plan} currency={currency} billing={billing} />
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
                  {enterprisePlan.tagline}, BYOK, audit logs, SLA, optional on-prem. Talk to us about data residency, model preferences, and integration needs.
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
            <a href="/pricing#credits" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--of-primary)', textDecoration: 'none', fontWeight: 500 }}>
              See credit rates <ArrowUpRight size={14} />
            </a>
          </Reveal>
          <div className="mkt-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
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
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}><CurrencyText text={display} symbolSize={16} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-subtle)' }}>
                      ${p.value} in credits
                      {p.bonus && (
                        <span style={{ background: 'var(--of-success-soft)', color: 'var(--of-success)', borderRadius: 999, padding: '2px 6px', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                          {p.bonus} bonus
                        </span>
                      )}
                    </div>
                    <a
                      href={waHref(`Hi, I'd like to buy the ${p.name} on Octively.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginTop: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'white', background: '#25D366', border: '1px solid transparent', textDecoration: 'none' }}
                    >
                      <WhatsAppIcon size={16} />
                      Buy via WhatsApp
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
                  <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)' }}>
                    <th
                      style={{
                        textAlign: 'left', padding: '20px 20px',
                        fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 12,
                        color: 'var(--ink-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', width: '32%',
                        borderBottom: '1px solid var(--hairline)',
                      }}
                    >
                      Plan
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
                            borderBottom: '1px solid var(--hairline)',
                            background: isFeat ? 'color-mix(in srgb, var(--of-primary) 5%, var(--surface))' : 'var(--surface)',
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
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}><CurrencyText text={display} symbolSize={11} /></span>
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
                        <td style={{ padding: '13px 20px', color: 'var(--ink)', fontSize: 14 }}>
                          {row.feat.replace(/\s*\(Phase \d+\)/g, '')}
                          {/\(Phase \d+\)/.test(row.feat) && (
                            <span style={{
                              display: 'inline-flex', verticalAlign: 'middle', marginLeft: 6,
                              fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600,
                              color: 'var(--ink-subtle)', background: 'var(--surface-2)',
                              border: '1px solid var(--hairline)', borderRadius: 999,
                              padding: '1px 5px', letterSpacing: '0.04em', textTransform: 'uppercase',
                            }}>soon</span>
                          )}
                        </td>
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

      {/* Competitor comparison */}
      <section style={{ paddingBlock: 80, borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500 }}>
              How Octively compares
            </span>
            <h2 style={{ marginTop: 10, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              The same job, at a fraction of the price.
            </h2>
            <p style={{ marginTop: 12, fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: 560 }}>
              Stammer.ai, ChatLab, and ConvoCore all start near $200 a month, then charge extra per message on top. Here is how the plans compare.
            </p>
          </Reveal>
          <Reveal>
            <div style={{ overflowX: 'auto', border: '1px solid var(--hairline)', borderRadius: 14, background: 'var(--surface)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720, fontSize: 13.5 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '18px 20px', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 12, color: 'var(--ink-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', width: '28%', borderBottom: '1px solid var(--hairline)' }} />
                    {COMPETITORS.map((c) => (
                      <th
                        key={c.name}
                        style={{
                          padding: '18px 14px', textAlign: 'left', fontWeight: 600, fontSize: 13,
                          borderLeft: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)',
                          background: c.us ? 'color-mix(in srgb, var(--of-primary) 6%, var(--surface))' : 'var(--surface)',
                          minWidth: 130, verticalAlign: 'top',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {c.name}
                          {c.us && (
                            <span style={{ background: 'var(--of-primary)', color: 'white', borderRadius: 999, padding: '1px 6px', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                              THIS IS US
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_VS_ROWS.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--hairline)' }}>
                      <td style={{ padding: '13px 20px', color: 'var(--ink)', fontSize: 14, fontWeight: 500 }}>{row.label}</td>
                      {row.values.map((v, j) => (
                        <td
                          key={j}
                          style={{
                            padding: '13px 14px', textAlign: 'left',
                            borderLeft: '1px solid var(--hairline)',
                            background: COMPETITORS[j].us ? 'color-mix(in srgb, var(--of-primary) 4%, var(--surface))' : 'transparent',
                            color: COMPETITORS[j].us ? 'var(--ink)' : 'var(--ink-muted)',
                            fontWeight: COMPETITORS[j].us ? 600 : 400,
                          }}
                        >
                          <CompareCell v={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-subtle)', lineHeight: 1.6 }}>
              Competitor prices are their published entry rates as of May 2026 and may change. Check each provider&apos;s site for current pricing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection dark={false} />

      {/* FAQ */}
      <section style={{ paddingBlock: 80, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
        <div className="mkt-grid-2" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 56 }}>
          <Reveal>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500 }}>
              FAQ
            </span>
            <h2 style={{ marginTop: 10, fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Common pricing questions.
            </h2>
            <p style={{ marginTop: 14, marginBottom: 18, color: 'var(--ink-subtle)', fontSize: 15, lineHeight: 1.6 }}>
              Don&apos;t see yours? DMs open in the freelancer/agency communities Octively was built for.
            </p>
            <a
              href={waHref('Hi, I have a question about Octively pricing.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--hairline)', textDecoration: 'none' }}
            >
              <WhatsAppIcon size={15} /> Ask on WhatsApp <ArrowUpRight size={13} />
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
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline-strong)', borderRadius: 20, padding: '56px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div className="mkt-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
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
                <a
                  href={waHref('Hi, I\'d like to learn more about Octively.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '13px 22px', borderRadius: 10, fontSize: 15, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--hairline-strong)', textDecoration: 'none' }}
                >
                  Talk to us
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
