import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number | string
  description?: string
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <Card className="bg-[var(--surface)] border-[var(--hairline)] px-5 py-4">
      <p className="text-4xl font-bold text-[var(--ink)] tracking-tight">
        {value}
      </p>
      <p className="text-sm font-medium text-[var(--ink)] mt-1">{label}</p>
      {description && (
        <p className="text-xs text-[var(--ink-muted)] mt-0.5">{description}</p>
      )}
    </Card>
  )
}
