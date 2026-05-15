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
    usage?: { total_tokens?: number }
    model?: string
  }

  const content = data.choices[0]?.message?.content ?? ''
  const tokensUsed = data.usage?.total_tokens ?? 0
  const modelUsed = data.model ?? resolvedModel

  return { content, tokensUsed, modelUsed }
}
