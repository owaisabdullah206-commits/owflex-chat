function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function collapseBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n')
}

function normalizeUnicode(text: string): string {
  return text.normalize('NFC')
}

// ── cleanMarkdown ────────────────────────────────────────────────────────────

export function cleanMarkdown(text: string): string {
  let out = decodeHtmlEntities(text)

  // Remove markdown images: ![alt](url)
  out = out.replace(/!\[[^\]]*\]\([^)]*\)/g, '')

  // Strip anchor-only links with # or javascript: hrefs, keeping the label text
  out = out.replace(/\[([^\]]*)\]\((#[^)]*|javascript:[^)]*)\)/g, '$1')

  // Drop lines that are skip-navigation links
  out = out
    .split('\n')
    .filter(line => !/skip to (content|main|navigation)/i.test(line))
    .join('\n')

  // Collapse 3+ consecutive horizontal rules to one
  out = out.replace(/(^|\n)([ \t]*(-{3,}|={3,}|\*{3,})[ \t]*\n){2,}/g, '\n---\n')

  // Remove short noise lines (< 4 chars) that are not headings
  out = out
    .split('\n')
    .filter(line => line.trimStart().startsWith('#') || line.trim().length >= 4 || line.trim().length === 0)
    .join('\n')

  out = collapseBlankLines(out)
  out = normalizeUnicode(out)

  return out.trim()
}

// ── cleanDocumentText ────────────────────────────────────────────────────────

export function cleanDocumentText(text: string): string {
  let out = decodeHtmlEntities(text)

  // Join soft-hyphenated line breaks: "word-\nbreak" → "wordbreak"
  out = out.replace(/(\w)-\n(\w)/g, '$1$2')

  // Drop lines that are lone page numbers or "Page N of M"
  out = out
    .split('\n')
    .filter(line => {
      const t = line.trim()
      if (/^\d{1,4}$/.test(t)) return false
      if (/^page \d+ of \d+$/i.test(t)) return false
      return true
    })
    .join('\n')

  // Drop lines made entirely of repeated _, -, or = (4+ chars)
  out = out
    .split('\n')
    .filter(line => !/^[_\-=]{4,}$/.test(line.trim()))
    .join('\n')

  out = collapseBlankLines(out)
  out = normalizeUnicode(out)

  // Normalize curly/smart quotes to ASCII
  out = out
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, '-')

  return out.trim()
}

// ── removeBoilerplate ────────────────────────────────────────────────────────

export function removeBoilerplate<T extends { url: string; markdown?: string }>(
  pages: T[],
): T[] {
  if (pages.length < 3) return pages

  const freq = new Map<string, number>()
  for (const page of pages) {
    const md = page.markdown ?? ''
    const lines = new Set(
      md.split('\n').map(l => l.trim()).filter(l => l.length > 12),
    )
    for (const line of lines) freq.set(line, (freq.get(line) ?? 0) + 1)
  }

  const threshold = Math.ceil(pages.length * 0.6)
  const boilerplate = new Set(
    [...freq].filter(([, n]) => n >= threshold).map(([l]) => l),
  )
  if (boilerplate.size === 0) return pages

  return pages.map(page => ({
    ...page,
    markdown: (page.markdown ?? '')
      .split('\n')
      .filter(line => !boilerplate.has(line.trim()))
      .join('\n'),
  }))
}
