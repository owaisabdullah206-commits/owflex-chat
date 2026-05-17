import { Redis } from '@upstash/redis'

// text-embedding-004 was shut down Jan 14 2026.
// gemini-embedding-001 on v1 supports MRL — outputDimensionality keeps schema-compatible 768-dim vectors.
const MODEL_NAME = 'gemini-embedding-001'
const DIMENSIONS = 768
const DAILY_TOKEN_LIMIT = 1_000_000
const BATCH_SIZE = 100

const EMBED_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:embedContent`

export class QuotaExhaustedError extends Error {
  constructor() {
    super('Gemini embedding daily quota exhausted. Job will be retried tomorrow.')
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
  // rough estimate: 1 token ≈ 4 chars
  return texts.reduce((sum, t) => sum + Math.ceil(t.length / 4), 0)
}

async function trackUsage(tokens: number): Promise<void> {
  const redis = getRedis()
  const key = quotaKey()
  await redis.incrby(key, tokens)
  // TTL 36 h so it covers the full reset window
  await redis.expire(key, 36 * 3600)
}

async function getRemainingQuota(): Promise<number> {
  const redis = getRedis()
  const used = (await redis.get<number>(quotaKey())) ?? 0
  return DAILY_TOKEN_LIMIT - Number(used)
}

async function embedOne(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const res = await fetch(`${EMBED_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${MODEL_NAME}`,
      content: { parts: [{ text }] },
      outputDimensionality: DIMENSIONS,
    }),
  })

  if (res.status === 429) throw new QuotaExhaustedError()

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini embed HTTP ${res.status}: ${body}`)
  }

  const data = (await res.json()) as { embedding: { values: number[] } }
  const values = data.embedding?.values
  if (!Array.isArray(values) || values.length !== DIMENSIONS) {
    throw new Error(`Unexpected embedding dimensions: ${values?.length ?? 0}`)
  }
  return values
}

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
    const batchResults = await Promise.all(batch.map(embedOne))
    results.push(...batchResults)
  }

  await trackUsage(estimated)
  return results
}

export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text])
  return embedding
}
