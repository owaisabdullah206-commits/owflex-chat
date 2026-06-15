import { Redis } from '@upstash/redis'

// Embeddings have two providers, selected by EMBEDDING_PROVIDER:
//   - 'jina' (default): Jina Embeddings v5 text-small via api.jina.ai. Works on
//     serverless (Vercel/Netlify) but the free tier is rate-limited.
//   - 'onnx': local ONNX bge-base-en-v1.5 via @huggingface/transformers. Unlimited
//     and free, but needs a long-running process (the VPS) — it cannot run on a
//     serverless function. Set EMBEDDING_PROVIDER=onnx ONLY on the VPS/Docker host.
//
// Both output 768-dim vectors, so the document_chunks `vector(768)` schema is
// unchanged regardless of provider.
const PROVIDER: 'jina' | 'onnx' = process.env.EMBEDDING_PROVIDER === 'onnx' ? 'onnx' : 'jina'
const DIMENSIONS = 768

export class QuotaExhaustedError extends Error {
  constructor() {
    super('Jina embedding daily quota exhausted. Job will be retried tomorrow.')
    this.name = 'QuotaExhaustedError'
  }
}

// ── ONNX provider (local, VPS only) ───────────────────────────────────────────
// bge-base-en-v1.5: 768 dims, strong retrieval quality. Quantized (q8) so the
// model is ~110MB and fast on CPU. BGE wants a query instruction prefix on the
// QUERY side only; passages are embedded as-is.
const BGE_QUERY_PREFIX = 'Represent this sentence for searching relevant passages: '
const ONNX_BATCH = 32

// Dynamic import so serverless deployments (jina provider) never load the native
// onnxruntime binaries. Singleton: the model loads once per process.
type OnnxExtractor = (
  texts: string[],
  opts: { pooling: 'mean'; normalize: boolean },
) => Promise<{ tolist(): number[][] }>

let onnxExtractor: Promise<OnnxExtractor> | null = null
function getOnnxExtractor(): Promise<OnnxExtractor> {
  onnxExtractor ??= import('@huggingface/transformers').then(
    ({ pipeline }) => pipeline('feature-extraction', 'Xenova/bge-base-en-v1.5', { dtype: 'q8' }),
  ) as unknown as Promise<OnnxExtractor>
  return onnxExtractor
}

async function embedOnnx(texts: string[]): Promise<number[][]> {
  const extractor = await getOnnxExtractor()
  const out = await extractor(texts, { pooling: 'mean', normalize: true })
  const vectors = out.tolist()
  for (const v of vectors) {
    if (v.length !== DIMENSIONS) throw new Error(`Unexpected embedding dimensions: ${v.length}`)
  }
  return vectors
}

// ── Jina provider (API, serverless-friendly) ──────────────────────────────────
const MODEL_NAME = 'jina-embeddings-v5-text-small'
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
    const [embedding] = await embedOnnx([BGE_QUERY_PREFIX + text])
    return embedding
  }
  const [embedding] = await callJina([text], 'retrieval.query')
  return embedding
}
