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

/**
 * Build one passage for a Shopify product group (1 or more variant rows).
 * The first row in the group must have a non-empty Title.
 *
 * For single-variant products: price + SKU are listed inline.
 * For multi-variant products: all variants are collapsed into a compact
 * "Variants (N):" block so the LLM treats the entire group as ONE product —
 * not as N separate products.
 */
function shopifyGroupToPassage(rows: Record<string, string>[]): string {
  const first = rows[0]
  const title = f(first, 'Title')
  // Synthesise a URL handle from the title when the Handle column is absent
  const handle =
    f(first, 'Handle') ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  // Option dimension names (e.g. "Color", "Shade", "Size")
  const opt1Name = f(first, 'Option1 Name') || 'Variant'
  const opt2Name = f(first, 'Option2 Name')
  const opt3Name = f(first, 'Option3 Name')

  const lines: string[] = [
    ln('Product', title),
    ln('Type', f(first, 'Product Type')),
    ln('Vendor', f(first, 'Vendor')),
    ln('Description', stripHtml(f(first, 'Body (HTML)'))),
    ln('Tags', f(first, 'Tags')),
    ln('Image', f(first, 'Image Src')),
    handle ? `URL: /products/${handle}` : '',
  ]

  if (rows.length === 1) {
    // Single variant — keep price and SKU inline (no variants block needed)
    lines.push(ln('Price', f(first, 'Variant Price')))
    lines.push(ln('SKU', f(first, 'Variant SKU')))
  } else {
    // Multiple variants — emit a compact variant table
    lines.push(`Variants (${rows.length}):`)
    for (const row of rows) {
      const parts: string[] = []
      const o1 = f(row, 'Option1 Value')
      const o2 = f(row, 'Option2 Value')
      const o3 = f(row, 'Option3 Value')
      if (o1) parts.push(`${opt1Name}: ${o1}`)
      if (o2 && opt2Name) parts.push(`${opt2Name}: ${o2}`)
      if (o3 && opt3Name) parts.push(`${opt3Name}: ${o3}`)
      const sku = f(row, 'Variant SKU')
      const price = f(row, 'Variant Price')
      if (sku) parts.push(`SKU: ${sku}`)
      if (price) parts.push(`Price: ${price}`)
      if (parts.length > 0) lines.push(`  - ${parts.join(', ')}`)
    }
  }

  return lines.filter(Boolean).join('\n')
}

export function rowToPassage(row: Record<string, string>, format: CsvFormat): string {
  if (format === 'shopify') {
    // Convenience wrapper for single-row callers (e.g. tests, external utilities).
    // processCsvRows always uses shopifyGroupToPassage directly.
    return shopifyGroupToPassage([row])
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

export function processCsvRows(rows: Record<string, string>[], maxProducts?: number): string {
  if (rows.length === 0) return ''

  const headers = Object.keys(rows[0])
  const format = detectCsvFormat(headers)

  // ── Shopify: group variant rows under their parent product ──────────────────
  // In Shopify exports, only the FIRST row for a product has a non-empty Title.
  // All subsequent rows for the same product have an empty Title and represent
  // additional variants (different shades, sizes, etc.).
  // We group them into ONE passage so the LLM sees ONE product, not N variants.
  if (format === 'shopify') {
    const groups: Record<string, string>[][] = []
    let current: Record<string, string>[] = []

    for (const row of rows) {
      const title = (row['Title'] ?? '').trim()

      if (title) {
        // New product starts here
        if (current.length > 0) groups.push(current)
        current = [row]
      } else if (current.length > 0) {
        // Variant row — only include if it carries meaningful variant data
        const hasVariantData =
          (row['Variant SKU'] ?? '').trim() ||
          (row['Variant Price'] ?? '').trim() ||
          (row['Option1 Value'] ?? '').trim()
        if (hasVariantData) current.push(row)
      }
      // Rows before the first Title (orphaned variants) are silently skipped
    }
    if (current.length > 0) groups.push(current)

    // Apply plan limit (counted by distinct products, not raw rows)
    const limited = maxProducts != null ? groups.slice(0, maxProducts) : groups

    return limited
      .map((group) => shopifyGroupToPassage(group))
      .filter((s) => s.trim().length > 0)
      .join('\n\n')
  }

  // ── WooCommerce / Generic: one product per row ──────────────────────────────
  const passages: string[] = []
  let productCount = 0

  for (const row of rows) {
    const title = (
      row['Title'] ?? row['Name'] ?? row['name'] ?? row['title'] ?? ''
    ).trim()
    const desc = (
      row['Body (HTML)'] ??
      row['Description'] ??
      row['post_content'] ??
      row['description'] ??
      ''
    ).trim()

    if (!title && !desc) continue // fully blank row — skip

    if (maxProducts != null && productCount >= maxProducts) break
    productCount++

    const passage = rowToPassage(row, format)
    if (passage.trim().length > 0) passages.push(passage)
  }

  return passages.join('\n\n')
}
