import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCreditGraceEmail({
  to,
  botName,
}: {
  to: string
  botName: string
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.owflex.com'
  const billingUrl = `${appUrl}/dashboard/billing`

  try {
    await resend.emails.send({
      from: 'OwFlex <noreply@owflex.com>',
      to,
      subject: `Your bot "${botName}" is running on the default model — 2 hours before service interruption`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;">
          <h2 style="font-size:20px;margin-bottom:8px;">Credits depleted</h2>
          <p style="margin:0 0 16px;">Your bot <strong>"${botName}"</strong> ran out of LLM credits and is now running on the default model (DeepSeek Flash).</p>
          <p style="margin:0 0 16px;">You have a <strong>2-hour grace period</strong> — your bots will continue responding during this window. If you don't top up before the grace period ends, your bots will be temporarily disabled until you add more credits.</p>
          <a href="${billingUrl}" style="display:inline-block;background:#0EA5E9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;margin-bottom:24px;">Top Up Now</a>
          <p style="margin:0;font-size:13px;color:#666;">You're receiving this because your bot "${botName}" exhausted its credit balance. This email is sent once per billing cycle.</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] sendCreditGraceEmail failed:', err)
  }
}
