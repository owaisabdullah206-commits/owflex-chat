import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendMagicLink } from '@/lib/affiliates/auth'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.email?.[0] ?? 'Invalid email' },
      { status: 400 },
    )
  }

  const result = await sendMagicLink(parsed.data.email)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true })
}
