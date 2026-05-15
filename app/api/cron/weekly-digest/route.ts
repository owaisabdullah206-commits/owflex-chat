import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getWeeklyStats } from '@/lib/db/queries/digest'
import { sendDigestEmail } from '@/lib/email/digest'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all developer users with email set
  const developers = await db
    .select({
      id:    schema.users.id,
      name:  schema.users.name,
      email: schema.users.email,
    })
    .from(schema.users)
    .where(eq(schema.users.role, 'developer'))

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const dev of developers) {
    if (!dev.email) { skipped++; continue }

    const [org] = await db
      .select({ id: schema.organizations.id })
      .from(schema.organizations)
      .where(eq(schema.organizations.ownerId, dev.id))
      .limit(1)

    if (!org) { skipped++; continue }

    try {
      const stats = await getWeeklyStats(org.id)
      await sendDigestEmail({ name: dev.name, email: dev.email }, stats)
      sent++
    } catch (err) {
      errors.push(`${dev.email}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ sent, skipped, errors })
}
