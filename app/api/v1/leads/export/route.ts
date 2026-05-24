import { NextRequest } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'

function csvField(val: string | null | undefined): string {
  if (val === null || val === undefined) return ''
  let escaped = val.replace(/"/g, '""')
  // Prevent CSV/spreadsheet formula injection (Excel, Google Sheets)
  if (/^[=+@\-|%]/.test(escaped)) escaped = "'" + escaped
  return `"${escaped}"`
}

export async function GET(_req: NextRequest) {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id, name: schema.organizations.name })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) {
    return new Response('No organization found', { status: 404 })
  }

  const leads = await db
    .select({
      name: schema.leads.name,
      email: schema.leads.email,
      phone: schema.leads.phone,
      notes: schema.leads.notes,
      capturedAt: schema.leads.capturedAt,
      botName: schema.bots.name,
    })
    .from(schema.leads)
    .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(
      and(
        eq(schema.organizations.ownerId, user.id),
        eq(schema.leads.hiddenByLimit, false),
      ),
    )
    .orderBy(desc(schema.leads.capturedAt))

  const header = 'name,email,phone,notes,bot,date\n'
  const rows = leads
    .map((lead) =>
      [
        csvField(lead.name),
        csvField(lead.email),
        csvField(lead.phone),
        csvField(lead.notes),
        csvField(lead.botName),
        csvField(new Date(lead.capturedAt).toISOString()),
      ].join(','),
    )
    .join('\n')

  const csv = header + rows
  const filename = `leads-${org.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
