const TARGET_SIZE = 1000
const OVERLAP = 200

export function chunkText(text: string): string[] {
  if (!text || text.trim().length === 0) return []

  const sentences = splitIntoSentences(text)
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence

    if (candidate.length <= TARGET_SIZE) {
      current = candidate
      continue
    }

    if (current) {
      const finalChunks = splitOversized(current)
      chunks.push(...finalChunks)
      // carry overlap from the end of the last chunk
      const lastChunk = finalChunks[finalChunks.length - 1] ?? ''
      current = lastChunk.length > OVERLAP
        ? lastChunk.slice(lastChunk.length - OVERLAP) + ' ' + sentence
        : lastChunk + ' ' + sentence
    } else {
      const finalChunks = splitOversized(sentence)
      chunks.push(...finalChunks.slice(0, -1))
      current = finalChunks[finalChunks.length - 1] ?? ''
    }
  }

  if (current.trim()) {
    chunks.push(...splitOversized(current))
  }

  return chunks.filter((c) => c.trim().length >= 40)
}

function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace + capital letter
  const parts = text.split(/(?<=[.!?])\s+(?=[A-ZÀ-ɏ])/)
  return parts.map((s) => s.trim()).filter(Boolean)
}

function splitOversized(text: string): string[] {
  if (text.length <= TARGET_SIZE) return [text]

  const result: string[] = []
  const words = text.split(/\s+/)
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= TARGET_SIZE) {
      current = candidate
    } else {
      if (current) result.push(current)
      const tail = current.length > OVERLAP ? current.slice(current.length - OVERLAP) : current
      current = tail ? `${tail} ${word}` : word
    }
  }

  if (current.trim()) result.push(current)
  return result
}
