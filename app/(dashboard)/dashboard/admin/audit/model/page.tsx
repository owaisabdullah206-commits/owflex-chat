import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePlatformOwner } from '@/lib/auth/session'
import { getModelMessageLatency } from '@/lib/db/queries/admin'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ClientDate } from '@/components/shared/ClientDate'

// ── formatting helpers ────────────────────────────────────────────────────────

function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${ms}ms`
}

function fmtDelta(d: number | null): string {
  if (d == null) return '—'
  const prefix = d > 0 ? '+' : ''
  if (Math.abs(d) >= 1000) return `${prefix}${(d / 1000).toFixed(2)}s`
  return `${prefix}${d}ms`
}

function latencyColor(ms: number): string {
  if (ms <  800) return 'text-[var(--success-text)]'
  if (ms < 2000) return 'text-[var(--ink)]'
  if (ms < 5000) return 'text-amber-400'
  return 'text-[var(--error-text)]'
}

function deltaColor(d: number | null): string {
  if (d == null) return 'text-[var(--ink-subtle)]'
  if (d <= -200) return 'text-[var(--success-text)]'
  if (d >=  500) return 'text-[var(--error-text)]'
  if (d >=  200) return 'text-amber-400'
  return 'text-[var(--ink-muted)]'
}

// ── slowness analysis ─────────────────────────────────────────────────────────
// Returns a human-readable reason(s) why this response was slow.
// Thresholds are heuristic — adjust as you learn your model's baseline.

type SlownessReason = { label: string; color: string }

function analyseSlowness(row: {
  latency_ms:   number
  input_tokens: number
  output_tokens: number
  ms_per_token: number | null
}): SlownessReason[] {
  const reasons: SlownessReason[] = []

  // Fast overall — no explanation needed
  if (row.latency_ms < 1000) return [{ label: 'fast ✓', color: 'text-[var(--success-text)]' }]

  // Large prompt / context stuffing slows TTFT (time to first token)
  if (row.input_tokens > 3000) {
    reasons.push({ label: `large context (${row.input_tokens.toLocaleString()} in)`, color: 'text-amber-400' })
  } else if (row.input_tokens > 1500) {
    reasons.push({ label: `med context (${row.input_tokens.toLocaleString()} in)`, color: 'text-[var(--ink-muted)]' })
  }

  // Long output = more generation time
  if (row.output_tokens > 400) {
    reasons.push({ label: `long reply (${row.output_tokens} out)`, color: 'text-amber-400' })
  } else if (row.output_tokens > 150) {
    reasons.push({ label: `med reply (${row.output_tokens} out)`, color: 'text-[var(--ink-muted)]' })
  }

  // Generation speed (ms per output token) — high = slow decoding / overloaded GPU
  if (row.ms_per_token != null && row.ms_per_token > 30) {
    reasons.push({ label: `slow decoding (${row.ms_per_token}ms/tok)`, color: 'text-[var(--error-text)]' })
  } else if (row.ms_per_token != null && row.ms_per_token > 15) {
    reasons.push({ label: `${row.ms_per_token}ms/tok`, color: 'text-amber-400' })
  }

  // Very slow but no single dominant cause → network / cold-start
  if (reasons.length === 0 && row.latency_ms > 3000) {
    reasons.push({ label: 'cold start / network', color: 'text-[var(--error-text)]' })
  }
  if (reasons.length === 0 && row.latency_ms >= 1000) {
    reasons.push({ label: 'moderate', color: 'text-[var(--ink-muted)]' })
  }

  return reasons
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function ModelLatencyPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>
}) {
  await requirePlatformOwner()

  const { m: model } = await searchParams
  if (!model) notFound()

  const rows = await getModelMessageLatency(model, 30)

  // Summary from raw result
  const lats = rows.map((r) => r.latency_ms).slice().sort((a, b) => a - b)
  const avgMs = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0
  const p50Ms = lats.length ? lats[Math.floor(lats.length * 0.50)] : 0
  const p95Ms = lats.length ? lats[Math.floor(lats.length * 0.95)] : 0
  const slowCount = lats.filter((ms) => ms >= 5000).length

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <Link
            href="/dashboard/admin/audit"
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] hover:text-[var(--of-primary)] transition-colors mb-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ← Audit Log
          </Link>
          <h1 className="text-lg font-bold text-[var(--ink)] truncate">{model}</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            Per-message · last 30 days · {rows.length} messages
          </p>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* ── Summary strip ───────────────────────────────────────────── */}
          {rows.length > 0 && (
            <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
              <div className="h-[2px] bg-[var(--of-primary)] w-full" />
              <div className="grid grid-cols-4 gap-px bg-[var(--hairline)]">
                {[
                  { label: 'avg', value: fmtMs(avgMs), color: latencyColor(avgMs) },
                  { label: 'p50 median', value: fmtMs(p50Ms), color: latencyColor(p50Ms) },
                  { label: 'p95', value: fmtMs(p95Ms), color: latencyColor(p95Ms) },
                  {
                    label: 'slow (≥5s)',
                    value: slowCount.toString(),
                    color: slowCount > 0 ? 'text-[var(--error-text)]' : 'text-[var(--success-text)]',
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[var(--surface)] px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      {label}
                    </p>
                    <p className={`text-2xl font-bold leading-none ${color}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Per-message table ───────────────────────────────────────── */}
          {rows.length === 0 ? (
            <div className="border border-[var(--hairline)] bg-[var(--surface)] px-5 py-12 text-center">
              <p className="text-sm text-[var(--ink-muted)]">No messages recorded for this model in the last 30 days.</p>
              <p className="text-xs text-[var(--ink-subtle)] mt-1">Latency data begins from the moment this feature was deployed — send a chat message first.</p>
            </div>
          ) : (
            <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">

              {/* Column headers */}
              <div
                className="grid px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--hairline)]"
                style={{ gridTemplateColumns: '170px 100px 110px 75px 90px 90px 1fr' }}
              >
                {[
                  { key: 'time',    tip: 'Timestamp in your local timezone' },
                  { key: 'latency', tip: 'Wall-clock time from first token sent to last token received' },
                  { key: 'delta',   tip: 'Change in latency vs. the chronologically previous message for this model. + = slower, − = faster.' },
                  { key: 'tokens',  tip: 'Total tokens used (input + output)' },
                  { key: 'in tok',  tip: 'Input/prompt tokens — large values indicate heavy context (RAG, conversation history)' },
                  { key: 'out tok', tip: 'Output/completion tokens — proportional to response length' },
                  { key: 'why slow', tip: 'Heuristic analysis: what likely caused the latency' },
                ].map(({ key, tip }) => (
                  <span
                    key={key}
                    title={tip}
                    className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] cursor-help"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {key}
                  </span>
                ))}
              </div>

              {/* Data rows */}
              {rows.map((row, i) => {
                const reasons = analyseSlowness({
                  latency_ms:   row.latency_ms,
                  input_tokens: row.input_tokens,
                  output_tokens: row.output_tokens,
                  ms_per_token: row.ms_per_token,
                })
                const isLastRow = i === rows.length - 1

                return (
                  <div
                    key={row.id}
                    className="grid px-4 py-2 border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface-2)] transition-colors items-center"
                    style={{ gridTemplateColumns: '170px 100px 110px 75px 90px 90px 1fr' }}
                  >
                    {/* time */}
                    <span
                      className="text-[11px] text-[var(--ink-subtle)] tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <ClientDate iso={row.created_at} />
                    </span>

                    {/* latency */}
                    <span
                      className={`text-[13px] font-bold tabular-nums ${latencyColor(row.latency_ms)}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {fmtMs(row.latency_ms)}
                    </span>

                    {/* delta */}
                    <span
                      className={`text-[12px] tabular-nums ${isLastRow && row.delta_ms == null ? 'text-[var(--ink-subtle)]' : deltaColor(row.delta_ms)}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                      title={
                        row.delta_ms == null
                          ? 'Oldest recorded message — no predecessor'
                          : `${row.delta_ms > 0 ? 'Slower' : 'Faster'} than the message before it`
                      }
                    >
                      {isLastRow && row.delta_ms == null ? 'first' : fmtDelta(row.delta_ms)}
                    </span>

                    {/* total tokens */}
                    <span
                      className="text-[11px] text-[var(--ink-muted)] tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {row.tokens_used.toLocaleString()}
                    </span>

                    {/* input tokens */}
                    <span
                      className={`text-[11px] tabular-nums ${row.input_tokens > 3000 ? 'text-amber-400' : 'text-[var(--ink-muted)]'}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                      title="Input/prompt tokens — includes system prompt + conversation history + RAG context"
                    >
                      {row.input_tokens.toLocaleString()}
                    </span>

                    {/* output tokens */}
                    <span
                      className={`text-[11px] tabular-nums ${row.output_tokens > 400 ? 'text-amber-400' : 'text-[var(--ink-muted)]'}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                      title="Output/completion tokens — proportional to response length"
                    >
                      {row.output_tokens.toLocaleString()}
                    </span>

                    {/* why slow */}
                    <span className="flex flex-wrap gap-1">
                      {reasons.map((r, ri) => (
                        <span
                          key={ri}
                          className={`text-[10px] font-medium ${r.color}`}
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {r.label}{ri < reasons.length - 1 ? ' ·' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Legend ──────────────────────────────────────────────────── */}
          <div className="border border-[var(--hairline)] bg-[var(--surface)] px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
              Why slow — heuristic legend
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {[
                ['large context (>3 k in)', 'System prompt + RAG chunks + history = more tokens to prefill → higher TTFT'],
                ['long reply (>400 out)',    'More tokens to generate = more wall-clock time, scales linearly'],
                ['slow decoding (>30ms/tok)','Provider GPU is overloaded or rate-limited; baseline should be ~10-20ms/tok'],
                ['cold start / network',     'Short context + short reply yet still slow → provider cold-start or network RTT'],
                ['delta +Xs',                'This message took significantly longer than the one before it (spike)'],
                ['delta −Xs',                'Faster than previous — context was lighter or provider was less loaded'],
              ].map(([term, def]) => (
                <div key={term} className="flex gap-2 items-start py-0.5">
                  <span className="text-[10px] text-[var(--ink)] shrink-0" style={{ fontFamily: 'var(--font-mono)', minWidth: 200 }}>{term}</span>
                  <span className="text-[10px] text-[var(--ink-muted)]">{def}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
