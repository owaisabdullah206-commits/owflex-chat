import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { RelativeTime } from '@/components/shared/RelativeTime'

interface Conversation {
  id: string
  pageUrl: string | null
  startedAt: Date
  messageCount: number
}

interface ConversationTableProps {
  conversations: Conversation[]
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '…' : str
}

const thClass = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-3)] border-b border-[var(--hairline)]'
const tdClass = 'px-4 py-3 border-b border-[var(--hairline)] text-[13px] last:border-b-0'

export function ConversationTable({ conversations }: ConversationTableProps) {
  if (conversations.length === 0) {
    return (
      <div className="border border-[var(--hairline)] bg-[var(--surface)] px-4 py-10 text-center">
        <p className="text-sm text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
          no_sessions_yet
        </p>
        <p className="text-xs text-[var(--ink-subtle)] mt-1">Sessions appear once visitors start chatting via the embed.</p>
      </div>
    )
  }

  return (
    <div className="border border-[var(--hairline)] overflow-hidden">
      <table className="w-full text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
        <thead>
          <tr>
            <th className={thClass}>Started</th>
            <th className={thClass}>Page URL</th>
            <th className={thClass}>Messages</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface)]">
          {conversations.map((conv) => (
            <tr key={conv.id} className="odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors">
              <td className={`${tdClass} text-[var(--ink-muted)]`}>
                <RelativeTime date={conv.startedAt} />
              </td>
              <td className={tdClass}>
                {conv.pageUrl ? (
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3 text-[var(--ink-subtle)] shrink-0" />
                    <span className="text-[var(--ink-muted)] truncate max-w-xs">
                      {truncate(conv.pageUrl, 50)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[var(--ink-subtle)]">—</span>
                )}
              </td>
              <td className={`${tdClass} text-[var(--ink)]`}>
                {conv.messageCount}
              </td>
              <td className={tdClass}>
                <Link
                  href={`/dashboard/conversations/${conv.id}`}
                  className="text-xs text-[var(--of-primary)] hover:opacity-75 transition-opacity"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
