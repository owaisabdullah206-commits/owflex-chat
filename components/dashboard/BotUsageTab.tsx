interface ModelBreakdownRow {
  model: string
  messages: number
  tokens: number
}

interface BotUsageData {
  conversations: number
  messages: number
  tokens: number
  avgLatencyMs: number
  creditsUsed: number
  leads: number
  modelBreakdown: ModelBreakdownRow[]
}

interface BotUsageTabProps {
  data: BotUsageData
  convLimit: number | null
  leadLimit: number | null
  creditBudget: number | null
}

function MetricCard({
  label,
  value,
  limit,
  suffix = '',
}: {
  label: string
  value: number | string
  limit?: number | null
  suffix?: string
}) {
  const isUnlimited = limit === null || limit === undefined
  const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
  const hasBar = !isUnlimited && limit > 0 && typeof value === 'number'
  const pct = hasBar ? Math.min(100, (numValue / limit) * 100) : 0
  const isNear = hasBar && pct >= 80

  return (
    <div className="bg-[var(--surface)] px-5 py-[18px] flex flex-col gap-1.5">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span
          className="text-[32px] font-semibold leading-none text-[var(--ink)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {!isUnlimited && (
          <span className="text-[12px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
            / {limit!.toLocaleString()}{suffix ? ` ${suffix}` : ''}
          </span>
        )}
        {isUnlimited && suffix && (
          <span className="text-[12px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {suffix}
          </span>
        )}
      </div>
      {hasBar && (
        <div className="h-[3px] rounded-full bg-[var(--surface-2)] overflow-hidden mt-1">
          <div
            className={`h-full transition-all ${isNear ? 'bg-[var(--of-warning)]' : 'bg-[var(--of-primary)]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function BotUsageTab({ data, convLimit, leadLimit, creditBudget }: BotUsageTabProps) {
  const formatLatency = (ms: number) =>
    ms === 0 ? '—' : ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`

  const formatTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[var(--hairline)] overflow-hidden border border-[var(--hairline)]">
        <MetricCard label="conversations" value={data.conversations} limit={convLimit} />
        <MetricCard label="messages" value={data.messages} />
        <MetricCard label="leads" value={data.leads} limit={leadLimit} />
        <MetricCard label="tokens" value={data.tokens} suffix="used" />
        <MetricCard label="credits_used" value={data.creditsUsed} limit={creditBudget} />
        <MetricCard label="avg_latency" value={formatLatency(data.avgLatencyMs)} />
      </div>

      {/* Model breakdown */}
      {data.modelBreakdown.length > 0 && (
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            model_breakdown
          </p>
          <div className="border border-[var(--hairline)] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--surface-2)]">
                  <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>model</th>
                  <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] text-right" style={{ fontFamily: 'var(--font-mono)' }}>messages</th>
                  <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] text-right hidden sm:table-cell" style={{ fontFamily: 'var(--font-mono)' }}>tokens</th>
                </tr>
              </thead>
              <tbody>
                {data.modelBreakdown.map((row) => (
                  <tr key={row.model} className="border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface-2)] transition-colors">
                    <td className="px-4 py-2.5 text-[12px] text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>{row.model}</td>
                    <td className="px-4 py-2.5 text-[12px] text-[var(--ink-muted)] text-right" style={{ fontFamily: 'var(--font-mono)' }}>{row.messages.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-[12px] text-[var(--ink-muted)] text-right hidden sm:table-cell" style={{ fontFamily: 'var(--font-mono)' }}>{formatTokens(row.tokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
