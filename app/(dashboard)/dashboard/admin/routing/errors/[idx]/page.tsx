import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { Redis } from '@upstash/redis'
import { requirePlatformOwner } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { CopyButton } from '@/components/shared/CopyButton'
import { ClientDate } from '@/components/shared/ClientDate'

// ── Data ─────────────────────────────────────────────────────────────────────

interface RawError { t: string; embedKey: string; err: string }

async function getErrorDetail(idx: number) {
  const redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  const raw = await redis.lrange<string>('chat:errors', 0, 29)
  const entry = raw[idx]
  if (!entry) return null

  let parsed: RawError
  try { parsed = JSON.parse(typeof entry === 'string' ? entry : JSON.stringify(entry)) }
  catch { parsed = { t: '', embedKey: '', err: String(entry) } }

  if (!parsed.embedKey) return { error: parsed, bot: null, org: null, owner: null }

  const [row] = await db
    .select({
      botId:      schema.bots.id,
      botName:    schema.bots.name,
      botModel:   schema.bots.model,
      orgId:      schema.organizations.id,
      orgName:    schema.organizations.name,
      orgPlan:    schema.organizations.plan,
      ownerId:    schema.organizations.ownerId,
      ownerName:  schema.users.name,
      ownerEmail: schema.users.email,
    })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .innerJoin(schema.users, eq(schema.organizations.ownerId, schema.users.id))
    .where(eq(schema.bots.embedKey, parsed.embedKey))
    .limit(1)

  if (!row) return { error: parsed, bot: null, org: null, owner: null }

  return {
    error: parsed,
    bot:   { id: row.botId, name: row.botName, model: row.botModel },
    org:   { id: row.orgId, name: row.orgName, plan: row.orgPlan },
    owner: { id: row.ownerId, name: row.ownerName, email: row.ownerEmail },
  }
}

// ── UI atoms ─────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--hairline)] bg-[var(--surface-2)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]"
          style={{ fontFamily: 'var(--font-mono)' }}>
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, value, mono, highlight }: {
  label: string
  value: React.ReactNode
  mono?: boolean
  highlight?: 'error' | 'warning'
}) {
  const valueColor = highlight === 'error' ? '#EF4444' : highlight === 'warning' ? '#F59E0B' : 'var(--ink)'
  return (
    <div className="flex gap-4 py-2.5 border-b border-[var(--hairline)] last:border-0">
      <span className="w-36 shrink-0 text-[11px] text-[var(--ink-subtle)]"
        style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      <span className="text-[12px] break-all flex-1"
        style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, color: valueColor }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ErrorDetailPage({ params }: { params: Promise<{ idx: string }> }) {
  await requirePlatformOwner()
  const { idx: idxStr } = await params
  const idx = parseInt(idxStr, 10)
  if (isNaN(idx) || idx < 0 || idx > 29) notFound()

  const data = await getErrorDetail(idx)
  if (!data) notFound()

  const { error, bot, org, owner } = data

  const copyText = [
    `Time:       ${error.t ? new Date(error.t).toLocaleString() : '—'}`,
    `Embed Key:  ${error.embedKey || '—'}`,
    `Bot:        ${bot?.name ?? '—'} (${bot?.id ?? '—'})`,
    `Org:        ${org?.name ?? '—'} (${org?.id ?? '—'})`,
    `Plan:       ${org?.plan ?? '—'}`,
    `Developer:  ${owner?.name ?? '—'} <${owner?.email ?? '—'}>`,
    ``,
    `Error:`,
    error.err,
  ].join('\n')

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">

        {/* Header */}
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/admin/routing"
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              admin / routing
            </Link>
            <span className="text-[var(--ink-subtle)]">/</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]"
              style={{ fontFamily: 'var(--font-mono)' }}>
              error #{idx}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[var(--ink)]">Chat Error Detail</h1>
              <p className="text-[11px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                {error.t ? <ClientDate iso={error.t} /> : 'unknown time'}
              </p>
            </div>
            <CopyButton text={copyText} label="Copy all details" />
          </div>
        </div>

        <div className="px-8 py-6 max-w-3xl space-y-5">

          {/* Error */}
          <Section title="error">
            <Field label="time" value={error.t ? <ClientDate iso={error.t} /> : '—'} mono />
            <div className="py-2.5">
              <span className="text-[11px] text-[var(--ink-subtle)] block mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                message
              </span>
              <pre className="text-[11px] text-[#EF4444] bg-[#EF444408] border border-[#EF444420] rounded p-4 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto"
                style={{ fontFamily: 'var(--font-mono)' }}>
                {error.err || '—'}
              </pre>
            </div>
          </Section>

          {/* Bot */}
          <Section title="bot">
            {bot ? (
              <>
                <Field label="name" value={bot.name} />
                <Field label="id" value={bot.id} mono />
                <Field label="model" value={bot.model} mono />
                <Field label="embed key" value={error.embedKey} mono />
                <div className="pt-3">
                  <Link
                    href={`/dashboard/bots/${bot.id}`}
                    className="text-[11px] text-[var(--of-primary)] hover:underline"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    → Open bot settings
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Field label="embed key" value={error.embedKey || '—'} mono highlight="warning" />
                <p className="text-[11px] text-[var(--ink-subtle)] pt-2">
                  No agent found for this embed key. The agent may have been deleted.
                </p>
              </>
            )}
          </Section>

          {/* Org / Developer */}
          <Section title="developer / org">
            {owner ? (
              <>
                <Field label="developer name"  value={owner.name} />
                <Field label="developer email" value={
                  <a href={`mailto:${owner.email}`}
                    className="text-[var(--of-primary)] hover:underline">
                    {owner.email}
                  </a>
                } />
                <Field label="org name"  value={org?.name} />
                <Field label="org id"    value={org?.id} mono />
                <Field label="plan"      value={org?.plan} mono />
              </>
            ) : (
              <p className="text-[11px] text-[var(--ink-subtle)]">
                Could not resolve developer — embed key not matched to any agent.
              </p>
            )}
          </Section>

          {/* Actions */}
          {owner && (
            <Section title="actions">
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${owner.email}?subject=Issue with your Octively agent "${bot?.name ?? ''}"&body=Hi ${owner.name ?? ''},%0A%0AWe noticed an error with your agent.%0A%0AError: ${encodeURIComponent(error.err.slice(0, 200))}%0A%0APlease check your agent settings or contact us if you need help.`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-white rounded"
                  style={{ background: 'var(--of-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  Email developer
                </a>
                {bot && (
                  <Link
                    href={`/dashboard/bots/${bot.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium border border-[var(--hairline)] text-[var(--ink)] rounded hover:bg-[var(--surface-2)] transition-colors"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Open agent settings
                  </Link>
                )}
                <Link
                  href="/dashboard/admin/routing"
                  className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium border border-[var(--hairline)] text-[var(--ink)] rounded hover:bg-[var(--surface-2)] transition-colors"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  ← Back to error log
                </Link>
              </div>
            </Section>
          )}

        </div>
      </main>
    </div>
  )
}
