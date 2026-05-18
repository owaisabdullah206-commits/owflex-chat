interface Props {
  activeWarnings: string[]
}

const METRIC_LABELS: Record<string, string> = {
  conversations: 'conversations',
  credits:       'LLM credits',
  leads:         'leads',
}

export function UsageWarningBanner({ activeWarnings }: Props) {
  if (activeWarnings.length === 0) return null

  return (
    <div className="sticky top-0 z-20 bg-[#F59E0B]/10 border-b border-[#F59E0B]/30 px-4 sm:px-8 py-2.5 flex items-center gap-3">
      <span className="text-[#F59E0B] shrink-0">⚠</span>
      <p className="text-sm text-[var(--ink)]">
        You&apos;re approaching your{' '}
        {activeWarnings.map((m) => METRIC_LABELS[m] ?? m).join(', ')}{' '}
        limit{activeWarnings.length > 1 ? 's' : ''} this month.{' '}
        <a href="/dashboard/billing" className="font-semibold text-[var(--of-primary)] hover:underline">
          View billing →
        </a>
      </p>
    </div>
  )
}
