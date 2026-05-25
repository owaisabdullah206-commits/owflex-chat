export const CLASSIFIER_MODEL = 'deepseek/deepseek-v4-flash'
export const STRONG_MODEL = 'anthropic/claude-haiku-4-5-20251001'
export const FALLBACK_MODEL = 'deepseek/deepseek-v4-flash'

export const SUPPORTED_MODELS = [
  'deepseek/deepseek-v4-flash',
  'google/gemini-2.5-flash-lite',
  'openai/gpt-4o-mini',
  'openai/gpt-oss-120b',
  'anthropic/claude-haiku-4-5-20251001',
  'openrouter/owl-alpha',
  'google/gemma-4-31b-it',
  'meta-llama/llama-3.1-70b-instruct',
  'tencent/hy3-preview',
] as const

export type SupportedModel = (typeof SUPPORTED_MODELS)[number]

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
      model: resolvedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
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
