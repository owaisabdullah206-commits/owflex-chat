import { ExternalLink, MessageSquare } from 'lucide-react'
import { RelativeTime } from '@/components/shared/RelativeTime'

interface Conversation {
  id: string
  pageUrl: string | null
  startedAt: Date
  messageCount: number
  hasLead?: boolean
  preview?: string | null
}

interface ConversationListProps {
  conversations: Conversation[]
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '…' : str
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="h-8 w-8 text-[var(--ink-subtle)] mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">No conversations yet</h3>
        <p className="text-sm text-[var(--ink-muted)]">
          Conversations will appear here once visitors start chatting.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] divide-y divide-[var(--hairline)]">
      {conversations.map((conv) => (
        <a
          key={conv.id}
          href={`/portal/conversations/${conv.id}`}
          className="flex items-center gap-4 px-4 py-3.5 min-h-[44px] hover:bg-[var(--bg)] transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <RelativeTime
                date={conv.startedAt}
                className="text-sm font-medium text-[var(--ink)]"
              />
              {conv.hasLead && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  Lead
                </span>
              )}
            </div>
            {conv.pageUrl && (
              <div className="flex items-center gap-1 mt-0.5">
                <ExternalLink className="h-3 w-3 text-[var(--ink-subtle)] shrink-0" />
                <span className="text-xs text-[var(--ink-muted)] truncate">
                  {truncate(conv.pageUrl, 40)}
                </span>
              </div>
            )}
            {conv.preview && (
              <p className="text-xs text-[var(--ink-subtle)] mt-0.5 line-clamp-1">{conv.preview}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-[var(--ink-muted)] bg-[var(--bg)] border border-[var(--hairline)] px-2 py-0.5 rounded-full">
              {conv.messageCount} msgs
            </span>
            <span className="text-[var(--ink-subtle)] text-sm">→</span>
          </div>
        </a>
      ))}
    </div>
  )
}
