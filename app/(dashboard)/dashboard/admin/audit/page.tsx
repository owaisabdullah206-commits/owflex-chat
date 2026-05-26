import Link from 'next/link'
import { requirePlatformOwner } from '@/lib/auth/session'
import { listAllAuditLogs } from '@/lib/db/queries/audit'
import { getModelLatencyStats } from '@/lib/db/queries/admin'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ClientDate } from '@/components/shared/ClientDate'

function latencyBadge(ms: number): string {
  if (ms < 1000) return 'text-[var(--success-text)]'
  if (ms < 3000) return 'text-[var(--ink)]'
  if (ms < 6000) return 'text-amber-400'
  return 'text-[var(--error-text)]'
}

function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

export default async function AdminAuditPage() {
  await requirePlatformOwner()

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [logs, latency] = await Promise.all([
    listAllAuditLogs({ since, limit: 200 }),
    getModelLatencyStats(),
  ])

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>Admin</p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Audit Log</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            Last 30 days · {logs.length} events
          </p>
        </div>

        <div className="px-8 py-6 space-y-8">

          {/* ── Model Response Times ────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              Model Response Times · last 30 days
            </p>

            {latency.length === 0 ? (
              <div className="border border-[var(--hairline)] bg-[var(--surface)] px-5 py-8 text-center">
                <p className="text-xs text-[var(--ink-muted)]">No latency data yet — send a few chat messages first.</p>
              </div>
            ) : (
              <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
                <div className="h-[2px] bg-[var(--of-primary)] w-full" />
                {/* Header */}
                <div
                  className="grid px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--hairline)]"
                  style={{ gridTemplateColumns: '2fr 80px 100px 100px 100px 90px 90px' }}
                >
                  {['model', 'msgs', 'avg', 'p50', 'p95', 'min', 'max'].map((h) => (
                    <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {h}
                    </span>
                  ))}
                </div>
                {latency.map((row) => (
                  <div
                    key={row.model}
                    className="grid px-4 py-2.5 border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface-2)] transition-colors items-center"
                    style={{ gridTemplateColumns: '2fr 80px 100px 100px 100px 90px 90px' }}
                  >
                    <Link
                      href={`/dashboard/admin/audit/model?m=${encodeURIComponent(row.model)}`}
                      className="text-[11px] text-[var(--of-primary)] hover:underline truncate"
                      style={{ fontFamily: 'var(--font-mono)' }}
                      title="View per-message breakdown"
                    >
                      {row.model}
                    </Link>
                    <span className="text-[11px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.message_count.toLocaleString()}
                    </span>
                    <span className={`text-[12px] font-semibold ${latencyBadge(row.avg_ms)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {fmtMs(row.avg_ms)}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {fmtMs(row.p50_ms)}
                    </span>
                    <span className={`text-[11px] ${latencyBadge(row.p95_ms)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {fmtMs(row.p95_ms)}
                    </span>
                    <span className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {fmtMs(row.min_ms)}
                    </span>
                    <span className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {fmtMs(row.max_ms)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Audit Events ───────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              Account Events · {logs.length} entries
            </p>

            {logs.length === 0 ? (
              <div className="border border-[var(--hairline)] bg-[var(--surface)] px-5 py-8 text-center">
                <p className="text-sm text-[var(--ink-muted)]">No audit events in the last 30 days.</p>
                <p className="text-xs text-[var(--ink-subtle)] mt-1">Events appear when bots are created/updated, documents uploaded, clients invited, etc.</p>
              </div>
            ) : (
              <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
                {/* Header */}
                <div
                  className="grid px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--hairline)]"
                  style={{ gridTemplateColumns: '1fr 120px 100px 100px 140px' }}
                >
                  {['action', 'entity', 'org', 'user', 'time'].map((h) => (
                    <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="grid px-4 py-2.5 border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface-2)] transition-colors"
                    style={{ gridTemplateColumns: '1fr 120px 100px 100px 140px' }}
                  >
                    <span
                      className="text-[12px] text-[var(--ink)] truncate"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {log.action}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] truncate" style={{ fontFamily: 'var(--font-mono)' }}>
                      {log.entityType}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] truncate" style={{ fontFamily: 'var(--font-mono)' }}>
                      {log.orgName ?? '—'}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] truncate" style={{ fontFamily: 'var(--font-mono)' }}>
                      {log.userEmail?.split('@')[0] ?? '—'}
                    </span>
                    <span className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      <ClientDate iso={log.createdAt} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}
