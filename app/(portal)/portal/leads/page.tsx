import { and, desc, eq } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { TopNav } from '@/components/portal/TopNav'
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
    .select({ id: schema.bots.id, name: schema.bots.name })
    .from(schema.bots)
    .where(eq(schema.bots.clientUserId, user.id))

  const bot = (botParam ? bots.find((b) => b.id === botParam) : null) ?? bots[0] ?? null

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
        })
        .from(schema.leads)
        .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
        .where(
          and(
            eq(schema.bots.clientUserId, user.id),
            eq(schema.leads.botId, bot.id),
          ),
        )
        .orderBy(desc(schema.leads.capturedAt))
    : []

  return (
    <div className="min-h-screen">
      <AutoRefresh intervalMs={30_000} />
      <TopNav userEmail={user.email} bots={bots} activeBotId={bot?.id} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[var(--ink)]">Leads</h1>
          <div className="flex items-center gap-2">
            <RefreshButton />
            {leads.length > 0 && (
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
