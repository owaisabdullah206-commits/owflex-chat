import { avg, count, desc, eq, inArray, sql } from 'drizzle-orm'
import { Redis } from '@upstash/redis'
import { requirePlatformOwner } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { STRONG_MODEL } from '@/lib/ai/litellm'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { ErrorLogTable } from '@/components/dashboard/ErrorLogTable'

// ── Classification colour palette ───────────────────────────────────────────
const CLASS_COLOR: Record<string, string> = {
  greeting:  '#10B981',
  faq:       '#0EA5E9',
  knowledge: '#8B5CF6',
  complex:   '#F59E0B',
}
const CLASS_LABEL: Record<string, string> = {
  greeting:  'Greeting',
  faq:       'FAQ',
  knowledge: 'Knowledge',
  complex:   'Complex',
}

// ── Shared UI atoms ──────────────────────────────────────────────────────────
function Tile({ children, span = 1, accent }: { children: React.ReactNode; span?: 1 | 2 | 3 | 4; accent?: string }) {
  const spanCls = { 1: '', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4' }[span]
  return (
    <div className={`bg-[var(--surface)] ${spanCls} relative overflow-hidden`}>
      {accent && <div className="h-[2px] w-full" style={{ background: accent }} />}
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
      {children}
    </p>
  )
}

function BigNum({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="text-3xl font-bold text-[var(--ink)] leading-none" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em', ...style }}>
      {children}
    </p>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-[var(--ink-subtle)] mt-2">{children}</p>
}

const thCls = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)]'
const tdCls = 'px-4 py-2.5 text-[12px] border-b border-[var(--hairline)]'

// ── Model name shortener for table display ───────────────────────────────────
function shortModel(m: string) {
  const parts = m.split('/')
  return parts[parts.length - 1] ?? m
}

// ── Data fetching ────────────────────────────────────────────────────────────
async function getRoutingStats() {
  const [overall] = await db.select({
    total:        count(),
    avgLatency:   avg(schema.routingDecisions.classifierLatencyMs),
    fallbacks:    sql<number>`count(*) filter (where fallback_used = true)`,
    strongRouted: sql<number>`count(*) filter (where chosen_model = ${STRONG_MODEL} and not fallback_used)`,
    strongCredits:  sql<number>`coalesce(sum(credit_cost) filter (where chosen_model = ${STRONG_MODEL} and not fallback_used), 0)`,
    defaultCredits: sql<number>`coalesce(sum(credit_cost) filter (where chosen_model != ${STRONG_MODEL} or fallback_used), 0)`,
  }).from(schema.routingDecisions)

  const byClass = await db.select({
    classification: schema.routingDecisions.classification,
    cnt: count(),
    credits: sql<number>`coalesce(sum(credit_cost), 0)`,
  })
    .from(schema.routingDecisions)
    .groupBy(schema.routingDecisions.classification)
    .orderBy(desc(count()))

  const byBot = await db.select({
    botId:      schema.routingDecisions.botId,
    botName:    schema.bots.name,
    orgName:    schema.organizations.name,
    total:      count(),
    avgLat:     avg(schema.routingDecisions.classifierLatencyMs),
    complex:    sql<number>`count(*) filter (where classification = 'complex')`,
    strong:     sql<number>`count(*) filter (where chosen_model = ${STRONG_MODEL} and not fallback_used)`,
    fallbacks:  sql<number>`count(*) filter (where fallback_used = true)`,
  })
    .from(schema.routingDecisions)
    .innerJoin(schema.bots, eq(schema.routingDecisions.botId, schema.bots.id))
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .groupBy(schema.routingDecisions.botId, schema.bots.name, schema.organizations.name)
    .orderBy(desc(count()))
    .limit(20)

  const recent = await db.select({
    id:           schema.routingDecisions.id,
    classification: schema.routingDecisions.classification,
    classifierModel: schema.routingDecisions.classifierModel,
    classifierLatencyMs: schema.routingDecisions.classifierLatencyMs,
    chosenModel:  schema.routingDecisions.chosenModel,
    fallbackUsed: schema.routingDecisions.fallbackUsed,
    creditCost:   schema.routingDecisions.creditCost,
    createdAt:    schema.routingDecisions.createdAt,
    botName:      schema.bots.name,
  })
    .from(schema.routingDecisions)
    .innerJoin(schema.bots, eq(schema.routingDecisions.botId, schema.bots.id))
    .orderBy(desc(schema.routingDecisions.createdAt))
    .limit(50)

  return { overall, byClass, byBot, recent }
}

