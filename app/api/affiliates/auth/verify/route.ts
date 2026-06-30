import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyMagicLink } from '@/lib/affiliates/auth'

const schema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 },
    )
  }

  const result = await verifyMagicLink(parsed.data.token)

  if (!result.affiliateId) {
    return NextResponse.json(
      { error: result.error ?? 'Invalid or expired link' },
      { status: 401 },
    )
  }

  // Set affiliate ID in a short-lived cookie (httpOnly, secure)
  const response = NextResponse.json({ success: true, affiliateId: result.affiliateId })
  response.cookies.set('aff_session', result.affiliateId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
