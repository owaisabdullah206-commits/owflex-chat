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

  if (!result.valid || !result.orgId || !result.packId) {
    // Always return 200 to PayFast — log invalid but don't retry
    console.error('[payfast] invalid ITN', { valid: result.valid, paymentId: result.paymentId })
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
