import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { generatePaymentUrl, type PackId } from '@/lib/billing/payfast'

const querySchema = z.object({
  pack: z.enum(['starter', 'growth', 'pro']),
})

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const returnUrl = `${appUrl}/dashboard/billing`
  const notifyUrl = `${appUrl}/api/webhooks/payfast`

  const paymentUrl = generatePaymentUrl(org.id, parsed.data.pack as PackId, returnUrl, notifyUrl)
  redirect(paymentUrl)
}
