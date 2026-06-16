import { MessageSquare } from 'lucide-react'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { formatPhone } from '@/lib/utils/phone'
import { LeadStatusSelect } from '@/components/shared/LeadStatusSelect'
import { toLeadStatus } from '@/lib/leads/status'

interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  capturedAt: Date
  conversationId: string | null
  status: string | null
}

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {lead.name && (
            <p className="font-semibold text-sm text-[var(--ink)] truncate">{lead.name}</p>
          )}
          {lead.email && (
            <p className="text-sm text-[var(--ink-muted)] truncate mt-0.5">{lead.email}</p>
          )}
          {lead.phone && (
            <p className="text-sm text-[var(--ink-muted)] mt-0.5">{formatPhone(lead.phone)}</p>
          )}
          {lead.notes && (
            <p className="text-xs text-[var(--ink-subtle)] mt-1 line-clamp-2">{lead.notes}</p>
          )}
        </div>
        <RelativeTime date={lead.capturedAt} className="text-[10px] text-[var(--ink-subtle)] shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        <LeadStatusSelect leadId={lead.id} status={toLeadStatus(lead.status)} apiBase="/api/portal/leads" />
        {lead.conversationId && (
          <a
            href={`/portal/conversations/${lead.conversationId}`}
            className="inline-flex items-center gap-1 text-xs text-[var(--of-primary-text-light)] hover:underline min-h-[44px] sm:min-h-0"
          >
            <MessageSquare className="h-3 w-3" />
            View chat
          </a>
        )}
      </div>
    </div>
  )
}
