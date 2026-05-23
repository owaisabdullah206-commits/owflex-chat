import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { putObject } from '@/lib/storage/r2'
import { publishJSON } from '@/lib/queue/qstash'
import { createDoc, deleteDocWithCleanup } from '@/lib/db/queries/documents'
import { checkDocumentLimit, checkStorageLimit } from '@/lib/limits'

const MAX_FILE_BYTES    = 10 * 1024 * 1024 // 10 MB for standard docs
const MAX_CATALOG_BYTES = 25 * 1024 * 1024 // 25 MB for CSV / Excel

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf':    'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain':         'txt',
  'text/markdown':      'md',
  'text/csv':           'csv',
  'application/csv':    'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
}

const CATALOG_TYPES = new Set(['text/csv', 'application/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'])

export async function POST(req: NextRequest) {
  let user: Awaited<ReturnType<typeof requireDeveloper>>
  try {
    user = await requireDeveloper()
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 }, { status: 401 })
  }

  const url = new URL(req.url)
  const botId = url.searchParams.get('botId')
  if (!botId) {
    return NextResponse.json({ error: 'botId is required', code: 'VALIDATION_ERROR', status: 400 }, { status: 400 })
  }
  const replaceDocId = url.searchParams.get('replaceDocId') ?? null

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

  const [orgOwner] = await db
    .select({ ownerId: schema.organizations.ownerId })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, botRow.orgId))
    .limit(1)

  if (!orgOwner || orgOwner.ownerId !== user.id) {
    return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN', status: 403 }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data', code: 'VALIDATION_ERROR', status: 400 }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided', code: 'VALIDATION_ERROR', status: 400 }, { status: 400 })
  }

  const mimeType = file.type || 'application/octet-stream'
  const isCatalog = CATALOG_TYPES.has(mimeType)
  const sizeLimit = isCatalog ? MAX_CATALOG_BYTES : MAX_FILE_BYTES
  const sizeMb    = isCatalog ? 25 : 10

  if (file.size > sizeLimit) {
    return NextResponse.json(
      { error: `File exceeds ${sizeMb} MB limit (${(file.size / 1_048_576).toFixed(1)} MB uploaded)`, code: 'FILE_TOO_LARGE', status: 413 },
      { status: 413 },
    )
  }

  if (!ALLOWED_TYPES[mimeType]) {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload PDF, DOCX, TXT, Markdown, CSV, or Excel.', code: 'UNSUPPORTED_TYPE', status: 415 },
      { status: 415 },
    )
  }

  // When overwriting an existing catalog, skip the document count limit
  if (!replaceDocId) {
    const docLimit = await checkDocumentLimit(botRow.orgId, botId, botRow.orgPlan)
    if (!docLimit.allowed) {
      return NextResponse.json(
        { error: `Document limit reached (${docLimit.used}/${docLimit.max}). Upgrade your plan to add more documents.`, code: 'PLAN_LIMIT_EXCEEDED', status: 402 },
        { status: 402 },
      )
    }
  }

  const storageCheck = await checkStorageLimit(botRow.orgId, botRow.orgPlan, file.size)
  if (!storageCheck.allowed) {
    return NextResponse.json(
      { error: `Storage limit reached (${storageCheck.usedMb.toFixed(1)} MB / ${storageCheck.maxMb} MB). Upgrade your plan for more storage.`, code: 'STORAGE_LIMIT_EXCEEDED', status: 402 },
      { status: 402 },
    )
  }

  const ext = ALLOWED_TYPES[mimeType]
  const docId = crypto.randomUUID()
  const storageKey = `org/${botRow.orgId}/bot/${botId}/doc/${docId}.${ext}`

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
    await putObject(storageKey, buffer, mimeType)
  } catch (err) {
    console.error('[upload] R2 putObject failed:', err)
    const detail = !process.env.R2_ENDPOINT
      ? 'R2 storage is not configured (R2_ENDPOINT missing).'
      : `R2 error: ${err instanceof Error ? err.message : String(err)}`
    return NextResponse.json(
      { error: `File storage failed. ${detail}`, code: 'STORAGE_ERROR', status: 500 },
      { status: 500 },
    )
  }

  // Create document record with the pre-generated docId so QStash payload matches DB
  await createDoc({
    id: docId,
    botId,
    orgId: botRow.orgId,
    sourceType: 'file',
    storageKey,
    displayName: file.name,
    mimeType,
    byteSize: file.size,
  })

  try {
    const ingestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/qstash/ingest`
    await publishJSON(ingestUrl, { docId, sourceType: 'file' })
  } catch (err) {
    console.error('[upload] QStash publishJSON failed (doc saved, ingestion not queued):', err)
  }

  // Delete the replaced catalog after the new one is queued
  if (replaceDocId) {
    try {
      await deleteDocWithCleanup(replaceDocId, botId)
    } catch (err) {
      console.error('[upload] replaceDocId cleanup failed:', err)
    }
  }

  return NextResponse.json({ docId, status: 'queued' }, { status: 202 })
}
