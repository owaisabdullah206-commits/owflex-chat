import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'

const MODEL_NAME = 'text-embedding-004'
const DIMENSIONS = 768
const DAILY_TOKEN_LIMIT = 1_000_000
const BATCH_SIZE = 100

export class QuotaExhaustedError extends Error {
  constructor() {
    super('Gemini embedding daily quota exhausted. Job will be retried tomorrow.')
    this.name = 'QuotaExhaustedError'
  }
}

function getGenAI(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
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

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const estimated = await estimateTokens(texts)
  const remaining = await getRemainingQuota()
  if (estimated > remaining) {
    throw new QuotaExhaustedError()
  }

  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map((text) => model.embedContent(text)),
    )
    for (const res of batchResults) {
      const values = res.embedding.values
      if (values.length !== DIMENSIONS) {
        throw new Error(`Unexpected embedding dimensions: ${values.length}`)
      }
      results.push(values)
    }
  }

  await trackUsage(estimated)
  return results
}

export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text])
  return embedding
}
