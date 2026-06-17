// URL scraping via Tavily Extract/Crawl.
// Replaced Firecrawl (500 one-time credits) with Tavily (1,000 credits/month, recurring).
// Credit cost: basic extract = 1 credit per 5 URLs; crawl = map (1/10 pages) + extract cost.
// Requires TAVILY_API_KEY (same key already used by lib/tools/tavily-extract.ts).

export interface ScrapedPage {
  url: string
  markdown?: string
}

const TAVILY_EXTRACT_URL = 'https://api.tavily.com/extract'
const TAVILY_CRAWL_URL   = 'https://api.tavily.com/crawl'

function getApiKey(): string {
  const key = process.env.TAVILY_API_KEY
  if (!key) throw new Error('TAVILY_API_KEY is not set')
  return key
}

async function tavilyFetch(endpoint: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export async function scrapeUrl(
  url: string,
  opts: { maxPages?: number; includePaths?: string[]; excludePaths?: string[] } = {},
): Promise<ScrapedPage[]> {
  const maxPages = opts.maxPages ?? 1

  if (maxPages <= 1) {
    const res = await tavilyFetch(TAVILY_EXTRACT_URL, {
      urls:          url,
      extract_depth: 'basic',
      format:        'markdown',
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`SCRAPE_FAILED: Tavily extract HTTP ${res.status}: ${body}`)
    }

    const data = (await res.json()) as {
      results?:        Array<{ url?: string; raw_content?: string }>
      failed_results?: Array<{ url?: string; error?: string }>
    }

    const page = data.results?.[0]
    if (!page?.raw_content) {
      const reason = data.failed_results?.[0]?.error ?? 'no content returned'
      throw new Error(`SCRAPE_FAILED: ${reason}`)
    }

    return [{ url: page.url ?? url, markdown: page.raw_content }]
  }

  // Multi-page: Tavily Crawl (graph-based traversal)
  const crawlBody: Record<string, unknown> = {
    url,
    limit:         maxPages,
    extract_depth: 'basic',
    format:        'markdown',
  }
  if (opts.includePaths?.length) crawlBody.select_paths  = opts.includePaths
  if (opts.excludePaths?.length) crawlBody.exclude_paths = opts.excludePaths

  const res = await tavilyFetch(TAVILY_CRAWL_URL, crawlBody)

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`SCRAPE_FAILED: Tavily crawl HTTP ${res.status}: ${body}`)
  }

  const data = (await res.json()) as {
    results?: Array<{ url?: string; raw_content?: string }>
  }

  if (!data.results?.length) {
    throw new Error('SCRAPE_FAILED: Tavily crawl returned no pages')
  }

  return data.results
    .filter(p => p.raw_content)
    .map(p => ({ url: p.url ?? url, markdown: p.raw_content }))
}
