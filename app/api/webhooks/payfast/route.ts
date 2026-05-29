import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyItn, CREDIT_PACKS } from '@/lib/billing/payfast'
import * as creditLib from '@/lib/credits'

export async function POST(req: NextRequest) {
  const rawText = await req.text()
  const params: Record<string, string> = {}
  for (const [k, v] of new URLSearchParams(rawText)) {
    params[k] = v
  }

  const result = verifyItn(params)

  if (!result.valid || !result.orgId) {
    // Always return 200 to PayFast — log invalid but don't retry
    console.error('[payfast] invalid ITN', { valid: result.valid, paymentId: result.paymentId })
    return new NextResponse('OK', { status: 200 })
  }

  // Amount integrity guard — reject any ITN whose gross paid doesn't match the
  // server-side price for the pack/plan in m_payment_id (defends against the
  // unsigned-checkout amount-tampering vector).
  if (!result.amountValid) {
    console.error('[payfast] amount mismatch — refusing to grant', {
      paymentId: result.paymentId,
      amountGross: result.amountGross,
    })
    return new NextResponse('OK', { status: 200 })
  }

  // Plan upgrade branch: m_payment_id starts with 'plan:'
  if (result.planId) {
    const planId = result.planId

    // Idempotency check
    const [existing] = await db
      .select({ id: schema.creditTransactions.id })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.refId, result.paymentId))
      .limit(1)

    if (!existing) {
      // Read the current plan BEFORE updating so we can compute the credit delta
      const [org] = await db
        .select({ plan: schema.organizations.plan })
        .from(schema.organizations)
        .where(eq(schema.organizations.id, result.orgId))
        .limit(1)
      const fromPlan = org?.plan ?? 'free'

      await db
        .update(schema.organizations)
        .set({ plan: planId })
        .where(eq(schema.organizations.id, result.orgId))

      // Top up Redis balance by the difference between the two plan allocations
      await creditLib.upgradePlanCredits(result.orgId, fromPlan, planId)
      await creditLib.logTransaction(result.orgId, 0, 'plan_upgrade', result.paymentId)
    }

    return new NextResponse('OK', { status: 200 })
  }

  // Credit pack branch (existing logic)
  if (!result.packId) {
    console.error('[payfast] invalid ITN — no packId', { paymentId: result.paymentId })
    return new NextResponse('OK', { status: 200 })
  }

  // Idempotency: check if this payment was already credited
  const [existing] = await db
    .select({ id: schema.creditTransactions.id })
    .from(schema.creditTransactions)
    .where(eq(schema.creditTransactions.refId, result.paymentId))
    .limit(1)

  if (existing) {
    return new NextResponse('OK', { status: 200 })
  }

  // Credit the org
  const tokens = CREDIT_PACKS[result.packId].tokens
  await creditLib.refund(result.orgId, tokens)
  await creditLib.logTransaction(result.orgId, tokens, 'purchase', result.paymentId)

  return new NextResponse('OK', { status: 200 })
}
