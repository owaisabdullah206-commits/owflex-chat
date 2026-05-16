import Link from 'next/link'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { BotToggle } from '@/components/dashboard/BotToggle'

interface Bot {
  id: string
  name: string
  embedKey: string
  isActive: boolean
  createdAt: Date
  clientEmail: string | null
}

interface BotTableProps {
  bots: Bot[]
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date))
}

export function BotTable({ bots }: BotTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bot Name</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Embed Key</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bots.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-[var(--ink-muted)] py-8">
              No bots yet
            </TableCell>
          </TableRow>
        ) : (
          bots.map((bot) => (
            <TableRow key={bot.id}>
              <TableCell>
                <Link
                  href={`/dashboard/bots/${bot.id}`}
                  className="font-medium text-[var(--of-primary-text-dark)] hover:underline underline-offset-2"
                >
                  {bot.name}
                </Link>
              </TableCell>
              <TableCell>
                {bot.clientEmail ? (
                  <span className="text-sm text-[var(--ink-muted)] truncate max-w-[180px] block">
                    {bot.clientEmail}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--hairline)]">
                    No client
                  </span>
                )}
              </TableCell>
              <TableCell className="text-[var(--ink-muted)]">
                {formatDate(bot.createdAt)}
              </TableCell>
              <TableCell>
                <BotToggle botId={bot.id} initialActive={bot.isActive} />
              </TableCell>
              <TableCell>
                <span
                  className="text-xs text-[var(--ink-muted)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {bot.embedKey.slice(0, 12)}...
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
