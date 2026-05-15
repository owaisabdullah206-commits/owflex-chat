import { desc, eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { BotTable } from '@/components/dashboard/BotTable'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export default async function BotsPage() {
  const user = await requireDeveloper()

  const userBots = await db
    .select({
      id: schema.bots.id,
      name: schema.bots.name,
      embedKey: schema.bots.embedKey,
      isActive: schema.bots.isActive,
      createdAt: schema.bots.createdAt,
    })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(eq(schema.organizations.ownerId, user.id))
    .orderBy(desc(schema.bots.createdAt))

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <h1 className="text-lg font-semibold text-[var(--ink)]">Bots</h1>
            <p className="text-sm text-[var(--ink-muted)] mt-0.5">Manage your AI chatbots</p>
          </div>
          <Button asChild>
            <a href="/dashboard/bots/new">Create bot</a>
          </Button>
        </div>

        {userBots.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-[var(--ink-muted)]" />
            </div>
            <h2 className="text-base font-semibold text-[var(--ink)] mb-1">No bots yet</h2>
            <p className="text-sm text-[var(--ink-muted)] text-center max-w-xs mb-5">
              Create your first bot and get an embed script to drop on any website.
            </p>
            <Button asChild>
              <a href="/dashboard/bots/new">Create your first bot</a>
            </Button>
          </div>
        ) : (
          <div className="px-4 sm:px-8 py-6 overflow-x-auto">
            <BotTable bots={userBots} />
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
