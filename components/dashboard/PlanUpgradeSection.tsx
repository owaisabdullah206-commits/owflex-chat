import { PLAN_PRICES_PKR } from '@/lib/billing/payfast'

const PLAN_ORDER = ['free', 'starter', 'pro', 'agency', 'enterprise'] as const
type KnownPlan = (typeof PLAN_ORDER)[number]

const PLAN_USD: Record<string, string> = {
  starter: '$15',
  pro:     '$29',
  agency:  '$79',
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['2 bots', '3,000 conversations/mo', 'Full widget customization'],
  pro:     ['8 bots', '15,000 conversations/mo', 'Weekly email digest'],
  agency:  ['Unlimited bots', '75,000 conversations/mo', 'Custom widget branding'],
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
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        plans.upgrade
      </p>
      <p className="text-[11px] text-[var(--ink-muted)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
        current_plan=<span className="text-[var(--ink)]">{currentPlan}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {upgradablePlans.map((plan) => (
          <div
            key={plan}
            className="bg-[var(--surface)] border border-[var(--hairline)] p-4 flex flex-col gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {plan}
                </p>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-[var(--accent)]/15 text-[var(--accent)]">
                  Launch Price
                </span>
              </div>
              <p
                className="text-[28px] font-semibold leading-none text-[var(--ink)]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
              >
                ₨{PLAN_PRICES_PKR[plan].toLocaleString()}
                <span className="text-[14px] text-[var(--ink-subtle)] ml-1">/mo</span>
              </p>
              <p className="text-[11px] text-[var(--ink-muted)] mt-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                or {PLAN_USD[plan]}/mo USD
              </p>
            </div>

            <ul className="space-y-1.5">
              {PLAN_FEATURES[plan].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                  <span className="text-[var(--accent)] mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mt-auto">
              <a
                href={`/api/billing/payfast-plan-url?plan=${plan}`}
                className="flex-1 text-center py-1.5 bg-[var(--of-primary)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'var(--font-mono)' }}
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
        ))}

        {/* Enterprise card */}
        {currentIdx < PLAN_ORDER.indexOf('enterprise') && (
          <div className="bg-[var(--surface)] border border-[var(--hairline)] p-4 flex flex-col gap-4">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                enterprise
              </p>
              <p
                className="text-[28px] font-semibold leading-none text-[var(--ink)]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
              >
                Custom
              </p>
              <p className="text-[11px] text-[var(--ink-muted)] mt-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                tailored pricing
              </p>
            </div>
            <ul className="space-y-1.5">
              {['Unlimited everything', 'Dedicated support + SLA', 'BYOK — bring your own LLM key'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                  <span className="text-[var(--accent)] mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@owflex.com?subject=Enterprise plan inquiry"
              className="text-center py-1.5 border border-[var(--hairline)] text-[var(--ink)] text-[11px] font-medium hover:bg-[var(--surface-2)] transition-colors mt-auto"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Contact Us
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
