import { NextRequest, NextResponse } from 'next/server'
import { and, eq, or } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

const CATALOG_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]

export async function GET(req: NextRequest) {
  let user: Awaited<ReturnType<typeof requireDeveloper>>
  try {
    user = await requireDeveloper()
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 }, { status: 401 })
  }

  const botId = new URL(req.url).searchParams.get('botId')
  if (!botId) {
    return NextResponse.json({ error: 'botId is required', code: 'VALIDATION_ERROR', status: 400 }, { status: 400 })
  }

  // Verify ownership
  const [botRow] = await db
    .select({ orgId: schema.bots.orgId })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!botRow) {
    return NextResponse.json({ error: 'Bot not found or access denied', code: 'NOT_FOUND', status: 404 }, { status: 404 })
  }

  // Find the most recent product catalog document for this bot
  const [existing] = await db
    .select({
      docId: schema.documents.id,
      displayName: schema.documents.displayName,
      mimeType: schema.documents.mimeType,
      status: schema.documents.status,
    })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.botId, botId),
        or(...CATALOG_MIME_TYPES.map(t => eq(schema.documents.mimeType, t))),
      ),
    )
    .orderBy(schema.documents.createdAt)
    .limit(1)

  if (!existing) {
    return NextResponse.json({ catalog: null })
  }

  return NextResponse.json({
    catalog: {
      docId: existing.docId,
      displayName: existing.displayName,
      mimeType: existing.mimeType,
      status: existing.status,
    },
  })
}
