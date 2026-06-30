import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyItn, CREDIT_PACKS, PLAN_PRICES_PKR } from '@/lib/billing/payfast'
import * as creditLib from '@/lib/credits'
import { validateCoupon, calculateDiscount, calculateCommission, recordReferral } from '@/lib/affiliates'

export async function POST(req: NextRequest) {
  const rawText = await req.text()
  const params: Record<string, string> = {}
  for (const [k, v] of new URLSearchParams(rawText)) {
    params[k] = v
  }

  const result = verifyItn(params)

  if (!result.valid || !result.orgId) {
    console.error('[payfast] invalid ITN', { valid: result.valid, paymentId: result.paymentId })
    return new NextResponse('OK', { status: 200 })
  }

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

    const [existing] = await db
      .select({ id: schema.creditTransactions.id })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.refId, result.paymentId))
      .limit(1)

    if (!existing) {
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

      await creditLib.upgradePlanCredits(result.orgId, fromPlan, planId)
      await creditLib.logTransaction(result.orgId, 0, 'plan_upgrade', result.paymentId)
    }

    // Record affiliate referral if coupon was used
    if (result.couponId) {
      const couponResult = await validateCoupon(result.couponId, 'plan')
      if (couponResult.valid && couponResult.couponId && couponResult.affiliateId) {
        const originalAmount = PLAN_PRICES_PKR[planId] ?? 0
        const { discountAmount, finalAmount } = calculateDiscount(
          originalAmount,
          couponResult.discountType!,
          couponResult.discountValue!,
          'PKR',
        )
        const commissionAmount = calculateCommission(finalAmount, couponResult.commissionRate!)

        await recordReferral({
          affiliateId: couponResult.affiliateId,
          couponId: couponResult.couponId,
          orgId: result.orgId,
          paymentType: 'plan',
          originalAmount,
          discountAmount,
          finalAmount,
          commissionRate: couponResult.commissionRate!,
          commissionAmount,
          paymentRefId: result.paymentId,
          currency: 'PKR',
        })
      }
    }

    return new NextResponse('OK', { status: 200 })
  }

  // Credit pack branch
  if (!result.packId) {
    console.error('[payfast] invalid ITN — no packId', { paymentId: result.paymentId })
    return new NextResponse('OK', { status: 200 })
  }

  const [existing] = await db
    .select({ id: schema.creditTransactions.id })
    .from(schema.creditTransactions)
    .where(eq(schema.creditTransactions.refId, result.paymentId))
    .limit(1)

  if (existing) {
    return new NextResponse('OK', { status: 200 })
  }

  const tokens = CREDIT_PACKS[result.packId].tokens
  await creditLib.refund(result.orgId, tokens)
  await creditLib.logTransaction(result.orgId, tokens, 'purchase', result.paymentId)

  // Record affiliate referral if coupon was used
  if (result.couponId) {
    const couponResult = await validateCoupon(result.couponId, 'credits')
    if (couponResult.valid && couponResult.couponId && couponResult.affiliateId) {
      const originalAmount = CREDIT_PACKS[result.packId].pkr
      const { discountAmount, finalAmount } = calculateDiscount(
        originalAmount,
        couponResult.discountType!,
        couponResult.discountValue!,
        'PKR',
      )
      const commissionAmount = calculateCommission(finalAmount, couponResult.commissionRate!)

      await recordReferral({
        affiliateId: couponResult.affiliateId,
        couponId: couponResult.couponId,
        orgId: result.orgId,
        paymentType: 'credits',
        originalAmount,
        discountAmount,
        finalAmount,
        commissionRate: couponResult.commissionRate!,
        commissionAmount,
        paymentRefId: result.paymentId,
        currency: 'PKR',
      })
    }
  }

  return new NextResponse('OK', { status: 200 })
}
