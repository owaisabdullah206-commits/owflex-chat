import { resend, RESEND_FROM } from './clients'
import { LOGO_LIGHT } from './shared'

interface SendClientInvitationParams {
  clientEmail: string
  botName: string
  inviteUrl: string
}

export async function sendClientInvitation({
  clientEmail,
  botName,
  inviteUrl,
}: SendClientInvitationParams): Promise<{ sent: boolean }> {
  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: clientEmail,
      subject: `You've been invited to view ${botName}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1e293b">
          ${LOGO_LIGHT}
          <h2 style="font-size:22px;font-weight:700;margin:0 0 12px">You're invited!</h2>
          <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6">
            You've been given access to view <strong>${botName}</strong>'s chatbot dashboard:
            conversations, leads, and activity all in one place.
          </p>
          <a
            href="${inviteUrl}"
            style="display:inline-block;background:#0EA5E9;color:#ffffff;font-weight:600;
                   font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none"
          >
            Accept Invitation
          </a>
          <p style="font-size:13px;color:#94a3b8;margin:24px 0 0;line-height:1.5">
            This link expires in 7 days. If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error sending invitation:', error.message)
      return { sent: false }
    }

    return { sent: true }
  } catch (err) {
    console.error('Unexpected error sending invitation email:', err)
    return { sent: false }
  }
}
