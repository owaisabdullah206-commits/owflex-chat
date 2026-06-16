import { and, desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { TopNav } from '@/components/portal/TopNav'
import type { PortalConfig } from '@/components/portal/TopNav'
import { LeadsSearch } from '@/components/portal/LeadsSearch'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { AutoRefresh } from '@/components/shared/AutoRefresh'
import { RefreshButton } from '@/components/shared/RefreshButton'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ bot?: string }>
}) {
  const user = await requireClient()
  const { bot: botParam } = await searchParams

  const bots = await db
    .select({ id: schema.bots.id, name: schema.bots.name, portalConfig: schema.bots.portalConfig })
    .from(schema.bots)
    .where(eq(schema.bots.clientUserId, user.id))

  const bot = (botParam ? bots.find((b) => b.id === botParam) : null) ?? bots[0] ?? null
  const portalConfig = (bot?.portalConfig ?? null) as PortalConfig | null

  if (portalConfig?.showLeads === false) redirect('/portal')

  // CSV export is a paid feature for the developer's org. The portal is the
  // CLIENT's view — never show plan or upgrade language here; the button is
  // simply absent on free-tier orgs.
  let canExport = false
  if (bot) {
    const [org] = await db
      .select({ plan: schema.organizations.plan })
      .from(schema.organizations)
      .innerJoin(schema.bots, eq(schema.bots.orgId, schema.organizations.id))
      .where(eq(schema.bots.id, bot.id))
      .limit(1)
    canExport = !!org && org.plan !== 'free'
  }

  const leads = bot
    ? await db
        .select({
          id: schema.leads.id,
          name: schema.leads.name,
          email: schema.leads.email,
          phone: schema.leads.phone,
          notes: schema.leads.notes,
          capturedAt: schema.leads.capturedAt,
          conversationId: schema.leads.conversationId,
          status: schema.leads.status,
        })
        .from(schema.leads)
        .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
        .where(
          and(
            eq(schema.bots.clientUserId, user.id),
            eq(schema.leads.botId, bot.id),
            eq(schema.leads.hiddenByLimit, false),
          ),
        )
        .orderBy(desc(schema.leads.capturedAt))
    : []

  return (
    <div className="min-h-screen">
      <AutoRefresh intervalMs={30_000} />
      <TopNav userEmail={user.email} userName={user.name} bots={bots} activeBotId={bot?.id} portalConfig={portalConfig} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[var(--ink)]">Leads</h1>
          <div className="flex items-center gap-2">
            <RefreshButton />
            {leads.length > 0 && canExport && (
              <Button variant="secondary" size="sm" asChild>
                <a href="/api/portal/leads/export" download>
                  <Download className="h-4 w-4 mr-1.5" />
                  Export CSV
                </a>
              </Button>
            )}
          </div>
        </div>

        <LeadsSearch leads={leads} />
      </div>
    </div>
  )
}
