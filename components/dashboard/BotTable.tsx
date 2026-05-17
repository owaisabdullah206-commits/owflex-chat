import Link from 'next/link'
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

const thClass = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)]'
const tdClass = 'px-4 py-3 text-sm border-b border-[var(--hairline)] last:border-b-0'

export function BotTable({ bots }: BotTableProps) {
  return (
    <div className="rounded-md border border-[var(--hairline)] overflow-hidden">
      <table className="w-full text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
        <thead>
          <tr>
            <th className={thClass}>bot_name</th>
            <th className={thClass}>client</th>
            <th className={thClass}>created_at</th>
            <th className={thClass}>status</th>
            <th className={thClass}>embed_key</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--surface)]">
          {bots.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-[var(--ink-muted)] text-xs">
                no bots yet
              </td>
            </tr>
          ) : (
            bots.map((bot) => (
              <tr key={bot.id} className="hover:bg-[var(--surface-2)] transition-colors">
                <td className={tdClass}>
                  <Link
                    href={`/dashboard/bots/${bot.id}`}
                    className="font-medium text-[var(--of-primary)] hover:underline underline-offset-2"
                  >
                    {bot.name}
                  </Link>
                </td>
                <td className={tdClass}>
                  {bot.clientEmail ? (
                    <span className="text-[var(--ink-muted)] truncate max-w-[180px] block text-[12px]">
                      {bot.clientEmail}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--ink-subtle)]">—</span>
                  )}
                </td>
                <td className={`${tdClass} text-[var(--ink-muted)] text-[12px]`}>
                  {formatDate(bot.createdAt)}
                </td>
                <td className={tdClass}>
                  <BotToggle botId={bot.id} initialActive={bot.isActive} />
                </td>
                <td className={tdClass}>
                  <span className="text-[11px] text-[var(--ink-subtle)]">
                    {bot.embedKey.slice(0, 16)}…
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
