import { Resend } from 'resend'
import { LOGO_LIGHT } from './shared'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendResetPasswordEmail({
  email,
  url,
}: {
  email: string
  url: string
}): Promise<void> {
  try {
    await resend.emails.send({
      from: 'Octively <noreply@octively.com>',
      to: email,
      subject: 'Reset your Octively password',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;">
          ${LOGO_LIGHT}
          <h2 style="font-size:20px;font-weight:600;margin:0 0 8px;">Reset your password</h2>
          <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
            We received a request to reset the password for your Octively account. Click the button below to choose a new password. This link expires in 1 hour.
          </p>

          <a
            href="${url}"
            style="display:inline-block;background:#0EA5E9;color:#fff;text-decoration:none;padding:12px 28px;font-weight:600;font-size:14px;margin-bottom:28px;"
          >
            Reset password →
          </a>

          <p style="margin:0 0 8px;font-size:13px;color:#888;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
          <p style="margin:0;font-size:12px;color:#aaa;">
            This link is only valid for 1 hour and can only be used once.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] sendResetPasswordEmail failed:', err)
  }
}
