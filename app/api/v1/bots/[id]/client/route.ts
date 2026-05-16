import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireDeveloper()
  const { id } = await params

  const [bot] = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, id), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!bot) {
    return NextResponse.json(
      { error: 'Not authorized', code: 'NOT_AUTHORIZED', status: 403 },
      { status: 403 },
    )
  }

  await db
    .update(schema.bots)
    .set({ clientUserId: null })
    .where(eq(schema.bots.id, id))

  return NextResponse.json({ success: true })
}
