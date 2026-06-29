import { PLAN_PRICES_PKR } from '@/lib/billing/payfast'
import { ArrowUpRight, Zap, BarChart2, Globe, Building2 } from 'lucide-react'
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon'

const PLAN_ORDER = ['free', 'starter', 'pro', 'agency', 'enterprise'] as const
type KnownPlan = (typeof PLAN_ORDER)[number]

const PLAN_USD: Record<string, string> = {
  starter: '$15',
  pro:     '$29',
  agency:  '$79',
}

const PLAN_META: Record<string, {
  icon: React.ReactNode
  accent: string
  blurb: string
  features: string[]
  waText: string
}> = {
  starter: {
    icon:    <Zap className="h-4 w-4" />,
    accent:  'var(--of-primary)',
    blurb:   '2 agents · 3K convos · 30M credits/mo',
    features: [
      'Unlimited leads',
      '25 MB storage · 30-day history',
      'Full widget customization',
      'Email support',
    ],
    waText: 'Hi, I\'d like to upgrade to the Starter plan on Octively.',
  },
  pro: {
    icon:    <BarChart2 className="h-4 w-4" />,
    accent:  '#8B5CF6',
    blurb:   '8 agents · 15K convos · 150M credits/mo',
    features: [
      'Unlimited leads · 100 MB storage',
      'Unlimited history · advanced analytics',
      'Unanswered questions · PDF + URL scraping',
      'Credit top-ups · priority support',
    ],
    waText: 'Hi, I\'d like to upgrade to the Pro plan on Octively.',
  },
  agency: {
    icon:    <Globe className="h-4 w-4" />,
    accent:  '#F59E0B',
    blurb:   'Unlimited agents · 75K convos · 750M credits/mo',
    features: [
      'White-label branding · custom "Powered by"',
      '500 MB storage · 500 docs · 1K crawl pages',
      'Better credit rates · advanced analytics',
      'Dedicated support',
    ],
    waText: 'Hi, I\'d like to upgrade to the Agency plan on Octively.',
  },
}

/** Build a WhatsApp deep link with a pre-filled message, optionally including user email. */
function waHref(text: string, userEmail?: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const fullText = userEmail ? `${text} (Account: ${userEmail})` : text
  return `https://wa.me/${number}?text=${encodeURIComponent(fullText)}`
}

interface Props {
  currentPlan: string
  userEmail?: string
}

