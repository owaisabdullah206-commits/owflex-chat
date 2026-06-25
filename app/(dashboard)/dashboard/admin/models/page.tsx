import { requirePlatformOwner } from '@/lib/auth/session'
import { getModelPrices, getExpensiveModelThreshold } from '@/lib/db/queries/admin'
import { db, schema } from '@/lib/db'
import { desc, eq } from 'drizzle-orm'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ModelPricesTable } from '@/components/dashboard/ModelPricesTable'
import { ExpensiveThresholdForm } from '@/components/dashboard/ExpensiveThresholdForm'
import { getFreeQuotaUsage, FREE_RPM_LIMIT, FREE_RPD_LIMIT } from '@/lib/ai/free-quota'

export default async function AdminModelsPage() {
  await requirePlatformOwner()

  const [models, lastFetchedRow, quota, configuredThreshold] = await Promise.all([
    getModelPrices(),
    db
      .select({ effectiveFrom: schema.modelPrices.effectiveFrom })
      .from(schema.modelPrices)
      .where(eq(schema.modelPrices.source, 'openrouter-api'))
      .orderBy(desc(schema.modelPrices.effectiveFrom))
      .limit(1),
    getFreeQuotaUsage(),
    getExpensiveModelThreshold(),
  ])

  const lastFetched = lastFetchedRow[0]?.effectiveFrom ?? null

  // Compute default threshold: average combined (prompt + completion) price
  const totals = models
    .filter(m => m.active?.promptPricePer1M && m.active?.completionPricePer1M)
    .map(m => parseFloat(m.active!.promptPricePer1M) + parseFloat(m.active!.completionPricePer1M))
  const defaultThreshold = totals.length > 0
    ? totals.reduce((a, b) => a + b, 0) / totals.length
    : 0
  const rpmPct  = Math.min(100, Math.round((quota.rpm / FREE_RPM_LIMIT) * 100))
  const rpdPct  = Math.min(100, Math.round((quota.rpd / FREE_RPD_LIMIT) * 100))
  const rpmNear = rpmPct >= 80
  const rpdNear = rpdPct >= 80

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">Admin</p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Model Pricing</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">Fetch live prices from OpenRouter or set manual overrides per model.</p>

          {/* Free-tier quota live status */}
          <div className="mt-4 flex flex-wrap gap-4">
            {/* RPM */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center justify-between">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-subtle)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  free_rpm
                </span>
                <span
                  className={`text-[10px] font-semibold ${rpmNear ? 'text-amber-400' : 'text-emerald-400'}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {quota.rpm}/{FREE_RPM_LIMIT}
                </span>
              </div>
              <div className="h-[3px] rounded-full bg-[var(--surface-3)] overflow-hidden">
                <div
                  className={`h-full transition-all ${rpmNear ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${rpmPct}%` }}
                />
              </div>
              <span className="text-[9px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                this minute · resets each min
              </span>
            </div>

            {/* RPD */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center justify-between">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-subtle)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  free_rpd
                </span>
                <span
                  className={`text-[10px] font-semibold ${rpdNear ? 'text-amber-400' : 'text-emerald-400'}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {quota.rpd}/{FREE_RPD_LIMIT}
                </span>
              </div>
              <div className="h-[3px] rounded-full bg-[var(--surface-3)] overflow-hidden">
                <div
                  className={`h-full transition-all ${rpdNear ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${rpdPct}%` }}
                />
              </div>
              <span className="text-[9px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                today · resets midnight UTC
              </span>
            </div>
          </div>

          {/* Expensive model threshold */}
          <div className="mt-6 pt-5 border-t border-[var(--hairline)]">
            <ExpensiveThresholdForm
              currentThreshold={configuredThreshold}
              defaultThreshold={defaultThreshold}
            />
          </div>
        </div>
        <div className="px-8 py-6">
          <ModelPricesTable models={models} lastFetched={lastFetched} />
        </div>
      </main>
    </div>
  )
}
