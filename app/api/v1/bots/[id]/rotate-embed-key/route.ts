import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { generateEmbedKey } from '@/lib/bots/embed-key'

// Rotate a bot's embed key. The old key stays valid for a 24h grace window
// (see embedKeyMatch) so deployed widgets keep working while the developer
// pushes the new key to production. Tenant isolation: the bot must belong to
// an organization owned by the caller.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 },
      { status: 401 },
    )
  }

  const { id } = await params

  const [bot] = await db
    .select({ id: schema.bots.id, embedKey: schema.bots.embedKey })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, id), eq(schema.organizations.ownerId, session.user.id)))
    .limit(1)

  if (!bot) {
    return NextResponse.json(
      { error: 'Bot not found', code: 'NOT_FOUND', status: 404 },
      { status: 404 },
    )
  }

  const newKey = generateEmbedKey()
  await db
    .update(schema.bots)
    .set({
      embedKey:          newKey,
      previousEmbedKey:  bot.embedKey,
      embedKeyRotatedAt: new Date(),
    })
    .where(eq(schema.bots.id, bot.id))

  return NextResponse.json({ success: true, embedKey: newKey })
}
