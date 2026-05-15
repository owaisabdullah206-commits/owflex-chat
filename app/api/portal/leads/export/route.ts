import { NextRequest } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { requireClient } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'

function csvField(val: string | null | undefined): string {
  if (val === null || val === undefined) return ''
  const escaped = val.replace(/"/g, '""')
  return `"${escaped}"`
}

export async function GET(_req: NextRequest) {
  const user = await requireClient()

  const [bot] = await db
    .select({ id: schema.bots.id, name: schema.bots.name })
    .from(schema.bots)
    .where(eq(schema.bots.clientUserId, user.id))
    .limit(1)

  if (!bot) {
    return new Response('No bot assigned', { status: 404 })
  }

  const leads = await db
    .select({
      name: schema.leads.name,
      email: schema.leads.email,
      phone: schema.leads.phone,
      notes: schema.leads.notes,
      capturedAt: schema.leads.capturedAt,
    })
    .from(schema.leads)
    .innerJoin(schema.bots, eq(schema.leads.botId, schema.bots.id))
    .where(and(eq(schema.bots.clientUserId, user.id), eq(schema.leads.botId, bot.id)))
    .orderBy(desc(schema.leads.capturedAt))

  const header = 'name,email,phone,notes,date\n'
  const rows = leads
    .map((lead) =>
      [
        csvField(lead.name),
        csvField(lead.email),
        csvField(lead.phone),
        csvField(lead.notes),
        csvField(new Date(lead.capturedAt).toISOString()),
      ].join(','),
    )
    .join('\n')

  const csv = header + rows
  const filename = `leads-${bot.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
