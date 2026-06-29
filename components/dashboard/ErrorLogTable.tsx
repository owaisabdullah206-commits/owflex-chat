'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface ErrorRow {
  t: string
  embedKey: string
  err: string
  botName?: string
  orgName?: string
}

const thCls = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)]'
const tdCls = 'px-4 py-2.5 text-[12px] border-b border-[var(--hairline)]'

export function ErrorLogTable({ rows }: { rows: ErrorRow[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className={`${thCls} whitespace-nowrap`}>Time</th>
          <th className={thCls}>Agent / Org</th>
          <th className={thCls}>Error</th>
          <th className={`${thCls} w-16`}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-[var(--surface-2)] transition-colors">
            <td className={`${tdCls} text-[var(--ink-subtle)] whitespace-nowrap`} style={{ fontFamily: 'var(--font-mono)' }}>
              {row.t
                ? new Date(row.t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'}
            </td>

            <td className={tdCls}>
              {row.botName ? (
                <div className="space-y-0.5">
                  <p className="text-[12px] font-medium text-[var(--ink)]">{row.botName}</p>
                  <p className="text-[11px] text-[var(--ink-subtle)]">{row.orgName ?? '—'}</p>
                </div>
              ) : (
                <span className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {row.embedKey || '—'}
                </span>
              )}
            </td>

            <td className={`${tdCls} max-w-[400px]`}>
              <span className="text-[11px] text-[#EF4444] truncate block" style={{ fontFamily: 'var(--font-mono)' }}>
                {row.err}
              </span>
            </td>

            <td className={`${tdCls} whitespace-nowrap`}>
              <Link
                href={`/dashboard/admin/routing/errors/${i}`}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--of-primary)] hover:underline"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Details <ExternalLink size={11} />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
