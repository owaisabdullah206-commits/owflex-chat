import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { embedQuery } from '@/lib/knowledge/embedder'
import type { RetrievedChunk } from '@/lib/knowledge/prompt-builder'

const DEFAULT_TOP_K = 4
const DEFAULT_THRESHOLD = 0.65

export async function retrieveContext(
  botId: string,
  query: string,
  opts?: { topK?: number; threshold?: number },
): Promise<RetrievedChunk[]> {
  if (process.env.KNOWLEDGE_BASE_ENABLED === 'false') return []

  const topK = opts?.topK ?? DEFAULT_TOP_K
  const threshold = opts?.threshold ?? DEFAULT_THRESHOLD

  const queryVector = await embedQuery(query)

  const result = await db.execute<{
    id: string
    document_id: string
    text: string
    score: number
  }>(sql`
    SELECT
      id,
      document_id,
      text,
      1 - (embedding <=> ${JSON.stringify(queryVector)}::vector) AS score
    FROM document_chunks
    WHERE bot_id = ${botId}
      AND version = (
        SELECT MAX(version)
        FROM document_chunks dc2
        WHERE dc2.document_id = document_chunks.document_id
      )
    ORDER BY embedding <=> ${JSON.stringify(queryVector)}::vector
    LIMIT 8
  `)

  const filtered = result.rows
    .filter((r) => Number(r.score) >= threshold)
    .slice(0, topK)

  // dedup by text content
  const seen = new Set<string>()
  const deduped: RetrievedChunk[] = []
  for (const row of filtered) {
    const key = row.text.trim()
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push({
        id: row.id,
        documentId: row.document_id,
        text: row.text,
        score: Number(row.score),
      })
    }
  }

  return deduped
}
