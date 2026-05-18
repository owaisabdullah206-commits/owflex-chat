import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { generateCheckoutUrl } from '@/lib/billing/lemon-squeezy'

const querySchema = z.object({
  pack: z.enum(['starter', 'growth', 'pro']),
})

const PACK_ENV_KEYS = {
  starter: 'LS_VARIANT_STARTER',
  growth:  'LS_VARIANT_GROWTH',
  pro:     'LS_VARIANT_PRO',
} as const

export async function GET(req: NextRequest) {
  const user = await requireDeveloper()

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({ pack: searchParams.get('pack') })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid pack parameter', code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) {
    return NextResponse.json(
      { error: 'Organization not found', code: 'NOT_FOUND', status: 404 },
      { status: 404 },
    )
  }

  if (org.plan === 'free') {
    return NextResponse.json(
      { error: 'Credit top-ups are not available on the free plan. Upgrade to a paid plan first.', code: 'PLAN_REQUIRED', status: 403 },
      { status: 403 },
    )
  }

  const envKey = PACK_ENV_KEYS[parsed.data.pack]
  const variantId = process.env[envKey]
  if (!variantId) {
    return NextResponse.json(
      { error: `Lemon Squeezy variant not configured for ${parsed.data.pack} pack`, code: 'CONFIG_ERROR', status: 503 },
      { status: 503 },
    )
  }

  const checkoutUrl = generateCheckoutUrl(org.id, variantId)
  redirect(checkoutUrl)
}
