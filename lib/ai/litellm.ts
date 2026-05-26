export const CLASSIFIER_MODEL = 'deepseek/deepseek-v4-flash'
export const STRONG_MODEL = 'anthropic/claude-haiku-4-5-20251001'
export const FALLBACK_MODEL = 'deepseek/deepseek-v4-flash'

// ── Per-model provider routing for OpenRouter ─────────────────────────────────
// Provider names must match OpenRouter's display names exactly.
// Sources: live tok/s logs + OpenRouter provider stats pages.
//
//  order          — preferred providers tried left-to-right
//  ignore         — never route here regardless of load
//  allow_fallbacks— true: if all ordered providers fail, fall through to pool
// ─────────────────────────────────────────────────────────────────────────────
const PROVIDER_ROUTING: Record<string, {
  order?:           string[]
  ignore?:          string[]
  allow_fallbacks?: boolean
}> = {
  // OR stats (2026-05-26): Alibaba TTFT 0.72s/83tps, NovitaAI 1.37s/60tps,
  // AtlasCloud 1.07s/59tps, SiliconFlow 1.69s/62tps — all solid.
  // GMICloud TTFT 7.34s → instant disqualify (moved to ignore).
  // StreamLake 92.9% uptime, Morph 74.1% uptime → both ignored.
  // Venice capped at 32.8K output → ignore.
  // Parasail live log: 6.9 tok/s run (17s reply). DeepInfra/AkashML/Baidu too slow.
  'deepseek/deepseek-v4-flash': {
    order:  ['Alibaba Cloud', 'NovitaAI', 'AtlasCloud', 'SiliconFlow'],
    ignore: ['Parasail', 'DeepInfra', 'AkashML', 'Baidu Qianfan', 'GMICloud', 'Morph', 'Venice', 'StreamLake'],
    allow_fallbacks: true,
  },

  // EU vertex: TTFT 0.41s, E2E 1.21s, 127 tok/s — nearly 2× faster E2E than AI Studio.
  'google/gemini-2.5-flash-lite': {
    order:  ['Google Vertex (EU)', 'Google AI Studio', 'Google Vertex'],
    allow_fallbacks: true,
  },

  // NovitaAI cheapest + fast (125 tps, $0.25/M out). Groq fastest TTFT (0.21s, 330 tps).
  // Cerebras going away 2026-05-27. SiliconFlow/Bedrock/DekaLLM too slow or unreliable.
  'openai/gpt-oss-120b': {
    order:  ['NovitaAI', 'Groq', 'Google Vertex', 'Weights & Biases', 'Nebius Token Factory', 'DeepInfra Turbo'],
    ignore: ['SiliconFlow', 'DekaLLM', 'Amazon Bedrock', 'Cerebras', 'SambaNova Dedicated'],
    allow_fallbacks: true,
  },

  // Cloudflare E2E 1.04s (best). Google Vertex E2E 1.11s + 99.9% uptime.
  // Venice caps at 8.2K output — too small. NovitaAI/SiliconFlow 2s+ latency.
  'google/gemma-4-31b-it': {
    order:  ['Cloudflare', 'Google Vertex'],
    ignore: ['SiliconFlow', 'NovitaAI', 'Venice', 'NextBit', 'DekaLLM'],
    allow_fallbacks: true,
  },

  // Mistral's own infra is by far the best: 0.30s TTFT, 81 tok/s, 99.9% uptime.
  'mistralai/mistral-nemo': {
    order:  ['Mistral'],
    ignore: ['NovitaAI', 'DekaLLM'],
    allow_fallbacks: true,
  },

  // Weights & Biases: E2E 1.07s, 78 tok/s, 100% uptime.
  // Together: 26.39s latency — instant disqualify. Cerebras going away 2026-05-27.
  'qwen/qwen3-235b-a22b-2507': {
    order:  ['Weights & Biases', 'Alibaba Cloud', 'AtlasCloud', 'Google Vertex'],
    ignore: ['Together', 'StreamLake', 'Cerebras'],
    allow_fallbacks: true,
  },

  // Cloudflare only sane choice: E2E 0.92s. Others: Venice/Z.ai/NovitaAI all <75% uptime.
  'z-ai/glm-4.7-flash': {
    order:  ['Cloudflare'],
    ignore: ['Venice', 'Z.ai', 'NovitaAI', 'DeepInfra'],
    allow_fallbacks: true,
  },

  // Google Vertex (US): TTFT 0.43s avg, E2E 1.85s avg (best). Vertex EU: 100% uptime
  // but E2E 2.62s. Anthropic direct: TTFT 0.72s, 70tps, 99.9% uptime — solid third.
  // Bedrock (Global): only 41tps, E2E 3.13s → skip.
  'anthropic/claude-haiku-4-5-20251001': {
    order:  ['Google Vertex', 'Google Vertex (Europe)', 'Anthropic'],
    ignore: ['Amazon Bedrock (Global)'],
    allow_fallbacks: true,
  },

  // OpenAI direct: TTFT 0.62s avg, 31tps avg, E2E 2.20s, 99.6% uptime.
  // Azure: TTFT 2.64–3.66s, 8tps, 94–95.5% uptime → instant disqualify.
  'openai/gpt-4o-mini': {
    order:  ['OpenAI'],
    ignore: ['Azure'],
    allow_fallbacks: true,
  },

  // W&B: E2E 0.65s (best), 32tps avg, 100% uptime, 128K max output.
  // DeepInfra Turbo: TTFT 0.16s listed, 17tps avg, 99.9%.
  // Bedrock: $0.72/M (2× price), max output 8.2K only → ignore.
  'meta-llama/llama-3.1-70b-instruct': {
    order:  ['Weights & Biases', 'DeepInfra Turbo', 'DeepInfra'],
    ignore: ['Amazon Bedrock'],
    allow_fallbacks: true,
  },

  // Groq: 150tps avg, E2E 0.66s (best), 99.6% uptime — cheapest fast option.
  // W&B: 38tps avg, E2E 0.85s, 99.3% uptime. AkashML: 37tps, 99.6%.
  // SambaNova/SambaNova Turbo: max output 3.1K only → unusable.
  // Cloudflare: context capped at 24K. Together: max output 2K + TTFT 1.21s.
  'meta-llama/llama-3.3-70b-instruct': {
    order:  ['Groq', 'Weights & Biases', 'AkashML', 'NovitaAI'],
    ignore: ['SambaNova', 'SambaNova Turbo', 'Cloudflare', 'Together'],
    allow_fallbacks: true,
  },

  // Groq: 204tps avg, E2E 0.48s, 100% uptime — fastest small model on the market.
  // W&B: TTFT 0.15s avg, 124tps avg, E2E 0.55s, 100% uptime — excellent backup.
  // Cerebras: going away 2026-05-27 → ignore. NovitaAI: 75.1% uptime → ignore.
  // Cloudflare: only 9tps, 92% uptime → ignore.
  'meta-llama/llama-3.1-8b-instruct': {
    order:  ['Groq', 'Weights & Biases', 'DeepInfra'],
    ignore: ['Cerebras', 'NovitaAI', 'Cloudflare'],
    allow_fallbacks: true,
  },
}

