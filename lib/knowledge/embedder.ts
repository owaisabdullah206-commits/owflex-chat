import { Redis } from '@upstash/redis'

// Jina Embeddings v3 — free tier (1M tokens/month), supports dimensions=768 via Matryoshka,
// task-specific LoRA adapters improve RAG quality (passage vs query distinction).
const MODEL_NAME = 'jina-embeddings-v3'
const DIMENSIONS = 768
const DAILY_TOKEN_LIMIT = 1_000_000
const BATCH_SIZE = 100

const EMBED_URL = 'https://api.jina.ai/v1/embeddings'

export class QuotaExhaustedError extends Error {
  constructor() {
    super('Jina embedding daily quota exhausted. Job will be retried tomorrow.')
    this.name = 'QuotaExhaustedError'
  }
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

function quotaKey(): string {
  const d = new Date()
  return `embedding_quota:${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

async function estimateTokens(texts: string[]): Promise<number> {
  return texts.reduce((sum, t) => sum + Math.ceil(t.length / 4), 0)
}

async function trackUsage(tokens: number): Promise<void> {
  const redis = getRedis()
  const key = quotaKey()
  await redis.incrby(key, tokens)
  await redis.expire(key, 36 * 3600)
}

async function getRemainingQuota(): Promise<number> {
  const redis = getRedis()
  const used = (await redis.get<number>(quotaKey())) ?? 0
  return DAILY_TOKEN_LIMIT - Number(used)
}

async function callJina(texts: string[], task: 'retrieval.passage' | 'retrieval.query'): Promise<number[][]> {
  const apiKey = process.env.JINA_API_KEY
  if (!apiKey) throw new Error('JINA_API_KEY is not set')

  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      input: texts,
      task,
      dimensions: DIMENSIONS,
    }),
  })

  if (res.status === 429) throw new QuotaExhaustedError()

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Jina embed HTTP ${res.status}: ${body}`)
  }

  const data = (await res.json()) as { data: { embedding: number[]; index: number }[] }
  const sorted = data.data.sort((a, b) => a.index - b.index)

  for (const item of sorted) {
    if (!Array.isArray(item.embedding) || item.embedding.length !== DIMENSIONS) {
      throw new Error(`Unexpected embedding dimensions: ${item.embedding?.length ?? 0}`)
    }
  }

  return sorted.map((item) => item.embedding)
}

// Used for indexing document chunks
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const estimated = await estimateTokens(texts)
  const remaining = await getRemainingQuota()
  if (estimated > remaining) {
    throw new QuotaExhaustedError()
  }

  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchResults = await callJina(batch, 'retrieval.passage')
    results.push(...batchResults)
  }

  await trackUsage(estimated)
  return results
}

// Used for user queries at chat time
export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await callJina([text], 'retrieval.query')
  return embedding
}
