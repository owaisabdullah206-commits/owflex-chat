import { ExternalLink } from 'lucide-react'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
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

export function ConversationTable({ conversations }: ConversationTableProps) {
  if (conversations.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)] py-4">
        No conversations yet. They'll appear here once visitors start chatting via the embed.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Page URL</TableHead>
          <TableHead>Messages</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conversations.map((conv) => (
          <TableRow key={conv.id}>
            <TableCell>
              <RelativeTime date={conv.startedAt} className="text-sm text-[var(--ink)]" />
            </TableCell>
            <TableCell>
              {conv.pageUrl ? (
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="h-3 w-3 text-[var(--ink-subtle)] shrink-0" />
                  <span className="text-sm text-[var(--ink-muted)] truncate max-w-xs">
                    {truncate(conv.pageUrl, 40)}
                  </span>
                </div>
              ) : (
                <span className="text-[var(--ink-subtle)] text-sm">—</span>
              )}
            </TableCell>
            <TableCell>
              <span
                className="text-sm text-[var(--ink)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {conv.messageCount}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
