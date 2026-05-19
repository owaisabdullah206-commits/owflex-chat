import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyItn, CREDIT_PACKS, type PlanId } from '@/lib/billing/payfast'
import * as creditLib from '@/lib/credits'

const VALID_PLAN_IDS = new Set<string>(['starter', 'pro', 'agency'])

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

  // Plan upgrade branch: m_payment_id starts with 'plan:'
  if (result.paymentId.startsWith('plan:')) {
    // format: plan:{orgId}:{planId}:{timestamp}
    const parts = result.paymentId.split(':')
    const planId = parts[2] ?? ''

    if (!planId || !VALID_PLAN_IDS.has(planId)) {
      console.error('[payfast] invalid plan ITN — unknown planId', { paymentId: result.paymentId })
      return new NextResponse('OK', { status: 200 })
    }

    // Idempotency check
    const [existing] = await db
      .select({ id: schema.creditTransactions.id })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.refId, result.paymentId))
      .limit(1)

    if (!existing) {
      await db
        .update(schema.organizations)
        .set({ plan: planId as PlanId })
        .where(eq(schema.organizations.id, result.orgId))
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
