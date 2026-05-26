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

const SUBSCRIPTION_EVENTS = new Set(['subscription_created', 'subscription_payment_success'])

export async function POST(req: NextRequest) {
  // Must read raw body BEFORE parsing JSON for HMAC verification
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

    const { subscriptionId, status, orgId, planId } = extractSubscriptionInfo(payload)

    if (status !== 'active' || !orgId || !planId) {
      return NextResponse.json({ received: true })
    }

    // Idempotency check
    const [existing] = await db
      .select({ id: schema.creditTransactions.id })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.refId, subscriptionId))
      .limit(1)

    if (!existing) {
      // Read the current plan BEFORE updating so we can compute the credit delta
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

      // Top up Redis balance by the difference between the two plan allocations
      await creditLib.upgradePlanCredits(orgId, fromPlan, planId)
      await creditLib.logTransaction(orgId, 0, 'plan_upgrade', subscriptionId)
    }

    return NextResponse.json({ received: true })
  }

  // Credit pack order_created event (existing logic)
  if (eventName !== 'order_created') {
    return NextResponse.json({ received: true })
  }

  let payload: LsOrderPayload
  try {
    payload = JSON.parse(rawBody.toString()) as LsOrderPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { orderId, status, orgId, packId, tokens } = extractOrderInfo(payload)

  if (status !== 'paid' || !orgId || !packId || tokens === 0) {
    return NextResponse.json({ received: true })
  }

  // Idempotency: check if this order was already credited
  const [existing] = await db
    .select({ id: schema.creditTransactions.id })
    .from(schema.creditTransactions)
    .where(eq(schema.creditTransactions.refId, orderId))
    .limit(1)

  if (!existing) {
    await creditLib.refund(orgId, tokens)
    await creditLib.logTransaction(orgId, tokens, 'purchase', orderId)
  }

  return NextResponse.json({ received: true })
}
