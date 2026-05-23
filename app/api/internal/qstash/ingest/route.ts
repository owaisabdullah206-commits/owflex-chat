import { NextRequest, NextResponse } from 'next/server'
import { eq, and, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyQStashSignature } from '@/lib/queue/qstash'
import { getObjectBuffer } from '@/lib/storage/r2'
import { extractText, ParseError } from '@/lib/knowledge/parser'
import { chunkText } from '@/lib/knowledge/chunker'
import { embedTexts, QuotaExhaustedError } from '@/lib/knowledge/embedder'
import { updateDocStatus, bumpDocVersion } from '@/lib/db/queries/documents'
import { cleanDocumentText, cleanMarkdown, removeBoilerplate } from '@/lib/knowledge/cleaner'

// Allow up to 60 s on free Vercel plan (increase to 300 on Pro)
export const maxDuration = 60

interface IngestJob {
  docId: string
  sourceType: 'file' | 'url'
  url?: string
  maxPages?: number
  includePaths?: string[]
  excludePaths?: string[]
  attempt?: number
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('upstash-signature') ?? ''
  const rawBody = await req.text()

  try {
    await verifyQStashSignature(sig, rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let job: IngestJob
  try {
    job = JSON.parse(rawBody) as IngestJob
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { docId } = job

  // Fetch document record
  const [doc] = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, docId))
    .limit(1)

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  await updateDocStatus(docId, 'processing')

  try {
    if (job.sourceType === 'file') {
      await ingestFile(doc)
    } else if (job.sourceType === 'url') {
      await ingestUrl(doc, job.url!, job.maxPages ?? 1, job.includePaths, job.excludePaths)
    } else {
      throw new Error(`Unknown sourceType: ${job.sourceType}`)
    }
  } catch (err) {
    const { errorCode, errorMsg } = classifyError(err)
    await updateDocStatus(docId, 'failed', { errorCode, errorMsg })
    console.error(`[ingest] docId=${docId} failed:`, err)
    // Return 200 so QStash doesn't retry on app-level errors (scanned PDF, etc.)
    // Return 500 only for transient failures so QStash retries
    if (isTransientError(err)) {
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
    return NextResponse.json({ error: errorMsg }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}

async function ingestFile(doc: typeof schema.documents.$inferSelect): Promise<void> {
  if (!doc.storageKey || !doc.mimeType) {
    throw new Error('Document missing storageKey or mimeType')
  }

  const buffer = await getObjectBuffer(doc.storageKey)
  const text = await extractText(buffer, doc.mimeType)
  const cleaned = cleanDocumentText(text)
  const chunks = chunkText(cleaned)

  if (chunks.length === 0) {
    throw new Error('No text content extracted from document')
  }

  await updateDocStatus(doc.id, 'embedding')
  const embeddings = await embedTexts(chunks)

  await updateDocStatus(doc.id, 'finalizing')
  await upsertChunks(doc, chunks, embeddings, 0)
  await updateDocStatus(doc.id, 'ready', { chunkCount: chunks.length })
}

async function ingestUrl(
  doc: typeof schema.documents.$inferSelect,
  url: string,
  maxPages: number,
  includePaths?: string[],
  excludePaths?: string[],
): Promise<void> {
  const { scrapeUrl } = await import('@/lib/knowledge/firecrawl')
  let pages = await scrapeUrl(url, { maxPages, includePaths, excludePaths })
  pages = removeBoilerplate(pages)

  if (pages.length === 0) {
    throw new Error('No pages scraped from URL')
  }

  let totalChunks = 0
  await updateDocStatus(doc.id, 'embedding')
  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const raw = pages[pageIdx].markdown ?? ''
    const text = cleanMarkdown(raw)
    const chunks = chunkText(text)
    if (chunks.length === 0) continue

    const embeddings = await embedTexts(chunks)
    await upsertChunks(doc, chunks, embeddings, pageIdx)
    totalChunks += chunks.length
  }
  await updateDocStatus(doc.id, 'finalizing')

  await updateDocStatus(doc.id, 'ready', {
    chunkCount: totalChunks,
    pageCount: pages.length,
  })
}

async function upsertChunks(
  doc: typeof schema.documents.$inferSelect,
  chunks: string[],
  embeddings: number[][],
  pageIdx: number,
): Promise<void> {
  const version = doc.version

  // Delete old-version chunks for this document atomically before inserting new ones
  await db
    .delete(schema.documentChunks)
    .where(
      and(
        eq(schema.documentChunks.documentId, doc.id),
        sql`${schema.documentChunks.version} < ${version}`,
      ),
    )

  // Insert all new chunks
  const rows = chunks.map((text, chunkIdx) => ({
    documentId: doc.id,
    botId: doc.botId,
    pageIdx,
    chunkIdx,
    version,
    text,
    tokenCount: Math.ceil(text.length / 4),
    embedding: embeddings[chunkIdx],
  }))

  // Insert in batches of 50 to avoid parameter limits
  for (let i = 0; i < rows.length; i += 50) {
    await db.insert(schema.documentChunks).values(rows.slice(i, i + 50))
  }
}

function classifyError(err: unknown): { errorCode: string; errorMsg: string } {
  if (err instanceof ParseError) {
    return { errorCode: err.code, errorMsg: err.message }
  }
  if (err instanceof QuotaExhaustedError) {
    return { errorCode: 'QUOTA_EXHAUSTED', errorMsg: err.message }
  }
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('BLOCKED_BY_ROBOTS')) return { errorCode: 'BLOCKED_BY_ROBOTS', errorMsg: 'Site blocked scraping (robots.txt or 403).' }
  if (msg.includes('SCRAPE_FAILED')) return { errorCode: 'SCRAPE_FAILED', errorMsg: msg }
  return { errorCode: 'INGEST_FAILED', errorMsg: msg }
}

function isTransientError(err: unknown): boolean {
  if (err instanceof QuotaExhaustedError) return true
  if (err instanceof Error && (err.message.includes('network') || err.message.includes('timeout'))) return true
  return false
}