function PlanCard({ plan, featured = false, userEmail }: { plan: 'starter' | 'pro' | 'agency'; featured?: boolean; userEmail?: string }) {
  const meta  = PLAN_META[plan]
  const href  = waHref(meta.waText, userEmail)

  if (featured) {
    /* Hero tile — full-width, horizontal layout */
    return (
      <div
        className="relative overflow-hidden border border-[var(--hairline)] bg-[var(--surface)] col-span-2"
        style={{ borderTopColor: meta.accent, borderTopWidth: 2 }}
      >
        {/* Faint accent glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ background: `radial-gradient(ellipse at 20% 50%, ${meta.accent}, transparent 60%)` }}
        />
        <div className="relative flex flex-col sm:flex-row gap-6 p-6">
          {/* Left — name + price + CTA */}
          <div className="flex flex-col gap-4 sm:min-w-[200px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: meta.accent }}>{meta.icon}</span>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {plan}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                  style={{ fontFamily: 'var(--font-mono)', background: `${meta.accent}22`, color: meta.accent }}
                >
                  Most popular
                </span>
              </div>
              <p className="text-[10px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {meta.blurb}
              </p>
            </div>
            <div>
              <p
                className="text-[38px] font-semibold leading-none text-[var(--ink)]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
              >
                <span style={{ fontSize: '0.55em', fontWeight: 600, verticalAlign: 'middle' }}>₨</span>{PLAN_PRICES_PKR[plan].toLocaleString()}
                <span className="text-[15px] text-[var(--ink-subtle)] ml-1">/mo</span>
              </p>
              <p className="text-[11px] text-[var(--ink-muted)] mt-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                or {PLAN_USD[plan]}/mo USD · limited time discount
              </p>
            </div>
            {/* WhatsApp CTA */}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 text-white text-[11px] font-semibold hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-mono)', background: '#25D366' }}
            >
              <WhatsAppIcon size={14} />
              Upgrade via WhatsApp
            </a>
            {/*
              // ── Direct payment buttons (re-enable when ready) ──────────────
              <div className="flex gap-2">
                <a
                  href={`/api/billing/payfast-plan-url?plan=${plan}`}
                  className="flex-1 text-center py-2 text-white text-[11px] font-semibold hover:opacity-90 transition-opacity"
                  style={{ fontFamily: 'var(--font-mono)', background: meta.accent }}
                >
                  PayFast
                </a>
                <a
                  href={`/api/billing/ls-plan-url?plan=${plan}`}
                  className="flex-1 text-center py-2 border border-[var(--hairline)] text-[var(--ink)] text-[11px] font-medium hover:bg-[var(--surface-2)] transition-colors"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Lemon Squeezy
                </a>
              </div>
            */}
          </div>
          {/* Divider */}
          <div className="hidden sm:block w-px bg-[var(--hairline)] self-stretch" />
          {/* Right — features */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 self-center">
            {meta.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                <span className="mt-0.5 shrink-0 font-bold" style={{ color: meta.accent }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  /* Regular tile */
  return (
    <div
      className="relative overflow-hidden flex flex-col gap-4 p-5 border border-[var(--hairline)] bg-[var(--surface)]"
      style={{ borderTopColor: meta.accent, borderTopWidth: 2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: meta.accent }}>{meta.icon}</span>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {plan}
            </span>
          </div>
          <p className="text-[10px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {meta.blurb}
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 shrink-0 whitespace-nowrap"
          style={{ fontFamily: 'var(--font-mono)', background: `${meta.accent}18`, color: meta.accent }}
        >
          limited time
        </span>
      </div>
      <div>
        <p
          className="text-[32px] font-semibold leading-none text-[var(--ink)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
        >
          <span style={{ fontSize: '0.55em', fontWeight: 600, verticalAlign: 'middle' }}>₨</span>{PLAN_PRICES_PKR[plan].toLocaleString()}
          <span className="text-[14px] text-[var(--ink-subtle)] ml-1">/mo</span>
        </p>
        <p className="text-[11px] text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
          or {PLAN_USD[plan]}/mo USD
        </p>
      </div>
      <ul className="space-y-1.5 flex-1">
        {meta.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
            <span className="mt-0.5 shrink-0" style={{ color: meta.accent }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      {/* WhatsApp CTA */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-1.5 text-white text-[11px] font-medium hover:opacity-90 transition-opacity mt-auto"
        style={{ fontFamily: 'var(--font-mono)', background: '#25D366' }}
      >
        <WhatsAppIcon size={14} />
        Upgrade via WhatsApp
      </a>
      {/*
        // ── Direct payment buttons (re-enable when ready) ────────────────────
        <div className="flex gap-2 mt-auto">
          <a
            href={`/api/billing/payfast-plan-url?plan=${plan}`}
            className="flex-1 text-center py-1.5 text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-mono)', background: meta.accent }}
          >
            PayFast
          </a>
          <a
            href={`/api/billing/ls-plan-url?plan=${plan}`}
            className="flex-1 text-center py-1.5 border border-[var(--hairline)] text-[var(--ink)] text-[11px] font-medium hover:bg-[var(--surface-2)] transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Lemon Squeezy
          </a>
        </div>
      */}
    </div>
  )
}

export function PlanUpgradeSection({ currentPlan, userEmail }: Props) {
  const currentIdx = PLAN_ORDER.indexOf(currentPlan as KnownPlan)
  const upgradablePlans = (['starter', 'pro', 'agency'] as const).filter((p) => {
    return PLAN_ORDER.indexOf(p) > currentIdx
  })
  const showEnterprise = currentIdx < PLAN_ORDER.indexOf('enterprise')

  if (upgradablePlans.length === 0 && !showEnterprise) return null

  const hasPro      = upgradablePlans.includes('pro')
  const nonProPlans = upgradablePlans.filter((p) => p !== 'pro')
  const enterpriseWaHref = waHref('Hi, I\'m interested in the Enterprise plan for Octively. Can we discuss?', userEmail)

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            plans.upgrade
          </p>
          <p className="text-[11px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            current_plan=<span className="text-[var(--ink)]">{currentPlan}</span>
          </p>
        </div>
        <a
          href="/pricing"
          className="flex items-center gap-1 text-[11px] text-[var(--of-primary)] hover:underline"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          view full pricing
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {hasPro && <PlanCard plan="pro" featured userEmail={userEmail} />}

        {nonProPlans.map((plan) => (
          <PlanCard key={plan} plan={plan} userEmail={userEmail} />
        ))}

        {showEnterprise && (
          <div className="relative overflow-hidden flex flex-col sm:flex-row gap-6 p-5 border border-[var(--hairline)] bg-[var(--surface)] sm:col-span-2 sm:items-center">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--ink-muted)]" />
            {/* Left */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-[var(--ink-muted)]" />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  enterprise
                </span>
              </div>
              <p className="text-[10px] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                Unlimited everything · custom credit rates · dedicated SLA
              </p>
              <div>
                <p
                  className="text-[28px] font-semibold leading-none text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
                >
                  Custom
                </p>
                <p className="text-[11px] text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                  tailored pricing
                </p>
              </div>
            </div>
            {/* Divider */}
            <div className="hidden sm:block w-px bg-[var(--hairline)] self-stretch" />
            {/* Right */}
            <div className="flex flex-col gap-3 sm:min-w-[260px]">
              <ul className="space-y-1.5">
                {['Unlimited agents · conversations · storage', 'Dedicated support + SLA', 'BYOK — bring your own LLM key'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                    <span className="text-[var(--ink-subtle)] mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={enterpriseWaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-1.5 text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'var(--font-mono)', background: '#25D366' }}
              >
                <WhatsAppIcon size={14} />
                Contact via WhatsApp
              </a>
              {/*
                // ── Direct contact button (re-enable when ready) ─────────────
                <a
                  href="mailto:hello@octively.com?subject=Enterprise plan inquiry"
                  className="text-center py-1.5 border border-[var(--hairline)] text-[var(--ink)] text-[11px] font-medium hover:bg-[var(--surface-2)] transition-colors"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Contact Us →
                </a>
              */}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
