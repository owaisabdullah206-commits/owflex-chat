'use client'

import { useState } from 'react'
import { Check, X, Minus, Zap } from 'lucide-react'
import { PLAN_PRICES_PKR } from '@/lib/billing/payfast'

// ─── Data ────────────────────────────────────────────────────────────────────

const USD_PRICES: Record<string, number | null> = {
  free:       0,
  starter:    15,
  pro:        29,
  agency:     79,
  enterprise: null,
}

type CellValue = boolean | string

interface CompRow {
  group?: string
  feature: string
  free: CellValue
  starter: CellValue
  pro: CellValue
  agency: CellValue
  enterprise: CellValue
}

const COMPARISON_ROWS: CompRow[] = [
  // Core limits
  { group: 'Core limits', feature: 'Bots',               free: '1',         starter: '2',         pro: '8',          agency: 'Unlimited',   enterprise: 'Unlimited' },
  {                        feature: 'Conversations/mo',   free: '200',       starter: '3,000',     pro: '15,000',     agency: '75,000',      enterprise: 'Custom' },
  {                        feature: 'Leads/mo',            free: '15',        starter: 'Unlimited', pro: 'Unlimited',  agency: 'Unlimited',   enterprise: 'Unlimited' },
  {                        feature: 'Document storage',    free: false,       starter: '25 MB',     pro: '100 MB',     agency: '500 MB',      enterprise: 'Custom' },
  {                        feature: 'Conversation history',free: '7 days',    starter: '30 days',   pro: 'Unlimited',  agency: 'Unlimited',   enterprise: 'Unlimited' },
  // Features
  { group: 'Features',     feature: 'Widget customization',free: 'Color only',starter: true,        pro: true,         agency: true,          enterprise: true },
  {                        feature: 'Lead capture control', free: false,      starter: true,        pro: true,         agency: true,          enterprise: true },
  {                        feature: 'Strict mode',          free: false,      starter: true,        pro: true,         agency: true,          enterprise: true },
  {                        feature: 'Conversation search',  free: false,      starter: false,       pro: true,         agency: true,          enterprise: true },
  {                        feature: 'Weekly email digest',  free: false,      starter: false,       pro: true,         agency: true,          enterprise: true },
  {                        feature: 'AI model selection',   free: 'Flash only',starter: 'Budget',   pro: 'Mid-range',  agency: 'All tiers',   enterprise: 'All tiers' },
  {                        feature: 'Credit top-ups',       free: false,      starter: true,        pro: true,         agency: 'Better rate', enterprise: 'Best rate' },
  // Advanced
  { group: 'Advanced',     feature: '"Powered by OwFlex"', free: 'Forced on', starter: 'Can remove',pro: 'Can remove', agency: 'Custom or off',enterprise: 'Custom or off' },
  {                        feature: 'White-label branding', free: false,      starter: false,       pro: false,        agency: true,          enterprise: true },
  {                        feature: 'Sub-tenant management',free: false,      starter: false,       pro: false,        agency: 'Phase 3',     enterprise: 'Phase 3' },
  {                        feature: 'API access',           free: false,      starter: false,       pro: false,        agency: 'Phase 4',     enterprise: 'Phase 4' },
  {                        feature: 'Support',              free: 'Community', starter: 'Email',    pro: 'Priority',   agency: 'Dedicated',   enterprise: 'Dedicated + SLA' },
]

const PLANS = ['free', 'starter', 'pro', 'agency', 'enterprise'] as const
type Plan = (typeof PLANS)[number]

const PLAN_HIGHLIGHTS: Record<Plan, string[]> = {
  free:       ['1 bot', '200 conversations/mo', '15 leads/mo'],
  starter:    ['2 bots', '3,000 conversations/mo', 'Full widget customization'],
  pro:        ['8 bots', '15,000 conversations/mo', 'Digest + conversation search'],
  agency:     ['Unlimited bots', '75,000 conversations/mo', 'White-label widget branding'],
  enterprise: ['Unlimited everything', 'Custom credit rates', 'Dedicated support + SLA'],
}

