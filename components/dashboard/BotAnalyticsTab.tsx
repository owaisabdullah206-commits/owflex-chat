import { Activity, AlertTriangle, CheckCircle2, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { UpgradeCTA } from '@/components/dashboard/UpgradeCTA'

interface BotAnalyticsTabProps {
  data: {
    totalConversations: number
    totalMessages:      number
    escalatedCount:     number
    avgMessagesPerConv: number
    unansweredCount:    number
    resolutionRate:     number
    recentConversations: {
      id:           string
      sessionId:    string
      startedAt:    Date
      messageCount: number
      needsHuman:   boolean
    }[]
  }
  botId:  string
  period: number
  plan:   string
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  tone?: 'default' | 'primary' | 'warning' | 'success'
  sub?: string
}) {
  const toneColor =
    tone === 'primary' ? 'var(--of-primary)' :
    tone === 'warning' ? '#F59E0B' :
    tone === 'success' ? 'var(--of-success)' :
    'var(--ink-muted)'

  return (
    <div className="border border-[var(--hairline)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={14} style={{ color: toneColor, marginTop: 1 }} />
      </div>
      <p
        className="text-2xl font-bold text-[var(--ink)] leading-none mb-1"
        style={{ fontFamily: 'var(--font-mono)', color: toneColor !== 'var(--ink-muted)' ? toneColor : 'var(--ink)' }}
      >
        {value}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </p>
      {sub && (
        <p className="text-[11px] text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{sub}</p>
      )}
    </div>
  )
}

export function BotAnalyticsTab({ data, period, plan }: BotAnalyticsTabProps) {
  const {
    totalConversations,
    totalMessages,
    escalatedCount,
    avgMessagesPerConv,
    unansweredCount,
    resolutionRate,
    recentConversations,
  } = data

  const isAdvanced = plan !== 'free' && plan !== 'starter'

  return (
    <div className="space-y-6">
      {/* Period note */}
      <div className="flex items-center justify-between">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          analytics · last {period} days
          {!isAdvanced && (
            <span className="ml-2 px-1.5 py-0.5 border border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]">
              basic
            </span>
          )}
        </p>
      </div>

      {/* Basic metric grid — all plans */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3`}>
        <MetricCard
          label="conversations"
          value={totalConversations}
          icon={Users}
          tone="primary"
        />
        <MetricCard
          label="total_messages"
          value={totalMessages}
          icon={MessageSquare}
        />
        <MetricCard
          label="avg_msgs / conv"
          value={avgMessagesPerConv}
          icon={TrendingUp}
        />

        {/* Advanced metrics — pro+ only */}
        {isAdvanced && (
          <>
            <MetricCard
              label="unanswered"
              value={unansweredCount}
              icon={AlertTriangle}
              tone={unansweredCount > 0 ? 'warning' : 'default'}
            />
            <MetricCard
              label="escalated"
              value={escalatedCount}
              icon={AlertTriangle}
              tone={escalatedCount > 0 ? 'warning' : 'default'}
              sub={escalatedCount > 0 ? 'needs human review' : undefined}
            />
            <MetricCard
              label="resolution_rate"
              value={`${resolutionRate}%`}
              icon={CheckCircle2}
              tone={resolutionRate >= 80 ? 'success' : resolutionRate >= 60 ? 'warning' : 'default'}
            />
          </>
        )}
      </div>

      {/* Upgrade nudge for free/starter */}
      {!isAdvanced && (
        <UpgradeCTA
          feature="Advanced Analytics"
          requiredPlan="Pro"
          description="Unlock escalation tracking, resolution rates, unanswered question counts, and flagged conversation history."
        />
      )}

      {/* Recent conversations — advanced plans only */}
      {isAdvanced && recentConversations.length > 0 && (
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            recent_sessions
          </p>
          <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
            {recentConversations.map((conv, i) => (
              <a
                key={conv.id}
                href={`/dashboard/conversations/${conv.id}?from=bot`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-2)] transition-colors group"
                style={{ borderBottom: i < recentConversations.length - 1 ? '1px solid var(--hairline)' : 'none' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Activity size={12} style={{ color: 'var(--ink-subtle)', flexShrink: 0 }} />
                  <span
                    className="text-[12px] text-[var(--ink-muted)] truncate"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {conv.sessionId.slice(0, 20)}…
                  </span>
                  {conv.needsHuman && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 border"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: '#F59E0B',
                        borderColor: '#F59E0B40',
                        background: '#F59E0B0D',
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    >
                      escalated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {conv.messageCount} msgs
                  </span>
                  <span className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {new Date(conv.startedAt).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {totalConversations === 0 && (
        <div className="text-center py-16 border border-[var(--hairline)] bg-[var(--surface)]">
          <Activity size={24} className="mx-auto mb-3" style={{ color: 'var(--ink-subtle)' }} />
          <p className="text-sm text-[var(--ink-muted)]">No conversations in the last {period} days.</p>
          <p className="text-xs text-[var(--ink-subtle)] mt-1">Data will appear here once visitors start chatting.</p>
        </div>
      )}
    </div>
  )
}
