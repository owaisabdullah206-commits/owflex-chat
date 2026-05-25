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

export function renderDocContext(
  chunks: RetrievedChunk[],
  storeUrl?: string,
  storeCurrency?: string,
  catalogProductLimit?: number,
  totalKbProducts?: number,
): string {
  if (chunks.length === 0) return ''
  const base = storeUrl ? storeUrl.replace(/\/$/, '') : ''
  let text = chunks.map((c, i) => `[${i + 1}] ${c.text.trim()}`).join('\n\n')
  if (base) {
    text = text.replace(/URL: \/products\//g, `URL: ${base}/products/`)
  }
  const header = storeCurrency
    ? `Context from your documents (prices are in ${storeCurrency}):\n`
    : `Context from your documents:\n`

  // Build a precise catalog size statement so the bot always knows its own inventory
  let catalogSizeNote: string
  if (totalKbProducts && totalKbProducts > 0) {
    const limitNote =
      catalogProductLimit !== undefined && isFinite(catalogProductLimit) && totalKbProducts >= catalogProductLimit
        ? ` (capped at ${catalogProductLimit} on the current plan — upgrade to index more)`
        : ''
    catalogSizeNote = `Your full knowledge base contains ${totalKbProducts} product(s) in total${limitNote}.`
  } else {
    catalogSizeNote = ''
  }

  const footer =
    `\n\nIMPORTANT: Only reference products, categories, prices, and attributes explicitly listed in the context above. Do not describe, infer, or generalise products from your training knowledge. If the information is not in the context, say you don't have that information.` +
    `\n\nCATALOG SCOPE: ${catalogSizeNote} The ${chunks.length} item(s) shown above are the most semantically relevant matches for this specific query — DO NOT assume or state these are ALL the products in the catalog. When asked how many products you carry or to list everything, do not guess based on what you can see here. Instead say: "I can show the most relevant items for your query. For the complete product list please visit our website." Only state a specific total count if you are given one explicitly in the "Your full knowledge base contains X products" line above.`

  return header + text + footer
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
