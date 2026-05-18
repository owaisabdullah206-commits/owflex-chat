import { PLAN_PRICES_PKR } from '@/lib/billing/payfast'

const USD_PRICES: Record<string, string> = {
  free:       '$0',
  starter:    '$15',
  pro:        '$29',
  agency:     '$79',
  enterprise: 'Custom',
}

const PLAN_FEATURES: Record<string, string[]> = {
  free:       ['1 bot', '200 conversations/mo', '15 leads/mo'],
  starter:    ['2 bots', '3,000 conversations/mo', 'Unlimited leads'],
  pro:        ['8 bots', '15,000 conversations/mo', 'Advanced analytics + email digest'],
  agency:     ['Unlimited bots', '75,000 conversations/mo', 'White-label widget branding'],
  enterprise: ['Unlimited everything', 'Dedicated support + SLA', 'BYOK — bring your own LLM key'],
}

const COMPARISON_ROWS = [
  { feature: 'Bots',                   free: '1',     starter: '2',     pro: '8',     agency: '∞',      enterprise: '∞' },
  { feature: 'Conversations/mo',        free: '200',   starter: '3,000', pro: '15,000',agency: '75,000', enterprise: 'Custom' },
  { feature: 'Leads/mo',                free: '15',    starter: '∞',     pro: '∞',     agency: '∞',      enterprise: '∞' },
  { feature: 'Document storage',        free: '—',     starter: '25 MB', pro: '100 MB',agency: '500 MB', enterprise: 'Custom' },
  { feature: 'Widget customization',    free: 'Color only', starter: 'Full', pro: 'Full', agency: 'Full', enterprise: 'Full' },
  { feature: '"Powered by OwFlex"',     free: 'Forced', starter: 'Can remove', pro: 'Can remove', agency: 'Custom or off', enterprise: 'Custom or off' },
  { feature: 'Lead capture control',    free: '—',     starter: '✓',     pro: '✓',     agency: '✓',      enterprise: '✓' },
  { feature: 'Strict mode',             free: '—',     starter: '✓',     pro: '✓',     agency: '✓',      enterprise: '✓' },
  { feature: 'Conversation search',     free: '—',     starter: '—',     pro: '✓',     agency: '✓',      enterprise: '✓' },
  { feature: 'Weekly email digest',     free: '—',     starter: '—',     pro: '✓',     agency: '✓',      enterprise: '✓' },
  { feature: 'AI model selection',      free: 'Flash only', starter: 'Budget', pro: 'Mid-range', agency: 'All tiers', enterprise: 'All tiers' },
  { feature: 'White-label branding',    free: '—',     starter: '—',     pro: '—',     agency: '✓',      enterprise: '✓' },
  { feature: 'Sub-tenant management',   free: '—',     starter: '—',     pro: '—',     agency: 'Phase 3', enterprise: 'Phase 3' },
  { feature: 'Support',                 free: 'Community', starter: 'Email', pro: 'Priority email', agency: 'Dedicated', enterprise: 'Dedicated + SLA' },
]

const PLANS = ['free', 'starter', 'pro', 'agency', 'enterprise'] as const
type Plan = (typeof PLANS)[number]

function PlanCard({ plan }: { plan: Plan }) {
  const isPaid = plan !== 'free' && plan !== 'enterprise'
  const isEnterprise = plan === 'enterprise'
  const pkrPrice = isPaid ? PLAN_PRICES_PKR[plan as keyof typeof PLAN_PRICES_PKR] : null

  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6 flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[var(--ink)] capitalize">{plan}</span>
          {isPaid && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7]">
              Launch Price
            </span>
          )}
        </div>
        {isEnterprise ? (
          <div className="text-2xl font-bold text-[var(--ink)]">Custom</div>
        ) : (
          <div>
            <span className="text-2xl font-bold text-[var(--ink)]">
              {isPaid ? `₨${pkrPrice!.toLocaleString()}` : '₨0'}
            </span>
            <span className="text-xs text-[var(--ink-subtle)] ml-1">/mo</span>
            <span className="text-xs text-[var(--ink-subtle)] ml-2">or {USD_PRICES[plan]}/mo</span>
          </div>
        )}
      </div>

      <ul className="space-y-1.5 flex-1">
        {PLAN_FEATURES[plan].map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--ink-muted)]">
            <span className="text-[#0EA5E9] mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 mt-auto pt-2">
        {plan === 'free' && (
          <a
            href="/dashboard"
            className="block text-center py-2.5 text-sm font-semibold rounded-xl bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors"
          >
            Start free
          </a>
        )}
        {isPaid && (
          <>
            <a
              href={`/api/billing/payfast-plan-url?plan=${plan}`}
              className="block text-center py-2.5 text-sm font-semibold rounded-xl bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors"
            >
              Pay with PayFast (PKR)
            </a>
            <a
              href={`/api/billing/ls-plan-url?plan=${plan}`}
              className="block text-center py-2 text-xs font-medium rounded-xl border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] transition-colors"
            >
              Pay with card (USD)
            </a>
          </>
        )}
        {isEnterprise && (
          <a
            href="mailto:hello@owflex.com?subject=Enterprise plan inquiry"
            className="block text-center py-2.5 text-sm font-medium rounded-xl border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] transition-colors"
          >
            Contact us
          </a>
        )}
      </div>
    </div>
  )
}

export default function PricingGrid() {
  return (
    <div className="marketing min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-[var(--bg)]/90 backdrop-blur border-b border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="text-base font-semibold text-[var(--ink)]">OwFlex</a>
          <a
            href="/dashboard"
            className="text-sm font-medium px-4 py-1.5 rounded-lg bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors"
          >
            Start free
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ink)]">Simple, transparent pricing</h1>
          <p className="mt-3 text-[var(--ink-muted)]">
            Developer plans — build chatbot portals for your clients.
          </p>
          <p className="mt-1 text-xs text-[var(--ink-subtle)]">
            Pay 10 months, get 12. Annual plans coming soon.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {PLANS.map((plan) => (
            <PlanCard key={plan} plan={plan} />
          ))}
        </div>

        {/* Feature comparison table */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Full feature comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--hairline)]">
                  <th className="text-left py-2.5 pr-4 font-medium text-[var(--ink-muted)] w-40">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p} className="text-center py-2.5 px-2 font-semibold text-[var(--ink)] capitalize min-w-[80px]">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(({ feature, ...cells }, i) => (
                  <tr
                    key={feature}
                    className={`border-b border-[var(--hairline-soft)] ${i % 2 === 0 ? '' : 'bg-[var(--surface-2)]/40'}`}
                  >
                    <td className="py-2.5 pr-4 text-[var(--ink-muted)]">{feature}</td>
                    {PLANS.map((p) => (
                      <td key={p} className="text-center py-2.5 px-2 text-[var(--ink-subtle)]">
                        {cells[p]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[var(--ink-muted)] mb-4">All plans include free onboarding support.</p>
          <a
            href="/dashboard"
            className="inline-block text-sm font-semibold px-6 py-3 rounded-xl bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors shadow-sm"
          >
            Start on the free plan →
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--hairline)] py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-subtle)]">
          <span>© {new Date().getFullYear()} OwFlex. All rights reserved.</span>
          <a href="mailto:hello@owflex.com" className="hover:text-[var(--ink)] transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  )
}
