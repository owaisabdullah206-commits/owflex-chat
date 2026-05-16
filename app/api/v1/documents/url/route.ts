import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { publishJSON } from '@/lib/queue/qstash'
import { createDoc } from '@/lib/db/queries/documents'
import { checkDocumentLimit, checkCrawlLimit } from '@/lib/limits'

const bodySchema = z.object({
  botId:    z.string().min(1),
  url:      z.string().url(),
  maxPages: z.number().int().min(1).max(50).default(1),
})

export async function POST(req: NextRequest) {
  let user: Awaited<ReturnType<typeof requireDeveloper>>
  try {
    user = await requireDeveloper()
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'INVALID_JSON', status: 400 }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const { botId, url, maxPages } = parsed.data

  // Verify bot ownership + get org
  const [botRow] = await db
    .select({ orgId: schema.bots.orgId, orgPlan: schema.organizations.plan })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(eq(schema.bots.id, botId))
    .limit(1)

  if (!botRow) {
    return NextResponse.json({ error: 'Bot not found', code: 'NOT_FOUND', status: 404 }, { status: 404 })
  }

  // Tenant isolation
  const [orgOwner] = await db
    .select({ ownerId: schema.organizations.ownerId })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, botRow.orgId))
    .limit(1)

  if (!orgOwner || orgOwner.ownerId !== user.id) {
    return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN', status: 403 }, { status: 403 })
  }

  // Check document count limit
  const docLimit = await checkDocumentLimit(botRow.orgId, botId, botRow.orgPlan)
  if (!docLimit.allowed) {
    return NextResponse.json(
      { error: `Document limit reached (${docLimit.used}/${docLimit.max}). Upgrade your plan to add more documents.`, code: 'PLAN_LIMIT_EXCEEDED', status: 402 },
      { status: 402 },
    )
  }

  // Check crawl page limit
  const crawlLimit = await checkCrawlLimit(botRow.orgId, botId, botRow.orgPlan, maxPages)
  if (!crawlLimit.allowed) {
    return NextResponse.json(
      { error: `Crawl page limit reached (${crawlLimit.used}/${crawlLimit.max} pages used). Upgrade your plan to crawl more pages.`, code: 'PLAN_LIMIT_EXCEEDED', status: 402 },
      { status: 402 },
    )
  }

  // Create document record (no storageKey for URLs)
  const { id: docId } = await createDoc({
    botId,
    orgId: botRow.orgId,
    sourceType: 'url',
    sourceUrl: url,
    displayName: url,
    mimeType: 'text/html',
    byteSize: 0,
  })

  // Enqueue ingestion job
  const ingestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/qstash/ingest`
  await publishJSON(ingestUrl, { docId, sourceType: 'url', url, maxPages })

  return NextResponse.json({ docId, status: 'queued' }, { status: 202 })
}
