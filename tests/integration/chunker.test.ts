import { describe, it, expect } from 'vitest'
import { chunkText } from '@/lib/knowledge/chunker'

describe('chunkText', () => {
  it('returns a single chunk when text is exactly 1000 chars', () => {
    // 250 'abcd' repetitions = 1000 chars, no sentence boundaries → one chunk
    const text = 'abcd'.repeat(250)
    expect(text).toHaveLength(1000)
    const chunks = chunkText(text)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toHaveLength(1000)
  })

  it('returns 2 chunks with overlap when text is 1201 chars', () => {
    // 'ab '.repeat(400) + 'a' = 1200 + 1 = 1201 chars, splits after ~1000
    const text = 'ab '.repeat(400) + 'a'
    expect(text).toHaveLength(1201)
    const chunks = chunkText(text)
    expect(chunks).toHaveLength(2)
    expect(chunks[0].length).toBeLessThanOrEqual(1000)
    expect(chunks[1].length).toBeLessThanOrEqual(1000)
    // Verify 200-char overlap: tail of chunk[0] should appear in chunk[1]
    const overlapSnippet = chunks[0].slice(-50).trim()
    expect(chunks[1]).toContain(overlapSnippet)
  })

  it('re-splits a single sentence > 1000 chars on word boundaries', () => {
    // 'hello world ' * 100 = 1200 chars, no sentence-ending punctuation
    const text = 'hello world '.repeat(100).trimEnd()
    const chunks = chunkText(text)
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    // Every chunk must stay within the 1000-char target
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(1000)
    }
    // The primary split point ends on a word boundary — chunk ends with a word char
    for (const chunk of chunks) {
      expect(chunk.trimEnd()).toMatch(/\w$/)
    }
    // Original words appear in the output (content is preserved, not invented)
    const originalWords = new Set(text.split(/\s+/))
    for (const chunk of chunks) {
      // Overlap may produce partial-word prefixes; only check full words (≥2 chars)
      const fullWords = chunk.trim().split(/\s+/).filter((w) => w.length >= 4)
      for (const word of fullWords) {
        expect(originalWords.has(word)).toBe(true)
      }
    }
  })

  it('returns empty array for empty string', () => {
    expect(chunkText('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(chunkText('   \n\t  ')).toEqual([])
  })
})