/** Returns the OpenRouter `provider` routing object for a given model, or undefined. */
function getProviderRouting(model: string) {
  return PROVIDER_ROUTING[model] ?? undefined
}

export const SUPPORTED_MODELS = [
  'deepseek/deepseek-v4-flash',
  'google/gemini-2.5-flash-lite',
  'openai/gpt-4o-mini',
  'openai/gpt-oss-120b',
  'anthropic/claude-haiku-4-5-20251001',
  'openrouter/owl-alpha',
  'google/gemma-4-31b-it',
  'mistralai/mistral-nemo',
  'qwen/qwen3-235b-a22b-2507',
  'z-ai/glm-4.7-flash',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.3-70b-instruct',
  'meta-llama/llama-3.1-8b-instruct',
  'tencent/hy3-preview',
] as const

export type SupportedModel = (typeof SUPPORTED_MODELS)[number]

// ── OpenRouter canonical ID overrides ────────────────────────────────────────
// Most model IDs match exactly. Only entries here where OR's /api/v1/models
// returns a different ID than what we pass to the chat endpoint.
// Used by admin.ts refreshModelPrices — add new overrides here, nowhere else.
export const OR_CANONICAL_IDS: Partial<Record<SupportedModel, string[]>> = {
  // OR uses dots + strips date suffix on the /models list
  'anthropic/claude-haiku-4-5-20251001': ['anthropic/claude-haiku-4.5'],
}

