import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type Metric = 'conversations' | 'credits' | 'leads'

export async function sendUsageWarningEmail({
  to,
  metric,
  pctUsed,
  remaining,
  planName,
}: {
  to: string
  metric: Metric
  pctUsed: number
  remaining: number
  planName: string
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.owflex.com'
  const billingUrl = `${appUrl}/dashboard/billing`
  const metricLabel = metric === 'credits' ? 'credits' : metric

  try {
    await resend.emails.send({
      from: 'OwFlex <noreply@owflex.com>',
      to,
      subject: `You've used ${pctUsed}% of your ${planName} ${metricLabel} limit`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;">
          <h2 style="font-size:20px;margin-bottom:8px;">Approaching your ${metricLabel} limit</h2>
          <p style="margin:0 0 16px;color:#444;">
            You've used <strong>${pctUsed}%</strong> of your <strong>${planName}</strong> ${metricLabel} allocation this month.
            You have <strong>${remaining.toLocaleString()}</strong> remaining.
          </p>
          <p style="margin:0 0 20px;color:#444;">
            ${metric === 'credits'
              ? 'Consider topping up credits to avoid switching to the default model.'
              : `Consider upgrading your plan before you hit the ${metricLabel} cap.`}
          </p>
          <a
            href="${billingUrl}"
            style="display:inline-block;background:#0EA5E9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;margin-bottom:24px;"
          >
            Upgrade or top up →
          </a>
          <p style="margin:0;font-size:13px;color:#888;">
            You'll receive this alert once per metric per billing cycle.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] sendUsageWarningEmail failed:', err)
  }
}
