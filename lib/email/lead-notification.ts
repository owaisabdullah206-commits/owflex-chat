import { resend, RESEND_FROM } from './clients'
import { LOGO_LIGHT } from './shared'

interface LeadNotificationParams {
  ownerEmail: string
  botName: string
  leadName?: string | null
  leadEmail?: string | null
  leadPhone?: string | null
  leadNotes?: string | null
  conversationId?: string | null
}

export async function sendLeadNotification({
  ownerEmail,
  botName,
  leadName,
  leadEmail,
  leadPhone,
  leadNotes,
  conversationId,
}: LeadNotificationParams): Promise<void> {
  const leadsUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.octively.com'}/dashboard/leads`
  const convUrl = conversationId
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.octively.com'}/dashboard/conversations/${conversationId}`
    : null

  const displayName = leadName ?? leadEmail ?? leadPhone ?? 'Anonymous visitor'

  const contactRows = [
    leadName  && `<tr><td style="font-size:12px;color:#94a3b8;padding:4px 0;width:80px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Name</td><td style="font-size:14px;color:#1e293b;padding:4px 0">${leadName.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>`,
    leadEmail && `<tr><td style="font-size:12px;color:#94a3b8;padding:4px 0;width:80px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Email</td><td style="font-size:14px;color:#1e293b;padding:4px 0"><a href="mailto:${leadEmail}" style="color:#0EA5E9;text-decoration:none">${leadEmail}</a></td></tr>`,
    leadPhone && `<tr><td style="font-size:12px;color:#94a3b8;padding:4px 0;width:80px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Phone</td><td style="font-size:14px;color:#1e293b;padding:4px 0">${leadPhone.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>`,
    leadNotes && `<tr><td style="font-size:12px;color:#94a3b8;padding:4px 0;width:80px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Notes</td><td style="font-size:14px;color:#1e293b;padding:4px 0">${leadNotes.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>`,
  ].filter(Boolean).join('')

  await resend.emails.send({
    from: RESEND_FROM,
    to: ownerEmail,
    subject: `New lead captured — ${botName}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
        ${LOGO_LIGHT}
        <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">New lead captured</h2>
        <p style="font-size:14px;color:#475569;margin:0 0 20px;line-height:1.6">
          <strong>${displayName.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</strong> submitted their contact details via your bot <strong>${botName.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</strong>.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #0EA5E9;border-radius:6px;padding:14px 16px;margin-bottom:24px">
          <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
            ${contactRows}
          </table>
        </div>
        <a
          href="${convUrl ?? leadsUrl}"
          style="display:inline-block;background:#0EA5E9;color:#ffffff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none"
        >${convUrl ? 'View Conversation →' : 'View All Leads →'}</a>
        <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;line-height:1.5">
          You are receiving this because lead capture is enabled on one of your bots.
        </p>
      </div>
    `,
  })
}
