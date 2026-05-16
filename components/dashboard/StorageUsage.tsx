import { HardDrive } from 'lucide-react'

interface Props {
  usedMb: number
  maxMb: number
  plan: string
}

export function StorageUsage({ usedMb, maxMb, plan }: Props) {
  const isUnlimited = maxMb === Infinity || maxMb >= 10_240
  const pct = isUnlimited ? 0 : Math.min(100, (usedMb / maxMb) * 100)
  const isNearLimit = pct >= 80

  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="h-4 w-4 text-[var(--ink-muted)]" />
        <h2 className="text-sm font-semibold text-[var(--ink)]">Document Storage</h2>
        <span className="ml-auto text-xs text-[var(--ink-muted)] capitalize">{plan} plan</span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-mono font-semibold text-[var(--ink)]">
          {usedMb < 1 ? `${(usedMb * 1024).toFixed(0)} KB` : `${usedMb.toFixed(1)} MB`}
        </span>
        <span className="text-sm text-[var(--ink-muted)]">
          {isUnlimited ? 'unlimited' : `of ${maxMb >= 1024 ? `${(maxMb / 1024).toFixed(0)} GB` : `${maxMb} MB`}`}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <div className="h-1.5 rounded-full bg-[var(--hairline)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-amber-500' : 'bg-[var(--of-primary)]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {isNearLimit && (
            <p className="text-xs text-amber-500 mt-2">
              Storage is {pct.toFixed(0)}% full. Upgrade to avoid upload failures.
            </p>
          )}
        </>
      )}
    </div>
  )
}
