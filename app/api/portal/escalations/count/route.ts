import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db, schema } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ count: 0 })

    const [row] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(schema.conversations)
      .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
      .where(
        sql`${schema.bots.clientUserId} = ${session.user.id}
          AND COALESCE(${schema.conversations.needsHuman}, false) = true`
      )

    return NextResponse.json({ count: row?.count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
