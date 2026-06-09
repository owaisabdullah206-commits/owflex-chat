import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { guardToolAiRequest } from '@/lib/tools/ai-route'
import { extractUrl, isTavilyConfigured } from '@/lib/tools/tavily-extract'
import { scoreReadiness } from '@/lib/tools/readiness'

const schema = z.object({
  url: z.string().url('Enter a valid website URL, including https://'),
})

export async function POST(req: NextRequest) {
  // Reuse the same per-IP guard as the AI tools: this hits an external fetch
  // (Tavily) so it carries cost and abuse exposure just like an LLM call.
  const limited = await guardToolAiRequest(req)
  if (limited) return limited

  if (!isTavilyConfigured()) {
    return NextResponse.json(
      { error: 'The checker is temporarily unavailable.', code: 'unavailable', status: 503 },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'bad_request', status: 400 }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message, code: 'validation_error', status: 400 }, { status: 400 })
  }

  try {
    const { content } = await extractUrl(parsed.data.url)
    const result = scoreReadiness(content)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[tools/readiness-checker] extract error:', err)
    return NextResponse.json(
      { error: 'Could not read that website. Check the URL and try again.', code: 'extract_failed', status: 502 },
      { status: 502 },
    )
  }
}
