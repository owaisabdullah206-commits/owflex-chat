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
    `\n\nCATALOG SCOPE: ${catalogSizeNote} The ${chunks.length} item(s) shown above are the most semantically relevant matches for this specific query.` +
    `\n\nVARIANT RULE: A product entry that contains a "Variants (N):" section lists N variants of the SAME product (e.g. different shades, sizes). Count and list it as ONE product — never list each variant as a separate product. When a user asks for "all products", group variants under their product name.` +
    `\n\nLISTING RULE: When the user asks to list all products or asks how many products there are, list only the distinct product names visible in the context above (counting each Variants block as one product). If the total you can see is less than the stated catalog size, say "Here are the products I have details for — visit our website for the complete catalog." Do not retract or apologise for products you have listed; correct grouping instead if a user says variants are not separate products. Only state a specific total count if explicitly provided in the "Your full knowledge base contains X products" line above.`

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
