import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { generatePlanCheckoutUrl, getPlanVariantId, type PlanId } from '@/lib/billing/lemon-squeezy'

const querySchema = z.object({
  plan: z.enum(['starter', 'pro', 'agency']),
})

export async function GET(req: NextRequest) {
  const user = await requireDeveloper()

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({ plan: searchParams.get('plan') })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid plan parameter. Must be starter, pro, or agency.', code: 'VALIDATION_ERROR', status: 400 },
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

  if (org.plan === parsed.data.plan) {
    return NextResponse.json(
      { error: `Your organization is already on the ${parsed.data.plan} plan.`, code: 'ALREADY_ON_PLAN', status: 400 },
      { status: 400 },
    )
  }

  const variantId = getPlanVariantId(parsed.data.plan as PlanId)
  if (!variantId) {
    return NextResponse.json(
      { error: `Lemon Squeezy plan variant not configured for ${parsed.data.plan}. Contact support.`, code: 'CONFIG_ERROR', status: 503 },
      { status: 503 },
    )
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/billing?upgraded=${parsed.data.plan}`
  const checkoutUrl = generatePlanCheckoutUrl(org.id, parsed.data.plan as PlanId, returnUrl)
  redirect(checkoutUrl)
}
