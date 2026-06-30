import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, and, gte, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getAffiliateById } from '@/lib/affiliates/auth'

const schema_validator = z.object({
  method: z.enum(['bank_transfer', 'paypal'], {
    message: 'Method must be bank_transfer or paypal',
  }),
  reference: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const affSession = req.cookies.get('aff_session')
  if (!affSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const affiliate = await getAffiliateById(affSession.value)
  if (!affiliate) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema_validator.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.method?.[0] ?? 'Invalid input' },
      { status: 400 },
    )
  }

  // Check pending balance
  const pendingBalance = affiliate.totalEarned - affiliate.totalPaid
  if (pendingBalance <= 0) {
    return NextResponse.json(
      { error: 'No pending balance to withdraw' },
      { status: 400 },
    )
  }

  // Check if there's already a pending payout request this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [existingRequest] = await db
    .select({ id: schema.affiliatePayouts.id })
    .from(schema.affiliatePayouts)
    .where(
      and(
        eq(schema.affiliatePayouts.affiliateId, affiliate.id),
        gte(schema.affiliatePayouts.paidAt, monthStart),
      ),
    )
    .limit(1)

  if (existingRequest) {
    return NextResponse.json(
      { error: 'You can only request one payout per month. Try again next month.' },
      { status: 400 },
    )
  }

  // Create payout request
  const [payout] = await db
    .insert(schema.affiliatePayouts)
    .values({
      affiliateId: affiliate.id,
      amount: String(pendingBalance),
      currency: 'PKR',
      method: parsed.data.method,
      reference: parsed.data.reference ?? null,
      notes: 'Payout requested by affiliate',
      referralIds: [],
      paidBy: null,
    })
    .returning()

  return NextResponse.json({
    success: true,
    payoutId: payout.id,
    amount: pendingBalance,
  })
}
