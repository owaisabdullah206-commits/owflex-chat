// Thin wrapper over the Tavily Extract REST API.
// Used by the public Website Chatbot Readiness Checker to fetch page content.
// Tavily is chosen here over Firecrawl because its free tier is more generous,
// and the readiness checker is a public, unauthenticated tool that can see
// bursty traffic. Basic extraction costs 1 credit per 5 successful URLs.
//
// Requires TAVILY_API_KEY (format: tvly-...). When unset, callers should treat
// extraction as unavailable rather than crash.

export interface TavilyExtractResult {
  url: string
  content: string
}

export function isTavilyConfigured(): boolean {
  return !!process.env.TAVILY_API_KEY
}

export async function extractUrl(url: string): Promise<TavilyExtractResult> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) throw new Error('TAVILY_API_KEY is not set')

  const res = await fetch('https://api.tavily.com/extract', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      urls: url,
      extract_depth: 'basic',
      format: 'markdown',
    }),
  })

  if (!res.ok) {
    throw new Error(`EXTRACT_FAILED: Tavily returned ${res.status}`)
  }

  const data = (await res.json()) as {
    results?: Array<{ url?: string; raw_content?: string }>
    failed_results?: Array<{ url?: string; error?: string }>
  }

  const first = data.results?.[0]
  if (!first || !first.raw_content) {
    throw new Error('EXTRACT_FAILED: no content returned')
  }

  return { url: first.url ?? url, content: first.raw_content }
}
