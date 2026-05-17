import { PLAN_LIMITS } from '@/lib/limits'

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
    <div className={`rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 flex flex-col gap-1.5${wide ? ' col-span-2' : ''}`}>
      <p className="text-xs text-[var(--ink-muted)]">{label}</p>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-xl font-bold text-[var(--ink)] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {!isUnlimited && limitValue !== undefined && (
          <span className="text-xs text-[var(--ink-muted)]">
            / {(limitValue as number).toLocaleString()}{suffix ? ` ${suffix}` : ''}
          </span>
        )}
        {isUnlimited && (
          <span className="text-xs text-[var(--ink-subtle)]">∞{suffix ? ` ${suffix}` : ''}</span>
        )}
      </div>
      {note && <p className="text-[10px] text-[var(--ink-subtle)]">{note}</p>}
      {hasBar && (
        <div className="h-1 rounded-full bg-[var(--surface-2)] overflow-hidden mt-0.5">
          <div
            className={`h-full rounded-full transition-all ${isNear ? 'bg-amber-500' : 'bg-[var(--of-primary)]'}`}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Plan &amp; Usage</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--ink-muted)] capitalize">
          {plan}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Credits — 2 cols wide */}
        <MetricCard
          label={isFree ? 'Credits (resets monthly)' : 'Credits remaining'}
          value={balance}
          limitValue={isFree ? freeTierCredits : undefined}
          suffix="tokens"
          wide
        />
        <MetricCard label="Bots" value={botCount} limitValue={limits.bots} />
        <MetricCard label="Clients" value={clientCount} limitValue={Infinity} />
        <MetricCard label="Knowledge Docs" value={docCount} limitValue={limits.docs} />
        <MetricCard label="Conversations" value={conversationsThisMonth} limitValue={limits.conversations} note="this month" />
        <MetricCard label="Leads" value={leadsThisMonth} limitValue={limits.leads} note="this month" />
        {/* Storage — custom value/limit */}
        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 flex flex-col gap-1.5">
          <p className="text-xs text-[var(--ink-muted)]">Storage</p>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-xl font-bold text-[var(--ink)] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
              {storageDisplay}
            </span>
            <span className="text-xs text-[var(--ink-muted)]">/ {storageLimitDisplay}</span>
          </div>
          <div className="h-1 rounded-full bg-[var(--surface-2)] overflow-hidden mt-0.5">
            <div
              className={`h-full rounded-full transition-all ${(storageMb / limits.storageMb) >= 0.8 ? 'bg-amber-500' : 'bg-[var(--of-primary)]'}`}
              style={{ width: `${Math.min(100, (storageMb / limits.storageMb) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
