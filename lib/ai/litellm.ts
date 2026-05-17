export const CLASSIFIER_MODEL = 'deepseek/deepseek-v4-flash'
export const STRONG_MODEL = 'anthropic/claude-haiku-4-5-20251001'

export const SUPPORTED_MODELS = [
  'deepseek/deepseek-v4-flash',
  'gemini/gemini-2.0-flash',
  'openai/gpt-4o-mini',
  'anthropic/claude-haiku-4-5-20251001',
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
      'HTTP-Referer': 'https://owflex.com',
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
