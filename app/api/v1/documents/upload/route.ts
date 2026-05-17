import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { putObject } from '@/lib/storage/r2'
import { publishJSON } from '@/lib/queue/qstash'
import { createDoc } from '@/lib/db/queries/documents'
import { checkDocumentLimit, checkStorageLimit } from '@/lib/limits'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'md',
}

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

  // Ensure the authenticated user owns this bot's org
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

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File exceeds 10 MB limit (${(file.size / 1_048_576).toFixed(1)} MB uploaded)`, code: 'FILE_TOO_LARGE', status: 413 },
      { status: 413 },
    )
  }

  const mimeType = file.type || 'application/octet-stream'
  if (!ALLOWED_TYPES[mimeType]) {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload PDF, DOCX, TXT, or Markdown.', code: 'UNSUPPORTED_TYPE', status: 415 },
      { status: 415 },
    )
  }

  // Check document count limit
  const docLimit = await checkDocumentLimit(botRow.orgId, botId, botRow.orgPlan)
  if (!docLimit.allowed) {
    return NextResponse.json(
      { error: `Document limit reached (${docLimit.used}/${docLimit.max}). Upgrade your plan to add more documents.`, code: 'PLAN_LIMIT_EXCEEDED', status: 402 },
      { status: 402 },
    )
  }

  // Check storage limit
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

  // Upload to R2
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

  // Create document record
  await createDoc({
    botId,
    orgId: botRow.orgId,
    sourceType: 'file',
    storageKey,
    displayName: file.name,
    mimeType,
    byteSize: file.size,
  })

  // Enqueue ingestion job — non-blocking: doc is saved, reindex button covers failures
  try {
    const ingestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/qstash/ingest`
    await publishJSON(ingestUrl, { docId, sourceType: 'file' })
  } catch (err) {
    console.error('[upload] QStash publishJSON failed (doc saved, ingestion not queued):', err)
  }

  return NextResponse.json({ docId, status: 'queued' }, { status: 202 })
}
