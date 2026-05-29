import { NextResponse, type NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { parseBody } from 'next-sanity/webhook'

// On-demand revalidation for Sanity content.
// Configure a webhook in Sanity (API → Webhooks) pointing at /api/revalidate
// with the secret set to SANITY_REVALIDATE_SECRET.
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }
    const tag = body?._type
    if (!tag) {
      return new NextResponse('Bad request', { status: 400 })
    }

    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, type: body._type, now: Date.now() })
  } catch (err) {
    console.error('[revalidate] error:', err)
    return new NextResponse('Error revalidating', { status: 500 })
  }
}
