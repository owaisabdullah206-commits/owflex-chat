import { NextResponse } from 'next/server'
import { eq, sql, and } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await requireDeveloper()

    const [row] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(schema.conversations)
      .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
      .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
      .where(
        and(
          eq(schema.organizations.ownerId, user.id),
          sql`COALESCE(${schema.conversations.needsHuman}, false) = true`,
        )
      )

    return NextResponse.json({ count: row?.count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
