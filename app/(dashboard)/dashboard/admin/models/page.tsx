import { requirePlatformOwner } from '@/lib/auth/session'
import { getModelPrices } from '@/lib/db/queries/admin'
import { db, schema } from '@/lib/db'
import { desc, eq } from 'drizzle-orm'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ModelPricesTable } from '@/components/dashboard/ModelPricesTable'

export default async function AdminModelsPage() {
  await requirePlatformOwner()

  const [models, lastFetchedRow] = await Promise.all([
    getModelPrices(),
    db
      .select({ effectiveFrom: schema.modelPrices.effectiveFrom })
      .from(schema.modelPrices)
      .where(eq(schema.modelPrices.source, 'openrouter-api'))
      .orderBy(desc(schema.modelPrices.effectiveFrom))
      .limit(1),
  ])

  const lastFetched = lastFetchedRow[0]?.effectiveFrom ?? null

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">Admin</p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Model Pricing</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">Fetch live prices from OpenRouter or set manual overrides per model.</p>
        </div>
        <div className="px-8 py-6">
          <ModelPricesTable models={models} lastFetched={lastFetched} />
        </div>
      </main>
    </div>
  )
}
