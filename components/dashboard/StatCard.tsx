interface StatCardProps {
  label: string
  value: number | string
  delta?: number
  tone?: 'primary' | 'success' | 'default'
}

export function StatCard({ label, value, delta, tone }: StatCardProps) {
  const valueColor =
    tone === 'primary'
      ? 'text-[var(--of-primary)]'
      : tone === 'success'
      ? 'text-[var(--of-success)]'
      : 'text-[var(--ink)]'

  return (
    <div className="bg-[var(--surface)] px-5 py-[18px]">
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] mb-2"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
      <div
        className={`text-[32px] font-semibold leading-none ${valueColor}`}
        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
      >
        {value}
      </div>
      {delta !== undefined && (
        <div className="mt-2">
          <span
            className={`text-[11px] font-medium ${delta >= 0 ? 'text-[var(--of-success)]' : 'text-[var(--of-error)]'}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {delta >= 0 ? '▲ +' : '▼ '}
            {Math.abs(delta)}%
          </span>
        </div>
      )}
    </div>
  )
}
