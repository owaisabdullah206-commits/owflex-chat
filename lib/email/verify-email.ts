import { resend, RESEND_FROM } from './clients'
import { LOGO_LIGHT } from './shared'

export async function sendVerificationEmail({
  email,
  name,
  url,
}: {
  email: string
  name: string
  url: string
}): Promise<void> {
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: 'Verify your Octively email address',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;">
          ${LOGO_LIGHT}
          <h2 style="font-size:22px;font-weight:700;margin:0 0 10px;">Welcome, ${name}!</h2>
          <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.6;">
            Before you can access your dashboard, please verify your email address.
          </p>
          <a
            href="${url}"
            style="display:inline-block;background:#0EA5E9;color:#fff;text-decoration:none;padding:13px 30px;border-radius:8px;font-weight:600;font-size:15px;margin-bottom:28px;"
          >
            Verify email address →
          </a>
          <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
            This link expires in 1 hour. If you didn't create an Octively account, you can safely ignore this email.
          </p>
          <p style="margin:0;font-size:12px;color:#aaa;">
            Or copy this URL into your browser:<br/>
            <span style="color:#0EA5E9;word-break:break-all;">${url}</span>
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] sendVerificationEmail failed:', err)
  }
}
