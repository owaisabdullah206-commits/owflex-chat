export interface RetrievedChunk {
  id: string
  documentId: string
  text: string
  score: number
}

interface SystemPromptParts {
  platform?: string
  bot: string
  docs?: string
  faqs?: string
  lead?: string
}

export function renderDocContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return ''
  const lines = chunks.map((c, i) => `[${i + 1}] ${c.text.trim()}`)
  return `Context from your documents:\n${lines.join('\n\n')}`
}

export function composeSystemPrompt({
  platform,
  bot,
  docs,
  faqs,
  lead,
}: SystemPromptParts): string {
  const parts: string[] = []

  if (platform?.trim()) parts.push(platform.trim())
  if (bot.trim()) parts.push(bot.trim())
  if (docs?.trim()) parts.push(docs.trim())
  if (faqs?.trim()) parts.push(faqs.trim())
  if (lead?.trim()) parts.push(lead.trim())

  return parts.join('\n\n')
}
