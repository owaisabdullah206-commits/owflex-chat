import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { generatePlanPaymentUrl, type PlanId } from '@/lib/billing/payfast'
import { getAppBaseUrl } from '@/lib/url'
import { validateCoupon } from '@/lib/affiliates'

const querySchema = z.object({
  plan: z.enum(['starter', 'pro', 'agency']),
  coupon: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await requireDeveloper()

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({ plan: searchParams.get('plan'), coupon: searchParams.get('coupon') })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid plan parameter. Must be starter, pro, or agency.', code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  // Validate coupon if provided
  let couponId: string | undefined
  if (parsed.data.coupon) {
    const result = await validateCoupon(parsed.data.coupon, 'plan')
    if (!result.valid) {
      return NextResponse.json(
        { error: result.error, code: 'INVALID_COUPON', status: 400 },
        { status: 400 },
      )
    }
    couponId = result.couponId
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

  if (org.plan === parsed.data.plan) {
    return NextResponse.json(
      { error: `Your organization is already on the ${parsed.data.plan} plan.`, code: 'ALREADY_ON_PLAN', status: 400 },
      { status: 400 },
    )
  }

  const appUrl = getAppBaseUrl()
  const returnUrl = `${appUrl}/dashboard/billing?upgraded=${parsed.data.plan}`
  const notifyUrl = `${appUrl}/api/webhooks/payfast`

  const paymentUrl = generatePlanPaymentUrl(org.id, parsed.data.plan as PlanId, returnUrl, notifyUrl, couponId)
  redirect(paymentUrl)
}
