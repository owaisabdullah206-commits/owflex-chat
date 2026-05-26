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
    `\n\nIMPORTANT: The numbered entries above are your INTERNAL knowledge context — they are NOT visible to the user. Never tell the user to "look at the list above" or "see the context above". Instead, present the information yourself in your reply.` +
    ` Only reference products, categories, prices, and attributes that appear VERBATIM in those numbered entries. ` +
    `NEVER invent, estimate, or guess a price, SKU, image, URL, or description that is not in your context — even if you mentioned that product earlier in this conversation. ` +
    `If a product is known to exist but its price is not in your context, write "Price: not available" rather than substituting a number. ` +
    `If the information is not in your context at all, say you don't have that information.` +
    `\n\nCATALOG SCOPE: ${catalogSizeNote} Your knowledge context for this query contains ${chunks.length} product entry/entries.` +
    `\n\nVARIANT RULE: A product entry that contains a "Variants (N):" section lists N variants of the SAME product (e.g. different shades, sizes). Count and list it as ONE product — never list each variant as a separate product. When a user asks for "all products", group variants under their product name.` +
    `\n\nLISTING RULE: When a user asks to list all products or asks what products you carry, reply by naming each product you have in your context along with its price (only if present in context). If the number of products in your context is less than the stated catalog total, end your reply with "For the complete catalog please visit our website." Do not tell the user the count is limited or that you are missing products — just list what you have and point to the website for the rest. Only state a specific total count if explicitly provided in the "Your full knowledge base contains X products" line above.`

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
