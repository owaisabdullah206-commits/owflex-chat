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

type LimitValue = number | typeof Infinity

function UsageRow({
  label,
  used,
  limit,
  suffix = '',
  invert = false,
}: {
  label: string
  used: number
  limit: LimitValue
  suffix?: string
  invert?: boolean
}) {
  const isUnlimited = limit === Infinity
  const pct = isUnlimited ? 0 : invert
    ? Math.min(100, ((limit - used) / limit) * 100)
    : Math.min(100, (used / (limit as number)) * 100)
  const fillPct = isUnlimited ? 0 : Math.min(100, (used / (limit as number)) * 100)
  const isNear = !isUnlimited && fillPct >= 80

  const usedLabel = used.toLocaleString()
  const limitLabel = isUnlimited ? 'Unlimited' : (limit as number).toLocaleString()

  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[var(--ink-muted)]">{label}</span>
        <span
          className="text-xs text-[var(--ink)] tabular-nums"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {isUnlimited ? (
            <span className="text-[var(--ink-subtle)]">Unlimited{suffix ? ` ${suffix}` : ''}</span>
          ) : (
            <>{usedLabel} / {limitLabel}{suffix ? ` ${suffix}` : ''}</>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isNear ? 'bg-amber-500' : 'bg-[var(--of-primary)]'}`}
            style={{ width: `${fillPct}%` }}
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

  const storageLabel =
    storageMb < 1
      ? `${(storageMb * 1024).toFixed(0)} KB`
      : `${storageMb.toFixed(1)} MB`
  const storageLimitLabel = limits.storageMb >= 1024
    ? `${(limits.storageMb / 1024).toFixed(0)} GB`
    : `${limits.storageMb} MB`

  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
      <div className="px-5 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Plan & Usage</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--ink-muted)] capitalize">
          {plan}
        </span>
      </div>

      {/* Credits */}
      <div className="px-5 py-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--ink-muted)]">Credits</span>
          <span className="text-xs text-[var(--ink)] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
            {isFree ? (
              <>{balance.toLocaleString()} / {freeTierCredits.toLocaleString()} tokens</>
            ) : (
              <>{balance.toLocaleString()} tokens remaining</>
            )}
          </span>
        </div>
        {isFree && (
          <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${balance / freeTierCredits < 0.2 ? 'bg-amber-500' : 'bg-[var(--of-primary)]'}`}
              style={{ width: `${Math.min(100, (balance / freeTierCredits) * 100)}%` }}
            />
          </div>
        )}
        {isFree && (
          <p className="text-[10px] text-[var(--ink-subtle)] mt-1">Resets monthly</p>
        )}
      </div>

      <UsageRow label="Bots" used={botCount} limit={limits.bots} />
      <UsageRow label="Clients" used={clientCount} limit={Infinity} />
      <UsageRow label="Knowledge docs" used={docCount} limit={limits.docs} />
      <UsageRow label="Conversations this month" used={conversationsThisMonth} limit={limits.conversations} />
      <UsageRow label="Leads this month" used={leadsThisMonth} limit={limits.leads} />

      {/* Storage — custom formatting */}
      <div className="px-5 py-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--ink-muted)]">Storage</span>
          <span className="text-xs text-[var(--ink)] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
            {storageLabel} / {storageLimitLabel}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${(storageMb / limits.storageMb) >= 0.8 ? 'bg-amber-500' : 'bg-[var(--of-primary)]'}`}
            style={{ width: `${Math.min(100, (storageMb / limits.storageMb) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
