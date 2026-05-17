import { desc, eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { PLAN_LIMITS } from '@/lib/limits'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { BotTable } from '@/components/dashboard/BotTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function BotsPage() {
  const user = await requireDeveloper()

  const [org, userBots] = await Promise.all([
    db
      .select({ plan: schema.organizations.plan })
      .from(schema.organizations)
      .where(eq(schema.organizations.ownerId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({
        id: schema.bots.id,
        name: schema.bots.name,
        embedKey: schema.bots.embedKey,
        isActive: schema.bots.isActive,
        createdAt: schema.bots.createdAt,
        clientEmail: schema.users.email,
      })
      .from(schema.bots)
      .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
      .leftJoin(schema.users, eq(schema.bots.clientUserId, schema.users.id))
      .where(eq(schema.organizations.ownerId, user.id))
      .orderBy(desc(schema.bots.createdAt)),
  ])

  const planKey = ((org?.plan ?? 'free') in PLAN_LIMITS ? org?.plan ?? 'free' : 'free') as keyof typeof PLAN_LIMITS
  const botLimit = PLAN_LIMITS[planKey].bots
  const atLimit = botLimit !== Infinity && userBots.length >= botLimit

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        {/* Page header */}
        <div className="flex items-start justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <div
              className="flex items-center gap-1 mb-0.5 text-[10px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span>dashboard</span>
              <span className="opacity-40">/</span>
              <span className="text-[var(--ink-muted)]">bots</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--ink)] leading-tight">Bots</h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="text-[var(--of-primary)]">{userBots.length}</span>
              <span className="text-[var(--ink-subtle)]">/{botLimit === Infinity ? '∞' : botLimit}</span>
              {' '}bots · {org?.plan ?? 'free'} plan
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {atLimit ? (
              <Button disabled title="Upgrade your plan to add more bots" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New bot
              </Button>
            ) : (
              <Button asChild size="sm">
                <a href="/dashboard/bots/new">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  New bot
                </a>
              </Button>
            )}
          </div>
        </div>

        {userBots.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-8">
            <div
              className="text-[32px] font-semibold text-[var(--ink-subtle)] mb-3 leading-none"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
            >
              0
            </div>
            <p
              className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-1"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              bots.total
            </p>
            <p className="text-sm text-[var(--ink-muted)] text-center max-w-xs mb-6 mt-3">
              Create your first bot and get an embed script to drop on any website.
            </p>
            <Button asChild>
              <a href="/dashboard/bots/new">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create your first bot
              </a>
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
