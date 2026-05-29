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

// RFC-1918 + loopback + link-local + cloud-metadata ranges to block (SSRF defence).
const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,          // link-local / AWS metadata
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // CGNAT
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^0\./,
]

/**
 * Validates that `url` is a public https endpoint.
 * Blocks http, non-https schemes, and private/loopback/metadata hostnames.
 */
function assertSafeWebhookUrl(url: string): void {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`[webhook] invalid URL: ${url}`)
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`[webhook] only https webhooks are allowed (got ${parsed.protocol})`)
  }
  const host = parsed.hostname
  // Block IP literals (private ranges and metadata endpoints)
  for (const re of PRIVATE_RANGES) {
    if (re.test(host)) {
      throw new Error(`[webhook] private/internal host blocked: ${host}`)
    }
  }
  // Block localhost by name
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error(`[webhook] localhost/internal host blocked: ${host}`)
  }
}

/**
 * Signs and delivers a lead webhook to the developer's configured URL.
 * Fire-and-forget — never throws; logs delivery failures only.
 *
 * Verification (receiver side):
 *   const sig = createHmac('sha256', WEBHOOK_SIGNING_SECRET).update(rawBody).digest('hex')
 *   const match = timingSafeEqual(Buffer.from(sig), Buffer.from(header.replace('sha256=', '')))
 */
export async function fireLeadWebhook(
  webhookUrl: string,
  payload:    LeadWebhookPayload,
): Promise<void> {
  try {
    assertSafeWebhookUrl(webhookUrl)
  } catch (err) {
    console.error('[webhook] SSRF guard rejected URL:', err instanceof Error ? err.message : err)
    return
  }

  const secret = process.env.WEBHOOK_SIGNING_SECRET
  if (!secret) {
    // Fail closed: skip delivery rather than send unsigned/predictable-secret webhooks.
    console.error('[webhook] WEBHOOK_SIGNING_SECRET not configured — skipping delivery to', webhookUrl)
    return
  }

  const body = JSON.stringify(payload)
  const sig  = createHmac('sha256', secret).update(body).digest('hex')

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
