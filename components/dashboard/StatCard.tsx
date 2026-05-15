import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number | string
  delta?: number
}

export function StatCard({ label, value, delta }: StatCardProps) {
  return (
    <Card className="bg-[var(--surface-2)] border-[var(--hairline)] px-5 py-4">
      <p
        className="text-2xl font-semibold text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-[var(--ink-muted)]">{label}</p>
        {delta !== undefined && (
          <span
            className={`text-xs font-medium ${
              delta >= 0 ? 'text-[var(--of-success)]' : 'text-[var(--of-error)]'
            }`}
          >
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
    </Card>
  )
}
