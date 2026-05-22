import { requirePlatformOwner } from '@/lib/auth/session'
import { listAllAuditLogs } from '@/lib/db/queries/audit'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function AdminAuditPage() {
  await requirePlatformOwner()

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const logs  = await listAllAuditLogs({ since, limit: 200 })

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>Admin</p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Audit Log</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            Last 30 days · {logs.length} entries
          </p>
        </div>

        <div className="px-8 py-6">
          {logs.length === 0 ? (
            <div className="text-center py-16 border border-[var(--hairline)] bg-[var(--surface)]">
              <p className="text-sm text-[var(--ink-muted)]">No audit events in the last 30 days.</p>
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
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
