import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

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

  // Increment click count fire-and-forget (do not await).
  void db
    .update(schema.shortLinks)
    .set({ clickCount: sql`${schema.shortLinks.clickCount} + 1` })
    .where(eq(schema.shortLinks.code, code))

  // Build destination URL with UTM params appended.
  const dest = new URL(link.destinationUrl)
  if (link.utmSource)   dest.searchParams.set('utm_source',   link.utmSource)
  if (link.utmMedium)   dest.searchParams.set('utm_medium',   link.utmMedium)
  if (link.utmCampaign) dest.searchParams.set('utm_campaign', link.utmCampaign)
  if (link.utmTerm)     dest.searchParams.set('utm_term',     link.utmTerm)
  if (link.utmContent)  dest.searchParams.set('utm_content',  link.utmContent)

  return NextResponse.redirect(dest.toString(), { status: 302 })
}
