import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail({
  name,
  email,
}: {
  name: string
  email: string
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.owflex.com'
  const dashboardUrl = `${appUrl}/dashboard`

  try {
    await resend.emails.send({
      from: 'OwFlex <noreply@owflex.com>',
      to: email,
      subject: 'Welcome to OwFlex — your first bot is one step away',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;">
          <h2 style="font-size:22px;margin-bottom:6px;">Welcome, ${name}!</h2>
          <p style="margin:0 0 20px;color:#444;">Your OwFlex account is ready. Here's what you get on the free plan:</p>

          <div style="background:#F5F1EC;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#111;">Bots</td>
                <td style="padding:6px 0;font-size:14px;color:#111;text-align:right;font-weight:600;">1</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#111;">Conversations/mo</td>
                <td style="padding:6px 0;font-size:14px;color:#111;text-align:right;font-weight:600;">200</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#111;">Leads/mo</td>
                <td style="padding:6px 0;font-size:14px;color:#111;text-align:right;font-weight:600;">15</td>
              </tr>
            </table>
          </div>

          <p style="font-weight:600;margin:0 0 12px;">Get started in 3 steps:</p>
          <ol style="padding-left:20px;margin:0 0 24px;color:#444;line-height:1.8;">
            <li>Create your first bot — write a system prompt and configure lead capture</li>
            <li>Copy the embed script — one &lt;script&gt; tag into your client's site</li>
            <li>Invite your client — they log in to view conversations and leads</li>
          </ol>

          <a
            href="${dashboardUrl}"
            style="display:inline-block;background:#0EA5E9;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;margin-bottom:28px;"
          >
            Go to dashboard →
          </a>

          <p style="margin:0;font-size:12px;color:#888;">
            You're receiving this because you created an OwFlex account with ${email}.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] sendWelcomeEmail failed:', err)
  }
}
