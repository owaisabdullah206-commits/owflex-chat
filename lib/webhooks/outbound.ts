import { createHmac } from 'crypto'

export interface LeadWebhookPayload {
  event:      'lead.captured'
  embedKey:   string
  sessionId:  string
  lead: {
    name?:   string | null
    email?:  string | null
    phone?:  string | null
    notes?:  string | null
  }
  capturedAt: string
}

/**
 * Signs and delivers a lead webhook to the developer's configured URL.
 * Fire-and-forget — never throws; logs delivery failures only.
 *
 * Verification (receiver side):
 *   const sig = createHmac('sha256', process.env.WEBHOOK_SIGNING_SECRET).update(rawBody).digest('hex')
 *   const match = timingSafeEqual(Buffer.from(sig), Buffer.from(header.replace('sha256=', '')))
 */
export async function fireLeadWebhook(
  webhookUrl: string,
  payload:    LeadWebhookPayload,
): Promise<void> {
  const body   = JSON.stringify(payload)
  const secret = process.env.WEBHOOK_SIGNING_SECRET ?? 'owflex-webhook-secret'
  const sig    = createHmac('sha256', secret).update(body).digest('hex')

  try {
    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: {
        'Content-Type':       'application/json',
        'X-OwFlex-Signature': `sha256=${sig}`,
        'X-OwFlex-Event':     'lead.captured',
        'User-Agent':         'OwFlex-Webhook/1.0',
      },
      body,
      // 10-second hard timeout — never block lead capture on slow receivers
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.warn(`[webhook] ${webhookUrl} responded ${res.status}`)
    }
  } catch (err) {
    console.error('[webhook] delivery failed:', webhookUrl, err instanceof Error ? err.message : err)
  }
}