/** Returns the OpenRouter canonical IDs for a model (falls back to [modelId]). */
export function getOrCanonicalIds(model: SupportedModel): string[] {
  return OR_CANONICAL_IDS[model] ?? [model]
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

interface ChatCompletionParams {
  systemPrompt: string
  messages: ChatMessage[]
  model?: string
}

interface ChatCompletionResult {
  content: string
  tokensUsed: number
  inputTokens: number
  outputTokens: number
  modelUsed: string
}

export async function chatCompletion({
  systemPrompt,
  messages,
  model,
}: ChatCompletionParams): Promise<ChatCompletionResult> {
  const resolvedModel =
    model ?? process.env.LITELLM_DEFAULT_MODEL ?? 'deepseek/deepseek-v4-flash'

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://octively.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:    resolvedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      ...(getProviderRouting(resolvedModel) ? { provider: getProviderRouting(resolvedModel) } : {}),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM request failed (${response.status}): ${errorText}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
    model?: string
  }

  const content = data.choices[0]?.message?.content ?? ''
  const inputTokens = data.usage?.prompt_tokens ?? 0
  const outputTokens = data.usage?.completion_tokens ?? 0
  const tokensUsed = data.usage?.total_tokens ?? (inputTokens + outputTokens)
  const modelUsed = data.model ?? resolvedModel

  return { content, tokensUsed, inputTokens, outputTokens, modelUsed }
}

// ── Streaming ──────────────────────────────────────────────────────────────────

export type StreamEvent =
  | { type: 'token'; delta: string }
  | { type: 'done'; content: string; tokensUsed: number; inputTokens: number; outputTokens: number; modelUsed: string }

interface StreamingChatParams {
  systemPrompt: string
  messages: ChatMessage[]
  model?: string
}

export async function* chatCompletionStreamGen({
  systemPrompt,
  messages,
  model,
}: StreamingChatParams): AsyncGenerator<StreamEvent> {
  const resolvedModel = model ?? process.env.LITELLM_DEFAULT_MODEL ?? 'deepseek/deepseek-v4-flash'

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://octively.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:          resolvedModel,
      stream:         true,
      stream_options: { include_usage: true },
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      ...(getProviderRouting(resolvedModel) ? { provider: getProviderRouting(resolvedModel) } : {}),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM request failed (${response.status}): ${errorText}`)
  }

  if (!response.body) {
    throw new Error('LLM returned no response body')
  }

  const reader  = response.body.getReader()
  const decoder = new TextDecoder()
  let buf          = ''
  let fullContent  = ''
  let inputTokens  = 0
  let outputTokens = 0
  let tokensUsed   = 0
  let modelUsed    = resolvedModel

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw || raw === '[DONE]') continue

        try {
          const chunk = JSON.parse(raw) as {
            choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>
            usage?:   { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
            model?:   string
          }

          if (chunk.model) modelUsed = chunk.model
          if (chunk.usage) {
            inputTokens  = chunk.usage.prompt_tokens    ?? 0
            outputTokens = chunk.usage.completion_tokens ?? 0
            tokensUsed   = chunk.usage.total_tokens      ?? (inputTokens + outputTokens)
          }

          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) {
            fullContent += delta
            yield { type: 'token', delta }
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  yield {
    type:         'done',
    content:      fullContent,
    tokensUsed:   tokensUsed || Math.ceil(fullContent.length / 4),
    inputTokens,
    outputTokens,
    modelUsed,
  }
}
