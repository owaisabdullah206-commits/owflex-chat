// Lead pipeline stages. Shared by the dashboard, the client portal, the status
// API routes (Zod enum), and the CSV exports. Keep this list in sync with the
// `leads.status` column default in lib/db/schema.ts.

export const LEAD_STATUSES = ['new', 'contacted', 'won', 'lost'] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new:       'New',
  contacted: 'Contacted',
  won:       'Won',
  lost:      'Lost',
}

// Surface-agnostic semantic colours (read on both the dark dashboard and the
// light portal). Sky for "new" stays in the brand family; emerald/amber/rose
// are state colours, not accents, so they don't break the Sky-Teal rule.
export const LEAD_STATUS_CLASS: Record<LeadStatus, string> = {
  new:       'text-sky-500 bg-sky-500/10 border-sky-500/30',
  contacted: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  won:       'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  lost:      'text-rose-500 bg-rose-500/10 border-rose-500/30',
}

export const LEAD_STATUS_DOT: Record<LeadStatus, string> = {
  new:       'bg-sky-500',
  contacted: 'bg-amber-500',
  won:       'bg-emerald-500',
  lost:      'bg-rose-500',
}

// Normalises any stored value to a known status (defends against legacy/null rows).
export function toLeadStatus(value: string | null | undefined): LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value ?? '')
    ? (value as LeadStatus)
    : 'new'
}