// ─── Cell component ───────────────────────────────────────────────────────────

function Cell({ value, featured }: { value: CellValue; featured?: boolean }) {
  const mutedCls = featured ? 'text-white/40' : 'text-[var(--ink-subtle)] opacity-30'
  const textCls  = featured ? 'text-white/70' : 'text-[var(--ink-muted)]'

  if (value === true)  return <Check className={`h-4 w-4 mx-auto ${featured ? 'text-[var(--of-primary)]' : 'text-[var(--of-success)]'}`} />
  if (value === false) return <X     className={`h-4 w-4 mx-auto ${mutedCls}`} />
  return <span className={`text-[11px] text-center block ${textCls}`}>{value}</span>
}

// ─── PKR / USD toggle ─────────────────────────────────────────────────────────

function CurrencyToggle({ currency, onChange }: { currency: 'pkr' | 'usd'; onChange: (c: 'pkr' | 'usd') => void }) {
  return (
    <div className="inline-flex rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-0.5 text-xs font-medium">
      {(['pkr', 'usd'] as const).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-full transition-colors ${
            currency === c
              ? 'bg-[var(--ink)] text-white'
              : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
          }`}
        >
          {c === 'pkr' ? 'PKR ₨' : 'USD $'}
        </button>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PricingGrid() {
  const [currency, setCurrency] = useState<'pkr' | 'usd'>('pkr')

  function price(plan: Plan): string {
    if (plan === 'enterprise') return 'Custom'
    if (plan === 'free') return currency === 'pkr' ? '₨0' : '$0'
    if (currency === 'pkr') return `₨${PLAN_PRICES_PKR[plan as keyof typeof PLAN_PRICES_PKR].toLocaleString()}`
    return `$${USD_PRICES[plan]}`
  }

  // Group comparison rows so we can render section headers
  const groups: { header: string | null; rows: CompRow[] }[] = []
  let currentGroup: { header: string | null; rows: CompRow[] } = { header: null, rows: [] }
  for (const row of COMPARISON_ROWS) {
    if (row.group && row.group !== currentGroup.header) {
      if (currentGroup.rows.length > 0) groups.push(currentGroup)
      currentGroup = { header: row.group, rows: [row] }
    } else {
      currentGroup.rows.push(row)
    }
  }
  if (currentGroup.rows.length > 0) groups.push(currentGroup)

  return (
    <div className="marketing min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-[var(--bg)]/90 backdrop-blur-sm border-b border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--of-primary)] shrink-0" />
            <span className="text-sm font-semibold text-[var(--ink)] tracking-tight">owflex</span>
          </a>
          <a
            href="/dashboard/signup"
            className="text-xs font-semibold px-4 py-2 bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
          >
            Start free
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--of-primary)] mb-3">
            Developer plans
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight leading-tight">
            Build chatbot portals<br className="hidden sm:block" /> for your clients.
          </h1>
          <p className="mt-4 text-base text-[var(--ink-muted)] max-w-xl mx-auto">
            Pay in PKR or USD. Cancel any time. All plans include the embed widget and client portal.
          </p>
          <div className="mt-6 flex justify-center">
            <CurrencyToggle currency={currency} onChange={setCurrency} />
          </div>
        </div>

        {/* ── Bento pricing grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-20">

          {/* FREE — col-span-1, smallest */}
          <div className="md:col-span-1 order-4 md:order-none border border-[var(--hairline)] bg-[var(--surface)] p-5 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-2">Free</p>
              <p className="text-3xl font-bold text-[var(--ink)] tracking-tight">₨0</p>
              <p className="text-xs text-[var(--ink-subtle)] mt-1">forever</p>
            </div>
            <ul className="space-y-2 flex-1">
              {PLAN_HIGHLIGHTS.free.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                  <Check className="h-3.5 w-3.5 text-[var(--of-success)] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/dashboard/signup"
              className="block text-center py-2 text-[11px] font-semibold border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
            >
              Get started
            </a>
          </div>

          {/* STARTER — col-span-2 */}
          <div className="md:col-span-2 order-3 md:order-none border border-[var(--hairline)] bg-[var(--surface)] p-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">Starter</p>
                <span className="text-[9px] font-medium px-2 py-0.5 bg-[var(--of-primary-soft)] text-[var(--of-primary-text-light)]">
                  Launch Price
                </span>
              </div>
              <p className="text-4xl font-bold text-[var(--ink)] tracking-tight">{price('starter')}</p>
              <p className="text-xs text-[var(--ink-subtle)] mt-1">per month</p>
            </div>
            <ul className="space-y-2 flex-1">
              {PLAN_HIGHLIGHTS.starter.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-[var(--ink-muted)]">
                  <Check className="h-3.5 w-3.5 text-[var(--of-success)] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 mt-auto">
              <a
                href="/api/billing/payfast-plan-url?plan=starter"
                className="block text-center py-2 text-[11px] font-semibold bg-[var(--ink)] text-white hover:opacity-80 transition-opacity"
              >
                {currency === 'pkr' ? 'Pay with PayFast (PKR)' : 'Pay via PayFast'}
              </a>
              <a
                href="/api/billing/ls-plan-url?plan=starter"
                className="block text-center py-2 text-[11px] font-medium border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] transition-colors"
              >
                Pay with card (USD)
              </a>
            </div>
          </div>

          {/* PRO — col-span-3, FEATURED dark card */}
          <div className="md:col-span-3 order-first md:order-none bg-[var(--ink)] p-7 flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">Pro</p>
                <span className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 bg-[var(--of-primary)] text-white">
                  <Zap className="h-2.5 w-2.5" />
                  Most Popular
                </span>
              </div>
              <p className="text-5xl font-bold text-white tracking-tight">{price('pro')}</p>
              <p className="text-xs text-white/40 mt-1.5">per month · launch pricing</p>
            </div>
            <ul className="space-y-2.5 flex-1">
              {PLAN_HIGHLIGHTS.pro.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check className="h-4 w-4 text-[var(--of-primary)] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 mt-auto">
              <a
                href="/api/billing/payfast-plan-url?plan=pro"
                className="block text-center py-2.5 text-xs font-semibold bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
              >
                {currency === 'pkr' ? 'Pay with PayFast (PKR)' : 'Upgrade to Pro'}
              </a>
              <a
                href="/api/billing/ls-plan-url?plan=pro"
                className="block text-center py-2 text-[11px] font-medium border border-white/20 text-white/60 hover:border-white/40 hover:text-white/80 transition-colors"
              >
                Pay with card (USD)
              </a>
            </div>
          </div>

          {/* AGENCY — col-span-4, horizontal layout with top accent */}
          <div className="md:col-span-4 order-5 md:order-none border-t-2 border-[var(--of-primary)] border-x border-b border-[var(--hairline)] bg-[var(--surface)] p-6 flex flex-col md:flex-row gap-6">
            {/* Price block */}
            <div className="shrink-0 flex flex-col gap-3 md:w-48">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">Agency</p>
                  <span className="text-[9px] font-medium px-2 py-0.5 bg-[var(--of-primary-soft)] text-[var(--of-primary-text-light)]">
                    Launch Price
                  </span>
                </div>
                <p className="text-4xl font-bold text-[var(--ink)] tracking-tight">{price('agency')}</p>
                <p className="text-xs text-[var(--ink-subtle)] mt-1">per month</p>
              </div>
              <div className="flex flex-col gap-1.5 mt-auto">
                <a
                  href="/api/billing/payfast-plan-url?plan=agency"
                  className="block text-center py-2 text-[11px] font-semibold bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
                >
                  {currency === 'pkr' ? 'PayFast (PKR)' : 'Upgrade'}
                </a>
                <a
                  href="/api/billing/ls-plan-url?plan=agency"
                  className="block text-center py-1.5 text-[10px] font-medium border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] transition-colors"
                >
                  Card (USD)
                </a>
              </div>
            </div>

            {/* Feature highlights grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 content-start">
              {PLAN_HIGHLIGHTS.agency.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--of-primary)] mt-0.5 shrink-0" />
                  <span className="text-xs text-[var(--ink-muted)]">{f}</span>
                </div>
              ))}
              {[
                'White-label widget branding',
                'Better credit top-up rates',
                'Sub-tenant management (Phase 3)',
                'Custom client portal subdomain (Phase 3)',
                'API + webhook integrations (Phase 4)',
                'Dedicated support',
              ].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--of-primary)] mt-0.5 shrink-0" />
                  <span className="text-xs text-[var(--ink-muted)]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ENTERPRISE — col-span-2, minimal */}
          <div className="md:col-span-2 order-6 md:order-none border border-[var(--hairline)] bg-[var(--surface-2)] p-6 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-2">Enterprise</p>
              <p className="text-4xl font-bold text-[var(--ink)] tracking-tight">Custom</p>
              <p className="text-xs text-[var(--ink-subtle)] mt-1">tailored pricing</p>
            </div>
            <ul className="space-y-2 flex-1">
              {PLAN_HIGHLIGHTS.enterprise.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--ink-muted)]">
                  <Check className="h-3.5 w-3.5 text-[var(--of-success)] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@owflex.com?subject=Enterprise plan inquiry"
              className="block text-center py-2 text-[11px] font-medium border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors mt-auto"
            >
              Contact us
            </a>
          </div>
        </div>

        {/* ── Comparison table ─────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-[var(--ink)] mb-1 tracking-tight">Full feature comparison</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-6">Every feature, every plan, side by side.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              {/* Sticky column headers */}
              <thead>
                <tr className="sticky top-[56px] z-10 bg-[var(--bg)] border-b-2 border-[var(--hairline)]">
                  <th className="text-left py-3 pr-4 font-medium text-[var(--ink-muted)] w-44 text-xs">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p} className="text-center py-3 px-2 min-w-[90px]">
                      <span className={`text-xs font-semibold capitalize ${p === 'pro' ? 'text-[var(--of-primary)]' : 'text-[var(--ink)]'}`}>
                        {p}
                      </span>
                      {p !== 'free' && p !== 'enterprise' && (
                        <span className="block text-[10px] font-normal text-[var(--ink-subtle)] mt-0.5">
                          {price(p as Plan)}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map(({ header, rows }) => (
                  <>
                    {header && (
                      <tr key={`group-${header}`}>
                        <td
                          colSpan={6}
                          className="pt-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
                        >
                          {header}
                        </td>
                      </tr>
                    )}
                    {rows.map(({ feature, ...cells }, i) => (
                      <tr
                        key={feature}
                        className={`border-b border-[var(--hairline-soft)] ${i % 2 === 1 ? 'bg-[var(--surface-2)]/30' : ''}`}
                      >
                        <td className="py-2.5 pr-4 text-[11px] text-[var(--ink-muted)]">{feature}</td>
                        {PLANS.map((p) => (
                          <td key={p} className={`py-2.5 px-2 ${p === 'pro' ? 'bg-[var(--of-primary-soft)]/20' : ''}`}>
                            <Cell value={cells[p as Plan]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center border border-[var(--hairline)] bg-[var(--surface)] py-12 px-6">
          <h3 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Start free. Upgrade when you grow.</h3>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">No credit card required on the free plan. All plans include onboarding support.</p>
          <a
            href="/dashboard/signup"
            className="inline-block mt-6 text-sm font-semibold px-8 py-3 bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
          >
            Create your free account →
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--hairline)] py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--of-primary)]" />
            <span>© {new Date().getFullYear()} OwFlex</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-[var(--ink)] transition-colors">Home</a>
            <a href="mailto:hello@owflex.com" className="hover:text-[var(--ink)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
