import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

// Always run on the server so every click hits this handler and gets counted.
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params

  const [link] = await db
    .select()
    .from(schema.shortLinks)
    .where(eq(schema.shortLinks.code, code))
    .limit(1)

  if (!link) {
    return NextResponse.redirect(new URL('/', 'https://octively.com'), { status: 302 })
  }

  // Count the click. AWAIT it — a fire-and-forget promise in a route handler is
  // dropped once the response returns (and the neon-http fetch may never flush),
  // which is why clicks were never recorded. The extra ~10ms is unnoticeable.
  try {
    await db
      .update(schema.shortLinks)
      .set({ clickCount: sql`${schema.shortLinks.clickCount} + 1` })
      .where(eq(schema.shortLinks.code, code))
  } catch (err) {
    console.error('[short-link] click increment failed:', code, err)
  }

  // Build destination URL with UTM params appended.
  const dest = new URL(link.destinationUrl)
  if (link.utmSource)   dest.searchParams.set('utm_source',   link.utmSource)
  if (link.utmMedium)   dest.searchParams.set('utm_medium',   link.utmMedium)
  if (link.utmCampaign) dest.searchParams.set('utm_campaign', link.utmCampaign)
  if (link.utmTerm)     dest.searchParams.set('utm_term',     link.utmTerm)
  if (link.utmContent)  dest.searchParams.set('utm_content',  link.utmContent)

  const res = NextResponse.redirect(dest.toString(), { status: 302 })
  // Never let a CDN/browser cache the redirect, or repeat clicks skip the handler.
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res
}
