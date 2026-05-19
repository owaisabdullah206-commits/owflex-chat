import { PLAN_PRICES_PKR } from '@/lib/billing/payfast'
import { ArrowUpRight, Zap, BarChart2, Globe, Building2 } from 'lucide-react'

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
}> = {
  starter: {
    icon: <Zap className="h-4 w-4" />,
    accent: 'var(--of-primary)',
    blurb: '2 bots · 3K convos · 30M credits/mo',
    features: [
      'Unlimited leads · 20 FAQs per bot',
      '25 MB storage · 30-day history',
      'Full widget customization',
      'Email support',
    ],
  },
  pro: {
    icon: <BarChart2 className="h-4 w-4" />,
    accent: '#8B5CF6',
    blurb: '8 bots · 15K convos · 150M credits/mo',
    features: [
      'Unlimited leads · 50 FAQs · 100 MB storage',
      'Unlimited history · advanced analytics',
      'Unanswered questions · PDF + URL scraping',
      'Credit top-ups · priority support',
    ],
  },
  agency: {
    icon: <Globe className="h-4 w-4" />,
    accent: '#F59E0B',
    blurb: 'Unlimited bots · 75K convos · 750M credits/mo',
    features: [
      'White-label branding · custom "Powered by"',
      '500 MB storage · 500 docs · 1K crawl pages',
      'Better credit rates · advanced analytics',
      'Dedicated support',
    ],
  },
}

interface Props {
  currentPlan: string
}

export function PlanUpgradeSection({ currentPlan }: Props) {
  const currentIdx = PLAN_ORDER.indexOf(currentPlan as KnownPlan)
  const upgradablePlans = (['starter', 'pro', 'agency'] as const).filter((p) => {
    const idx = PLAN_ORDER.indexOf(p)
    return idx > currentIdx
  })

  if (upgradablePlans.length === 0 && currentPlan !== 'enterprise') return null

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--hairline)] border border-[var(--hairline)] overflow-hidden">
        {upgradablePlans.map((plan) => {
          const meta = PLAN_META[plan]
          return (
            <div
              key={plan}
              className="bg-[var(--surface)] p-5 flex flex-col gap-4 relative overflow-hidden group"
            >
              {/* Subtle accent top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: meta.accent }}
              />

              {/* Plan name + icon */}
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
                <span className="text-[10px] font-medium px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                  Launch
                </span>
              </div>

              {/* Price */}
              <div>
                <p
                  className="text-[32px] font-semibold leading-none text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
                >
                  ₨{PLAN_PRICES_PKR[plan].toLocaleString()}
                  <span className="text-[14px] text-[var(--ink-subtle)] ml-1">/mo</span>
                </p>
                <p className="text-[11px] text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                  or {PLAN_USD[plan]}/mo USD
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 flex-1">
                {meta.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                    <span className="mt-0.5 shrink-0" style={{ color: meta.accent }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
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
            </div>
          )
        })}

        {/* Enterprise bento tile */}
        {currentIdx < PLAN_ORDER.indexOf('enterprise') && (
          <div className="bg-[var(--surface)] p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--ink-subtle)]" />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-[var(--ink-muted)]" />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    enterprise
                  </span>
                </div>
                <p className="text-[10px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  Unlimited everything · custom rates
                </p>
              </div>
            </div>
            <div>
              <p
                className="text-[32px] font-semibold leading-none text-[var(--ink)]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
              >
                Custom
              </p>
              <p className="text-[11px] text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                tailored pricing
              </p>
            </div>
            <ul className="space-y-1.5 flex-1">
              {['Unlimited bots · conversations · storage', 'Dedicated support + SLA', 'BYOK — bring your own LLM key'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                  <span className="text-[var(--ink-subtle)] mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@owflex.com?subject=Enterprise plan inquiry"
              className="text-center py-1.5 border border-[var(--hairline)] text-[var(--ink)] text-[11px] font-medium hover:bg-[var(--surface-2)] transition-colors mt-auto"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Contact Us →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
