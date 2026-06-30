import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import {
  verifyWebhook,
  extractOrderInfo,
  extractSubscriptionInfo,
  type LsOrderPayload,
  type LsSubscriptionPayload,
} from '@/lib/billing/lemon-squeezy'
import * as creditLib from '@/lib/credits'
import { validateCoupon, calculateDiscount, calculateCommission, recordReferral } from '@/lib/affiliates'
import { CREDIT_PACKS, PLAN_PRICES_PKR } from '@/lib/billing/payfast'

const SUBSCRIPTION_EVENTS = new Set(['subscription_created', 'subscription_payment_success'])

export async function POST(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer())
  const signature = req.headers.get('x-signature') ?? ''
  const eventName = req.headers.get('x-event-name') ?? ''

  const { valid } = verifyWebhook(rawBody, signature)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Plan subscription events
  if (SUBSCRIPTION_EVENTS.has(eventName)) {
    let payload: LsSubscriptionPayload
    try {
      payload = JSON.parse(rawBody.toString()) as LsSubscriptionPayload
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { subscriptionId, status, orgId, planId, couponId } = extractSubscriptionInfo(payload)

    if (status !== 'active' || !orgId || !planId) {
      return NextResponse.json({ received: true })
    }

    const [existing] = await db
      .select({ id: schema.creditTransactions.id })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.refId, subscriptionId))
      .limit(1)

    if (!existing) {
      const [org] = await db
        .select({ plan: schema.organizations.plan })
        .from(schema.organizations)
        .where(eq(schema.organizations.id, orgId))
        .limit(1)
      const fromPlan = org?.plan ?? 'free'

      await db
        .update(schema.organizations)
        .set({ plan: planId })
        .where(eq(schema.organizations.id, orgId))

      await creditLib.upgradePlanCredits(orgId, fromPlan, planId)
      await creditLib.logTransaction(orgId, 0, 'plan_upgrade', subscriptionId)

      // Record affiliate referral if coupon was used
      if (couponId) {
        const couponResult = await validateCoupon(couponId, 'plan')
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
            orgId,
            paymentType: 'plan',
            originalAmount,
            discountAmount,
            finalAmount,
            commissionRate: couponResult.commissionRate!,
            commissionAmount,
            paymentRefId: subscriptionId,
            currency: 'PKR',
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  }

  // Credit pack order_created event
  if (eventName !== 'order_created') {
    return NextResponse.json({ received: true })
  }

  let payload: LsOrderPayload
  try {
    payload = JSON.parse(rawBody.toString()) as LsOrderPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { orderId, status, orgId, packId, tokens, couponId } = extractOrderInfo(payload)

  if (status !== 'paid' || !orgId || !packId || tokens === 0) {
    return NextResponse.json({ received: true })
  }

  const [existing] = await db
    .select({ id: schema.creditTransactions.id })
    .from(schema.creditTransactions)
    .where(eq(schema.creditTransactions.refId, orderId))
    .limit(1)

  if (!existing) {
    await creditLib.refund(orgId, tokens)
    await creditLib.logTransaction(orgId, tokens, 'purchase', orderId)

    // Record affiliate referral if coupon was used
    if (couponId) {
      const couponResult = await validateCoupon(couponId, 'credits')
      if (couponResult.valid && couponResult.couponId && couponResult.affiliateId) {
        const originalAmount = CREDIT_PACKS[packId].pkr
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
          orgId,
          paymentType: 'credits',
          originalAmount,
          discountAmount,
          finalAmount,
          commissionRate: couponResult.commissionRate!,
          commissionAmount,
          paymentRefId: orderId,
          currency: 'PKR',
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
