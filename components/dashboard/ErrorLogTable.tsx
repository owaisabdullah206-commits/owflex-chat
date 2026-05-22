'use client'

import { useState } from 'react'
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react'

interface ErrorRow {
  t: string
  embedKey: string
  err: string
  botName?: string
  orgName?: string
  botId?: string
}

const tdCls = 'px-4 py-2.5 text-[12px] border-b border-[var(--hairline)] align-top'

export function ErrorLogTable({ rows }: { rows: ErrorRow[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [copied, setCopied] = useState<number | null>(null)

  function toggle(i: number) {
    setExpanded(p => ({ ...p, [i]: !p[i] }))
  }

  function copy(i: number, row: ErrorRow) {
    const text = [
      `Time:      ${row.t ? new Date(row.t).toLocaleString() : '—'}`,
      `Embed Key: ${row.embedKey || '—'}`,
      `Bot:       ${row.botName || '—'}`,
      `Org:       ${row.orgName || '—'}`,
      `Error:     ${row.err}`,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)] whitespace-nowrap">Time</th>
          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)]">Bot / Org</th>
          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)]">Embed Key</th>
          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)]">Error</th>
          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)] w-16">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-[var(--surface-2)] transition-colors">
            {/* Time */}
            <td className={`${tdCls} text-[var(--ink-subtle)] whitespace-nowrap`} style={{ fontFamily: 'var(--font-mono)' }}>
              {row.t ? new Date(row.t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
            </td>

            {/* Bot / Org */}
            <td className={tdCls}>
              {row.botName ? (
                <div className="space-y-0.5">
                  <p className="text-[12px] font-medium text-[var(--ink)]">{row.botName}</p>
                  <p className="text-[11px] text-[var(--ink-subtle)]">{row.orgName ?? '—'}</p>
                </div>
              ) : (
                <span className="text-[var(--ink-subtle)]">—</span>
              )}
            </td>

            {/* Embed Key */}
            <td className={`${tdCls} text-[var(--ink-muted)] max-w-[160px]`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span className="truncate block">{row.embedKey || '—'}</span>
            </td>

            {/* Error — collapsed one line, expands to full pre */}
            <td className={`${tdCls} max-w-[380px]`}>
              {expanded[i] ? (
                <pre className="text-[11px] text-[#EF4444] whitespace-pre-wrap break-all leading-relaxed"
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  {row.err}
                </pre>
              ) : (
                <span className="text-[11px] text-[#EF4444] truncate block"
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  {row.err}
                </span>
              )}
            </td>

            {/* Actions */}
            <td className={`${tdCls} whitespace-nowrap`}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggle(i)}
                  title={expanded[i] ? 'Collapse' : 'Expand full error'}
                  className="p-1 rounded text-[var(--ink-subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  {expanded[i] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                <button
                  onClick={() => copy(i, row)}
                  title="Copy details"
                  className="p-1 rounded text-[var(--ink-subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  {copied === i ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
