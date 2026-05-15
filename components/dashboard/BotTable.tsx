import Link from 'next/link'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Bot {
  id: string
  name: string
  embedKey: string
  isActive: boolean
  createdAt: Date
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
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Embed Key</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bots.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-[var(--ink-muted)] py-8">
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
              <TableCell className="text-[var(--ink-muted)]">
                {formatDate(bot.createdAt)}
              </TableCell>
              <TableCell>
                <Badge variant={bot.isActive ? 'default' : 'secondary'}>
                  {bot.isActive ? 'Active' : 'Inactive'}
                </Badge>
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
