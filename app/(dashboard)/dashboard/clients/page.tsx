import { desc, eq, isNotNull, and } from 'drizzle-orm'
import { Users } from 'lucide-react'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { RelativeTime } from '@/components/shared/RelativeTime'

export default async function ClientsPage() {
  const user = await requireDeveloper()

  const clients = await db
    .select({
      clientEmail: schema.users.email,
      clientName: schema.users.name,
      botId: schema.bots.id,
      botName: schema.bots.name,
      joinedAt: schema.invitations.usedAt,
    })
    .from(schema.bots)
    .innerJoin(schema.users, eq(schema.bots.clientUserId, schema.users.id))
    .leftJoin(
      schema.invitations,
      and(
        eq(schema.invitations.botId, schema.bots.id),
        isNotNull(schema.invitations.usedAt),
      ),
    )
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(eq(schema.organizations.ownerId, user.id))
    .orderBy(desc(schema.invitations.usedAt))

  // Deduplicate: one row per bot (multiple invitations may match)
  const seen = new Set<string>()
  const rows = clients.filter((r) => {
    if (seen.has(r.botId)) return false
    seen.add(r.botId)
    return true
  })

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-[var(--ink)]">Clients</h1>
              <span className="text-xs text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {rows.length} {rows.length === 1 ? 'client' : 'clients'}
              </span>
            </div>
            <p className="text-sm text-[var(--ink-muted)] mt-0.5">
              All active client accounts across your bots
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-[var(--ink-muted)]" />
            </div>
            <h2 className="text-base font-semibold text-[var(--ink)] mb-1">No clients yet</h2>
            <p className="text-sm text-[var(--ink-muted)] text-center max-w-xs mb-5">
              Invite a client from any bot&apos;s detail page to get started.
            </p>
            <a
              href="/dashboard/bots"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
            >
              Go to Bots
            </a>
          </div>
        ) : (
          <div className="px-4 sm:px-8 py-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Bot</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.botId}>
                    <TableCell className="font-medium text-[var(--ink)]">
                      {row.clientEmail}
                    </TableCell>
                    <TableCell className="text-[var(--ink-muted)]">
                      {row.clientName || '—'}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/dashboard/bots/${row.botId}`}
                        className="text-[var(--of-primary-text-dark)] hover:underline underline-offset-2 text-sm"
                      >
                        {row.botName}
                      </a>
                    </TableCell>
                    <TableCell className="text-[var(--ink-muted)]">
                      {row.joinedAt ? <RelativeTime date={row.joinedAt} /> : '—'}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/dashboard/bots/${row.botId}?tab=overview`}
                        className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-2 transition-colors"
                      >
                        View Bot
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
