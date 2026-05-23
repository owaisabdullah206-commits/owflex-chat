export type CsvFormat = 'shopify' | 'woocommerce' | 'generic'

// ── Format detection ─────────────────────────────────────────────────────────

export function detectCsvFormat(headers: string[]): CsvFormat {
  const set = new Set(headers)
  if (set.has('Body (HTML)') && set.has('Variant Price')) return 'shopify'
  if (set.has('post_content')) return 'woocommerce'
  if (set.has('Description') && set.has('Regular price')) return 'woocommerce'
  return 'generic'
}

// Columns that are stable unique identifiers — safe to show in the picker.
// Price, description, weight, image, and multi-value columns are excluded.
export function getUniqueIdColumns(format: CsvFormat): string[] {
  if (format === 'shopify') return ['Handle', 'ID', 'Variant SKU']
  if (format === 'woocommerce') return ['ID', 'SKU']
  // Generic: common identifier-ish header names
  return ['id', 'handle', 'sku', 'slug', 'permalink']
}

// ── HTML stripping ───────────────────────────────────────────────────────────

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Row → passage ────────────────────────────────────────────────────────────

function f(row: Record<string, string>, key: string): string {
  return (row[key] ?? '').trim()
}

function ln(label: string, value: string): string {
  const v = value.trim()
  return v ? `${label}: ${v}` : ''
}

export function rowToPassage(row: Record<string, string>, format: CsvFormat): string {
  if (format === 'shopify') {
    const handle = f(row, 'Handle')
    return [
      ln('Product', f(row, 'Title')),
      ln('Handle', handle),
      ln('Type', f(row, 'Product Type')),
      ln('Vendor', f(row, 'Vendor')),
      ln('Description', stripHtml(f(row, 'Body (HTML)'))),
      ln('Price', f(row, 'Variant Price')),
      ln('SKU', f(row, 'Variant SKU')),
      ln('Tags', f(row, 'Tags')),
      ln('Image', f(row, 'Image Src')),
      handle ? `URL: /products/${handle}` : '',
    ].filter(Boolean).join('\n')
  }

  if (format === 'woocommerce') {
    return [
      ln('Product', f(row, 'Name')),
      ln('Category', f(row, 'Categories')),
      ln('Description', stripHtml(f(row, 'Description') || f(row, 'post_content'))),
      ln('Short description', stripHtml(f(row, 'Short description'))),
      ln('Price', f(row, 'Regular price')),
      ln('SKU', f(row, 'SKU')),
      ln('Tags', f(row, 'Tags')),
      ln('Image', f(row, 'Images')),
      ln('URL', f(row, 'External URL') || f(row, 'post_permalink') || f(row, 'Permalink')),
    ].filter(Boolean).join('\n')
  }

  // Generic: auto-select text columns; always append image/url columns at end
  const skipPattern = /^(meta_|_id$|date_|created_|updated_|weight|height|width|length|position)/i
  const mediaPattern = /^(image|photo|url|link|permalink)/i
  const mainLines: string[] = []
  const tailLines: string[] = []

  for (const [key, val] of Object.entries(row)) {
    const v = val.trim()
    if (!v) continue
    if (skipPattern.test(key)) continue
    if (mediaPattern.test(key)) {
      tailLines.push(ln(key, v))
    } else {
      mainLines.push(ln(key, v))
    }
  }

  return [...mainLines, ...tailLines].filter(Boolean).join('\n')
}

// ── Batch processing ─────────────────────────────────────────────────────────

export function processCsvRows(rows: Record<string, string>[]): string {
  if (rows.length === 0) return ''

  const headers = Object.keys(rows[0])
  const format = detectCsvFormat(headers)

  const passages = rows
    .filter(row => {
      const title = row['Title'] ?? row['Name'] ?? row['name'] ?? row['title'] ?? ''
      const desc =
        row['Body (HTML)'] ?? row['Description'] ?? row['post_content'] ?? row['description'] ?? ''
      return title.trim() || desc.trim()
    })
    .map(row => rowToPassage(row, format))
    .filter(p => p.trim().length > 0)

  return passages.join('\n\n')
}
