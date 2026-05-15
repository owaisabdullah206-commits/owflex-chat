import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyWebhook, extractOrderInfo, type LsOrderPayload } from '@/lib/billing/lemon-squeezy'
import * as creditLib from '@/lib/credits'

export async function POST(req: NextRequest) {
  // Must read raw body BEFORE parsing JSON for HMAC verification
  const rawBody = Buffer.from(await req.arrayBuffer())
  const signature = req.headers.get('x-signature') ?? ''
  const eventName = req.headers.get('x-event-name') ?? ''

  const { valid } = verifyWebhook(rawBody, signature)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

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
