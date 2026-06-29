import { PLAN_LIMITS } from '@/lib/limits'
import { PLAN_CREDIT_ALLOCATIONS } from '@/lib/credits'

interface PlanUsageProps {
  plan: string
  balance: number
  freeTierCredits: number
  botCount: number
  clientCount: number
  docCount: number
  conversationsThisMonth: number
  leadsThisMonth: number
  storageMb: number
}

function MetricCard({
  label,
  value,
  limitValue,
  suffix = '',
  note = '',
  wide = false,
}: {
  label: string
  value: string | number
  limitValue?: number | typeof Infinity
  suffix?: string
  note?: string
  wide?: boolean
}) {
  const isUnlimited = limitValue === Infinity || limitValue === undefined
  const numValue = typeof value === 'number' ? value : parseFloat(String(value))
  const hasBar = !isUnlimited && limitValue !== undefined && typeof numValue === 'number' && !isNaN(numValue)
  const pct = hasBar ? Math.min(100, (numValue / (limitValue as number)) * 100) : 0
  const isNear = hasBar && pct >= 80

  return (
    <div className={`bg-[var(--surface)] px-5 py-[18px] flex flex-col gap-1.5${wide ? ' col-span-2' : ''}`}>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span
          className="text-[32px] font-semibold leading-none text-[var(--ink)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {!isUnlimited && limitValue !== undefined && (
          <span className="text-[12px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
            / {(limitValue as number).toLocaleString()}{suffix ? ` ${suffix}` : ''}
          </span>
        )}
        {isUnlimited && (
          <span className="text-[12px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
            ∞{suffix ? ` ${suffix}` : ''}
          </span>
        )}
      </div>
      {note && (
        <p className="text-[10px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
          {note}
        </p>
      )}
      {hasBar && (
        <div className="h-[3px] rounded-full bg-[var(--surface-2)] overflow-hidden mt-1">
          <div
            className={`h-full transition-all ${isNear ? 'bg-[var(--of-warning)]' : 'bg-[var(--of-primary)]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function PlanUsage({
  plan,
  balance,
  freeTierCredits,
  botCount,
  clientCount,
  docCount,
  conversationsThisMonth,
  leadsThisMonth,
  storageMb,
}: PlanUsageProps) {
  const planKey = (plan in PLAN_LIMITS ? plan : 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[planKey]
  const isFree = plan === 'free'

  const storageDisplay =
    storageMb < 1
      ? `${(storageMb * 1024).toFixed(0)} KB`
      : `${storageMb.toFixed(1)} MB`
  const storageLimitDisplay =
    limits.storageMb >= 1024
      ? `${(limits.storageMb / 1024).toFixed(0)} GB`
      : `${limits.storageMb} MB`

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          plan_usage
        </p>
        <span
          className="text-[11px] px-2 py-0.5 border border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink-muted)] capitalize"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {plan}
        </span>
      </div>
      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[var(--hairline)] overflow-hidden border border-[var(--hairline)]">
        {/* Credits — shows consumed tokens, consistent with all other used/limit metrics */}
        <MetricCard
          label="credits.used"
          value={(PLAN_CREDIT_ALLOCATIONS[planKey] ?? PLAN_CREDIT_ALLOCATIONS.free) - balance}
          limitValue={PLAN_CREDIT_ALLOCATIONS[planKey] ?? PLAN_CREDIT_ALLOCATIONS.free}
          suffix="tokens"
          wide
        />
        <MetricCard label="agents" value={botCount} limitValue={limits.bots} />
        <MetricCard label="clients" value={clientCount} limitValue={Infinity} />
        <MetricCard label="docs" value={docCount} limitValue={limits.docs} />
        <MetricCard label="conversations" value={conversationsThisMonth} limitValue={limits.conversations} note="this month" />
        <MetricCard label="leads" value={leadsThisMonth} limitValue={limits.leads} note="this month" />
        {/* Storage — spans remaining 2 cols in last row */}
        <div className="col-span-2 bg-[var(--surface)] px-5 py-[18px] flex flex-col gap-1.5">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            storage
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className="text-[32px] font-semibold leading-none text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
            >
              {storageDisplay}
            </span>
            <span className="text-[12px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
              / {storageLimitDisplay}
            </span>
          </div>
          <div className="h-[3px] rounded-full bg-[var(--surface-2)] overflow-hidden mt-1">
            <div
              className={`h-full transition-all ${(storageMb / limits.storageMb) >= 0.8 ? 'bg-[var(--of-warning)]' : 'bg-[var(--of-primary)]'}`}
              style={{ width: `${Math.min(100, (storageMb / limits.storageMb) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
