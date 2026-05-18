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
      <h2 className="text-base font-semibold text-[var(--ink)] mb-1">Upgrade your plan</h2>
      <p className="text-xs text-[var(--ink-muted)] mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
        Your current plan: <span className="text-[var(--ink)]">{currentPlan}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upgradablePlans.map((plan) => (
          <div
            key={plan}
            className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5 flex flex-col gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[var(--ink)] capitalize">{plan}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  Launch Price
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)' }}>
                <span className="text-2xl font-bold text-[var(--ink)]">
                  ₨{PLAN_PRICES_PKR[plan].toLocaleString()}
                </span>
                <span className="text-xs text-[var(--ink-muted)] ml-1">/mo</span>
                <span className="text-xs text-[var(--ink-subtle)] ml-2">or {PLAN_USD[plan]}/mo</span>
              </div>
            </div>

            <ul className="space-y-1.5">
              {PLAN_FEATURES[plan].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-[var(--ink-muted)]">
                  <span className="text-[var(--accent)] mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 mt-auto">
              <a
                href={`/api/billing/payfast-plan-url?plan=${plan}`}
                className="block rounded-lg border border-[var(--accent)] text-center py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
              >
                Upgrade via PayFast (PKR)
              </a>
              <a
                href={`/api/billing/ls-plan-url?plan=${plan}`}
                className="block rounded-lg border border-[var(--hairline)] text-center py-2 text-xs font-medium text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] transition-colors"
              >
                Upgrade via Lemon Squeezy (USD)
              </a>
            </div>
          </div>
        ))}

        {/* Enterprise card */}
        {currentIdx < PLAN_ORDER.indexOf('enterprise') && (
          <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5 flex flex-col gap-4">
            <div>
              <span className="text-sm font-semibold text-[var(--ink)]">Enterprise</span>
              <div className="text-2xl font-bold text-[var(--ink)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Custom
              </div>
            </div>
            <ul className="space-y-1.5">
              {['Unlimited everything', 'Dedicated support + SLA', 'BYOK — bring your own LLM key'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-[var(--ink-muted)]">
                  <span className="text-[var(--accent)] mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={`mailto:hello@owflex.com?subject=Enterprise plan inquiry`}
              className="block rounded-lg border border-[var(--hairline)] text-center py-2 text-xs font-medium text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] transition-colors mt-auto"
            >
              Contact Us
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
