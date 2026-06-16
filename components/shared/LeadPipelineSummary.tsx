import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_DOT,
  toLeadStatus,
} from '@/lib/leads/status'

interface LeadPipelineSummaryProps {
  leads: { status: string | null }[]
  className?: string
}

/**
 * Compact counts-per-stage bar (New / Contacted / Won / Lost). Display-only and
 * surface-agnostic — rendered above the leads table in both the dashboard and
 * the client portal so the conversion picture is visible at a glance.
 */
export function LeadPipelineSummary({ leads, className = '' }: LeadPipelineSummaryProps) {
  if (leads.length === 0) return null

  const counts = LEAD_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<string, number>,
  )
  for (const lead of leads) counts[toLeadStatus(lead.status)]++

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      {LEAD_STATUSES.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${LEAD_STATUS_DOT[s]}`} />
          <span className="text-xs text-[var(--ink-muted)]">{LEAD_STATUS_LABEL[s]}</span>
          <span className="text-xs font-semibold text-[var(--ink)]">{counts[s]}</span>
        </div>
      ))}
    </div>
  )
}
