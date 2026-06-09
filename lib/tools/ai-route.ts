import { NextRequest, NextResponse } from 'next/server'
import { getToolsAiRatelimit } from '@/lib/ratelimit'

/**
 * Shared guard for the optional "Generate with AI" endpoints behind the free
 * marketing tools. Returns a 429 response when the per-IP limit is hit, or
 * null when the request may proceed. The tools all work without AI (static
 * banks), so this only gates the extra LLM-backed variety.
 */
export async function guardToolAiRequest(req: NextRequest): Promise<NextResponse | null> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rl = getToolsAiRatelimit()
  if (rl) {
    const { success } = await rl.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Try again in a minute.', code: 'RATE_LIMITED', status: 429 },
        { status: 429 },
      )
    }
  }
  return null
}

/**
 * Pull a JSON value out of an LLM response that may be wrapped in prose or a
 * ```json fence. Returns null if nothing parseable is found.
 */
export function extractJson<T>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : raw
  const start = candidate.search(/[[{]/)
  if (start === -1) return null
  const end = Math.max(candidate.lastIndexOf(']'), candidate.lastIndexOf('}'))
  if (end === -1 || end < start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T
  } catch {
    return null
  }
}
