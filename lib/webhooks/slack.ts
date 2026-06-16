// Slack Incoming Webhook delivery for lead capture. Separate from the generic
// signed lead webhook (lib/webhooks/outbound.ts): Slack posts go to a fixed,
// trusted host and use Slack's own message format, so no HMAC signing is needed.

export interface SlackLeadInput {
  botName:   string
  name?:     string | null
  email?:    string | null
  phone?:    string | null
  notes?:    string | null
  pageUrl?:  string | null
}

// Slack Incoming Webhooks are always https://hooks.slack.com/services/...
// Restricting to that host removes the SSRF surface a free-form URL would add.
export function isSlackWebhookUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && u.hostname === 'hooks.slack.com'
  } catch {
    return false
  }
}

/**
 * Posts a formatted lead notification to a Slack Incoming Webhook.
 * Fire-and-forget — never throws; logs failures only, so it can never block or
 * fail lead capture.
 */
export async function fireSlackLeadNotification(
  webhookUrl: string,
  lead:       SlackLeadInput,
): Promise<void> {
  if (!isSlackWebhookUrl(webhookUrl)) {
    console.error('[slack] rejected non-Slack webhook URL')
    return
  }

  const fields: string[] = []
  if (lead.name)  fields.push(`*Name:* ${lead.name}`)
  if (lead.email) fields.push(`*Email:* ${lead.email}`)
  if (lead.phone) fields.push(`*Phone:* ${lead.phone}`)
  if (lead.notes) fields.push(`*Notes:* ${lead.notes}`)

  const text = `:tada: *New lead* from *${lead.botName}*\n${fields.join('\n')}`

  const payload = {
    text,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text },
      },
      ...(lead.pageUrl
        ? [{
            type: 'context',
            elements: [{ type: 'mrkdwn', text: `Captured on ${lead.pageUrl}` }],
          }]
        : []),
    ],
  }

  try {
    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(10_000),
      redirect: 'error',
    })
    if (!res.ok) {
      console.warn(`[slack] webhook responded ${res.status}`)
    }
  } catch (err) {
    console.error('[slack] delivery failed:', err instanceof Error ? err.message : err)
  }
}
