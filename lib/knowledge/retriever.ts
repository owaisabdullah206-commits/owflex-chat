import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { embedQuery } from '@/lib/knowledge/embedder'
import type { RetrievedChunk } from '@/lib/knowledge/prompt-builder'

// TOP_K = 10: covers up to 10 distinct products per query.
// Was 20 — the extra chunks added ~1,000 input tokens with negligible recall gain.
// For "list all" catalog queries the prompt-builder already surfaces total count.
const DEFAULT_TOP_K = 10
// No minimum threshold — cosine ordering + TOP_K already ensures best matches.
// Generic "list all products" queries score 0.05–0.15 against specific product
// passages, which is too low for any useful floor. We trust TOP_K to cap results.
const DEFAULT_THRESHOLD = 0

// Short patterns that never need RAG:
// greetings, one-word questions, pure punctuation, filler phrases
const SKIP_RAG_PATTERN = /^(hi+|hello+|hey+|salam|salaam|assalam|hola|yo+|sup|ok+|okay|thanks?|thank you|thx|bye+|goodbye|good\s*(morning|evening|afternoon|night)|how are you|who are you|what can you do)\W*$/i

export function shouldSkipRag(query: string): boolean {
  const trimmed = query.trim()
  // Very short messages (≤ 15 chars) almost never need product context
  if (trimmed.length <= 15) return true
  return SKIP_RAG_PATTERN.test(trimmed)
}

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
    LIMIT ${topK * 2}
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
