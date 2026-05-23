import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface HandoffNotificationParams {
  ownerEmail: string
  botName: string
  conversationId: string
  lastUserMessage: string
  visitorName?: string
  visitorEmail?: string
}

export async function sendHandoffNotification({
  ownerEmail,
  botName,
  conversationId,
  lastUserMessage,
  visitorName,
  visitorEmail,
}: HandoffNotificationParams): Promise<void> {
  const convUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://octively.vercel.app'}/dashboard/conversations/${conversationId}`
  const visitorLabel = visitorName ?? visitorEmail ?? 'Anonymous visitor'

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'octively <onboarding@resend.dev>',
    to: ownerEmail,
    subject: `Human handoff requested — ${botName}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <div style="margin-bottom:20px">
          <span style="font-size:18px;font-weight:700;color:#0EA5E9">Octively</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">A visitor needs a human</h2>
        <p style="font-size:14px;color:#475569;margin:0 0 20px;line-height:1.6">
          <strong>${visitorLabel}</strong> asked a question your bot <strong>${botName}</strong> couldn't confidently answer.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #0EA5E9;border-radius:6px;padding:14px 16px;margin-bottom:24px">
          <p style="font-size:12px;color:#94a3b8;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Last message</p>
          <p style="font-size:14px;color:#1e293b;margin:0;line-height:1.5">${lastUserMessage.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
        </div>
        ${visitorEmail ? `
        <p style="font-size:13px;color:#475569;margin:0 0 20px">
          Contact: <a href="mailto:${visitorEmail}" style="color:#0EA5E9">${visitorEmail}</a>
        </p>` : ''}
        <a
          href="${convUrl}"
          style="display:inline-block;background:#0EA5E9;color:#ffffff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none"
        >
          View Conversation →
        </a>
        <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;line-height:1.5">
          You can accept the handoff and reply directly from your dashboard.
        </p>
      </div>
    `,
  })
}
