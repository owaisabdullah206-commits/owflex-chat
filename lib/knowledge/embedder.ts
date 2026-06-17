import { Redis } from '@upstash/redis'

// Embeddings have two providers, selected by EMBEDDING_PROVIDER:
//   - 'jina' (default): Jina Embeddings v5 text-small via api.jina.ai. Works on
//     serverless (Vercel/Netlify) but the free tier is rate-limited.
//   - 'onnx': local ONNX BGE-M3 via @huggingface/transformers. Unlimited and free,
//     multilingual (English + Urdu + Roman Urdu), 1024-dim. Needs a long-running
//     process (the VPS). Set EMBEDDING_PROVIDER=onnx ONLY on the VPS/Docker host.
//
// Both providers output 1024-dim. document_chunks schema is `vector(1024)` — migration 0014.
const PROVIDER: 'jina' | 'onnx' = process.env.EMBEDDING_PROVIDER === 'onnx' ? 'onnx' : 'jina'
const DIMENSIONS = 1024

export class QuotaExhaustedError extends Error {
  constructor() {
    super('Jina embedding daily quota exhausted. Job will be retried tomorrow.')
    this.name = 'QuotaExhaustedError'
  }
}

// ── ONNX provider (local, VPS only) ───────────────────────────────────────────
// BGE-M3: 1024 dims, multilingual (English + Urdu + Roman Urdu). Uses CLS pooling.
// Quantized (q8) ≈ 570 MB on disk; downloads once into the Docker volume.
// No query-side prefix needed — BGE-M3 handles retrieval without instruction tuning.
const ONNX_BATCH = 32

// Dynamic import so serverless deployments (jina provider) never load the native
// onnxruntime binaries. Singleton: the model loads once per process.
type OnnxExtractor = (
  texts: string[],
  opts: { pooling: 'cls'; normalize: boolean },
) => Promise<{ tolist(): number[][] }>

let onnxExtractor: Promise<OnnxExtractor> | null = null
function getOnnxExtractor(): Promise<OnnxExtractor> {
  onnxExtractor ??= import('@huggingface/transformers').then(
    ({ pipeline }) => pipeline('feature-extraction', 'Xenova/bge-m3', { dtype: 'q8' }),
  ) as unknown as Promise<OnnxExtractor>
  return onnxExtractor
}

async function embedOnnx(texts: string[]): Promise<number[][]> {
  const extractor = await getOnnxExtractor()
  const out = await extractor(texts, { pooling: 'cls', normalize: true })
  const vectors = out.tolist()
  for (const v of vectors) {
    if (v.length !== DIMENSIONS) throw new Error(`Unexpected embedding dimensions: ${v.length}`)
  }
  return vectors
}

// ── Jina provider (API, serverless-friendly) ──────────────────────────────────
// jina-embeddings-v3 outputs 1024 dims natively — matches the BGE-M3 schema.
const MODEL_NAME = 'jina-embeddings-v3'
const DAILY_TOKEN_LIMIT = 1_000_000
const BATCH_SIZE = 100
const EMBED_URL = 'https://api.jina.ai/v1/embeddings'

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

// ── Public interface (provider-agnostic) ──────────────────────────────────────

// Used for indexing document chunks (passage side).
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  if (PROVIDER === 'onnx') {
    const results: number[][] = []
    for (let i = 0; i < texts.length; i += ONNX_BATCH) {
      results.push(...(await embedOnnx(texts.slice(i, i + ONNX_BATCH))))
    }
    return results
  }

  const estimated = await estimateTokens(texts)
  const remaining = await getRemainingQuota()
  if (estimated > remaining) {
    throw new QuotaExhaustedError()
  }

  const results: number[][] = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    results.push(...(await callJina(batch, 'retrieval.passage')))
  }

  await trackUsage(estimated)
  return results
}

// Used for user queries at chat time (query side).
export async function embedQuery(text: string): Promise<number[]> {
  if (PROVIDER === 'onnx') {
    const [embedding] = await embedOnnx([text])
    return embedding
  }
  const [embedding] = await callJina([text], 'retrieval.query')
  return embedding
}