interface ChatError {
  t: string
  embedKey: string
  err: string
  botName?: string
  orgName?: string
  botId?: string
}

async function getChatErrors(): Promise<ChatError[]> {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    const raw = await redis.lrange<string>('chat:errors', 0, 29)
    const errors: ChatError[] = raw.map((s) => {
      try { return JSON.parse(typeof s === 'string' ? s : JSON.stringify(s)) as ChatError }
      catch { return { t: '', embedKey: '', err: String(s) } }
    })

    // Resolve unique embed keys → bot name + org name in one query
    const keys = [...new Set(errors.map(e => e.embedKey).filter(Boolean))]
    if (keys.length > 0) {
      const bots = await db
        .select({
          embedKey: schema.bots.embedKey,
          botId:    schema.bots.id,
          botName:  schema.bots.name,
          orgName:  schema.organizations.name,
        })
        .from(schema.bots)
        .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
        .where(inArray(schema.bots.embedKey, keys))

      const byKey = Object.fromEntries(bots.map(b => [b.embedKey, b]))
      for (const e of errors) {
        const b = byKey[e.embedKey]
        if (b) { e.botName = b.botName; e.orgName = b.orgName; e.botId = b.botId }
      }
    }

    return errors
  } catch {
    return []
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminRoutingPage() {
  await requirePlatformOwner()
  const [{ overall, byClass, byBot, recent }, chatErrors] = await Promise.all([
    getRoutingStats(),
    getChatErrors(),
  ])

  const total     = overall?.total ?? 0
  const avgLat    = Math.round(Number(overall?.avgLatency ?? 0))
  const fallbacks = Number(overall?.fallbacks ?? 0)
  const strong    = Number(overall?.strongRouted ?? 0)
  const strongCredits  = Number(overall?.strongCredits ?? 0)
  const defaultCredits = Number(overall?.defaultCredits ?? 0)
  // Credits saved = what it would have cost to send all default-model messages through strong model, minus what we actually spent
  const savedCredits = defaultCredits * 4 // 5x minus 1x already spent

  const fallbackRate  = total > 0 ? ((fallbacks / total) * 100).toFixed(1) : '0'
  const strongRate    = total > 0 ? ((strong / total) * 100).toFixed(1) : '0'

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        {/* Page header */}
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
            admin / routing
          </p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Routing Intelligence</h1>
          <p className="text-[11px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            smart routing decisions · model distribution · error log
          </p>
        </div>

        <div className="px-8 py-6 max-w-6xl space-y-8">

          {/* ── Header metrics ───────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              overview
            </p>
            <div className="border border-[var(--hairline)]">
              <div className="h-[2px] bg-[var(--of-primary)] w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--hairline)]">
                <Tile>
                  <div className="px-5 py-5">
                    <Label>Total Decisions</Label>
                    <BigNum>{total.toLocaleString()}</BigNum>
                    <Sub>all-time routing events</Sub>
                  </div>
                </Tile>
                <Tile>
                  <div className="px-5 py-5">
                    <Label>Strong Model Routed</Label>
                    <BigNum>{strong.toLocaleString()}</BigNum>
                    <Sub>{strongRate}% of all decisions</Sub>
                  </div>
                </Tile>
                <Tile>
                  <div className="px-5 py-5">
                    <Label>Fallback Rate</Label>
                    <BigNum style={{ color: fallbacks > 0 ? 'var(--of-warning)' : 'var(--ink)' } as React.CSSProperties}>
                      {fallbackRate}%
                    </BigNum>
                    <Sub>{fallbacks} complex msgs fell back (low credits)</Sub>
                  </div>
                </Tile>
                <Tile>
                  <div className="px-5 py-5">
                    <Label>Avg Classifier Latency</Label>
                    <BigNum>{avgLat}<span className="text-base text-[var(--ink-subtle)] ml-1">ms</span></BigNum>
                    <Sub>time to classify each message</Sub>
                  </div>
                </Tile>
              </div>
            </div>
          </div>

          {/* ── Classification split ─────────────────────────────────────── */}
          {byClass.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                classification breakdown
              </p>
              <div className="border border-[var(--hairline)] bg-[var(--surface)]">
                <div className="h-[2px] bg-[var(--of-primary)] w-full" />
                <div className="p-5 space-y-4">
                  {byClass.map(({ classification, cnt, credits }) => {
                    const pct = total > 0 ? (Number(cnt) / total) * 100 : 0
                    const color = CLASS_COLOR[classification] ?? '#6B7280'
                    const label = CLASS_LABEL[classification] ?? classification
                    return (
                      <div key={classification}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                            <span className="text-[12px] font-medium text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>
                              {label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                              {Number(credits).toLocaleString()} credits
                            </span>
                            <span className="text-[12px] font-semibold text-[var(--ink)] w-14 text-right" style={{ fontFamily: 'var(--font-mono)' }}>
                              {cnt.toLocaleString()} · {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Credit distribution ──────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              credit distribution
            </p>
            <div className="border border-[var(--hairline)]">
              <div className="h-[2px] bg-[var(--of-primary)] w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--hairline)]">
                <Tile>
                  <div className="px-5 py-5">
                    <Label>Default Model Credits</Label>
                    <BigNum>{defaultCredits.toLocaleString()}</BigNum>
                    <Sub>greeting + faq + knowledge + fallback</Sub>
                  </div>
                </Tile>
                <Tile>
                  <div className="px-5 py-5">
                    <Label>Strong Model Credits</Label>
                    <BigNum>{strongCredits.toLocaleString()}</BigNum>
                    <Sub>complex messages routed to {shortModel(STRONG_MODEL)}</Sub>
                  </div>
                </Tile>
                <Tile accent="var(--of-success)">
                  <div className="px-5 py-5">
                    <Label>Credits Saved</Label>
                    <BigNum style={{ color: 'var(--of-success)' } as React.CSSProperties}>
                      ~{savedCredits.toLocaleString()}
                    </BigNum>
                    <Sub>vs sending all msgs to strong model (4× avoided)</Sub>
                  </div>
                </Tile>
              </div>
            </div>
          </div>

          {/* ── Per-bot breakdown ────────────────────────────────────────── */}
          {byBot.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                per-agent breakdown
              </p>
              <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
                <div className="h-[2px] bg-[var(--of-primary)] w-full" />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className={thCls}>Agent</th>
                        <th className={thCls}>Org</th>
                        <th className={`${thCls} text-right`}>Total</th>
                        <th className={`${thCls} text-right`}>Complex%</th>
                        <th className={`${thCls} text-right`}>Strong%</th>
                        <th className={`${thCls} text-right`}>Fallback%</th>
                        <th className={`${thCls} text-right`}>Avg Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byBot.map((row) => {
                        const t = Number(row.total)
                        const complexPct  = t > 0 ? ((Number(row.complex)   / t) * 100).toFixed(0) : '0'
                        const strongPct   = t > 0 ? ((Number(row.strong)    / t) * 100).toFixed(0) : '0'
                        const fallbackPct = t > 0 ? ((Number(row.fallbacks) / t) * 100).toFixed(0) : '0'
                        return (
                          <tr key={row.botId} className="hover:bg-[var(--surface-2)] transition-colors">
                            <td className={`${tdCls} font-medium text-[var(--ink)]`}>{row.botName}</td>
                            <td className={`${tdCls} text-[var(--ink-muted)]`}>{row.orgName}</td>
                            <td className={`${tdCls} text-right text-[var(--ink)]`} style={{ fontFamily: 'var(--font-mono)' }}>{t.toLocaleString()}</td>
                            <td className={`${tdCls} text-right`} style={{ fontFamily: 'var(--font-mono)', color: CLASS_COLOR.complex }}>{complexPct}%</td>
                            <td className={`${tdCls} text-right text-[var(--ink-muted)]`} style={{ fontFamily: 'var(--font-mono)' }}>{strongPct}%</td>
                            <td className={`${tdCls} text-right`} style={{ fontFamily: 'var(--font-mono)', color: Number(fallbackPct) > 10 ? 'var(--of-warning)' : 'var(--ink-subtle)' }}>
                              {fallbackPct}%
                            </td>
                            <td className={`${tdCls} text-right text-[var(--ink-subtle)]`} style={{ fontFamily: 'var(--font-mono)' }}>
                              {Math.round(Number(row.avgLat))}ms
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Recent decisions ─────────────────────────────────────────── */}
          {recent.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                recent decisions (last 50)
              </p>
              <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
                <div className="h-[2px] bg-[var(--of-primary)] w-full" />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className={thCls}>Time</th>
                        <th className={thCls}>Agent</th>
                        <th className={thCls}>Class</th>
                        <th className={thCls}>Chosen Model</th>
                        <th className={thCls}>Fallback</th>
                        <th className={`${thCls} text-right`}>Credits</th>
                        <th className={`${thCls} text-right`}>Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((row) => {
                        const isStrong = row.chosenModel === STRONG_MODEL
                        const color = CLASS_COLOR[row.classification] ?? '#6B7280'
                        return (
                          <tr key={row.id} className="hover:bg-[var(--surface-2)] transition-colors">
                            <td className={`${tdCls} text-[var(--ink-subtle)] whitespace-nowrap`} style={{ fontFamily: 'var(--font-mono)' }}>
                              <RelativeTime date={row.createdAt} />
                            </td>
                            <td className={`${tdCls} text-[var(--ink-muted)] max-w-[140px] truncate`}>{row.botName}</td>
                            <td className={tdCls}>
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                                style={{ background: `${color}22`, color }}
                              >
                                {row.classification}
                              </span>
                            </td>
                            <td className={`${tdCls} text-[var(--ink-muted)] max-w-[160px] truncate`} style={{ fontFamily: 'var(--font-mono)', color: isStrong ? '#8B5CF6' : undefined }}>
                              {shortModel(row.chosenModel)}
                            </td>
                            <td className={tdCls}>
                              {row.fallbackUsed
                                ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm" style={{ background: '#F59E0B22', color: '#F59E0B' }}>fallback</span>
                                : <span className="text-[10px] text-[var(--ink-subtle)]">—</span>}
                            </td>
                            <td className={`${tdCls} text-right text-[var(--ink-muted)]`} style={{ fontFamily: 'var(--font-mono)' }}>
                              {row.creditCost.toLocaleString()}
                            </td>
                            <td className={`${tdCls} text-right text-[var(--ink-subtle)]`} style={{ fontFamily: 'var(--font-mono)' }}>
                              {row.classifierLatencyMs}ms
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="border border-[var(--hairline)] bg-[var(--surface)] px-6 py-12 text-center">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                no_routing_data
              </p>
              <p className="text-sm text-[var(--ink-muted)]">
                Routing decisions are recorded when an agent has smart routing enabled and receives messages.
              </p>
            </div>
          )}

          {/* ── Chat error log ───────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              chat error log (last 30)
            </p>
            {chatErrors.length === 0 ? (
              <div className="border border-[var(--hairline)] bg-[var(--surface)] px-6 py-8 text-center">
                <p className="text-[11px] text-[var(--of-success)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  ✓ no_recent_errors
                </p>
              </div>
            ) : (
              <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
                <div className="h-[2px] w-full" style={{ background: '#EF4444' }} />
                <div className="overflow-x-auto">
                  <ErrorLogTable rows={chatErrors} />
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
