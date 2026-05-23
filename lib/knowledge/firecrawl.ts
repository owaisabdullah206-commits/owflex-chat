import { FirecrawlAppV1 } from 'firecrawl'

export interface ScrapedPage {
  url: string
  markdown?: string
}

function getClient(): FirecrawlAppV1 {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY is not set')
  return new FirecrawlAppV1({ apiKey })
}

export async function scrapeUrl(
  url: string,
  opts: { maxPages?: number; includePaths?: string[]; excludePaths?: string[] } = {},
): Promise<ScrapedPage[]> {
  const client = getClient()
  const maxPages = opts.maxPages ?? 1

  if (maxPages <= 1) {
    const result = await client.scrapeUrl(url, { formats: ['markdown'] })
    if (!result.success) {
      throw new Error(`SCRAPE_FAILED: ${result.error ?? 'Unknown error'}`)
    }
    return [{ url, markdown: result.markdown }]
  }

  const crawlResult = await client.crawlUrl(url, {
    limit: maxPages,
    scrapeOptions: { formats: ['markdown'] },
    includePaths: opts.includePaths,
    excludePaths: opts.excludePaths,
  })

  if (!crawlResult.success) {
    throw new Error(`SCRAPE_FAILED: ${'error' in crawlResult ? crawlResult.error : 'Unknown error'}`)
  }

  return crawlResult.data.map((page) => ({
    url: page.url ?? url,
    markdown: page.markdown,
  }))
}
