import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number | string
  description?: string
  delta?: number | null
}

export function StatCard({ label, value, description, delta }: StatCardProps) {
  return (
    <Card className="bg-[var(--surface)] border-[var(--hairline)] px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
      <p className="text-3xl font-bold text-[var(--ink)] mt-2 tracking-tight">{value}</p>
      {delta !== undefined && delta !== null && (
        <p className={`text-xs font-medium mt-1.5 ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last month
        </p>
      )}
      {description && (
        <p className="text-xs text-[var(--ink-muted)] mt-0.5">{description}</p>
      )}
    </Card>
  )
}
