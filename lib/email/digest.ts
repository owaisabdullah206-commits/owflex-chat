import type { WeeklyStats } from '@/lib/db/queries/digest'
import { brevo, DIGEST_SENDER } from './clients'
import { LOGO_LIGHT } from './shared'
import { getAppBaseUrl } from '@/lib/url'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function generateDigestHtml(params: {
  developerName: string
  conversationCount: number
  leadCount: number
  unansweredQuestions: WeeklyStats['unansweredQuestions']
  dashboardUrl: string
  weekRange: string
}): string {
  const { developerName, conversationCount, leadCount, unansweredQuestions, dashboardUrl, weekRange } = params

  // Metric card (table-based — CSS grid/flex are unreliable in email clients)
  const metricCard = (label: string, value: number) => `
    <td width="50%" valign="top" style="padding:0">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
        <tr><td style="padding:18px 20px">
          <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px">${label}</p>
          <p style="color:#0f172a;font-size:30px;font-weight:700;line-height:1;margin:0">${value.toLocaleString()}</p>
        </td></tr>
      </table>
    </td>`

  const unansweredHtml = unansweredQuestions.length > 0
    ? `
      <h3 style="color:#0f172a;font-size:14px;font-weight:600;margin:28px 0 10px">Top unanswered questions</h3>
      ${unansweredQuestions.map((q) => `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px">
          <tr><td style="background:#f8fafc;border-left:3px solid #0EA5E9;padding:11px 14px;border-radius:4px">
            <p style="color:#334155;font-size:13px;line-height:1.5;margin:0 0 4px">${esc(q.content.slice(0, 200))}${q.content.length > 200 ? '…' : ''}</p>
            <a href="${dashboardUrl}" style="color:#0EA5E9;font-size:11px;text-decoration:none;font-weight:600">View conversation →</a>
          </td></tr>
        </table>
      `).join('')}
    `
    : '<p style="color:#64748b;font-size:13px;margin:24px 0 0">No unanswered questions this week 🎉</p>'

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Octively Week</title></head>
    <body style="background:#f1f5f9;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f1f5f9">
        <tr><td align="center" style="padding:32px 16px">
          <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px">
            <tr><td style="padding:32px 32px 28px">

              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:22px">
                <tr>
                  <td valign="middle">${LOGO_LIGHT}</td>
                  <td valign="middle" align="right"><span style="color:#94a3b8;font-size:12px">${weekRange}</span></td>
                </tr>
              </table>

              <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 4px">Hi ${esc(developerName)},</h2>
              <p style="color:#64748b;font-size:14px;margin:0 0 24px">Here's your weekly summary.</p>

              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px">
                <tr>
                  ${metricCard('Conversations', conversationCount)}
                  <td width="12" style="font-size:0;line-height:0">&nbsp;</td>
                  ${metricCard('Leads Captured', leadCount)}
                </tr>
              </table>

              ${unansweredHtml}

              <table cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 6px">
                <tr><td style="border-radius:8px;background:#0EA5E9">
                  <a href="${dashboardUrl}" style="display:inline-block;padding:11px 22px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">Open Dashboard →</a>
                </td></tr>
              </table>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px">
              <p style="color:#94a3b8;font-size:11px;line-height:1.5;margin:0">
                You're receiving this because you have a bot on Octively. Sent every Monday at 8am PKT.
              </p>

            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `
}

export async function sendDigestEmail(
  developer: { name: string; email: string },
  stats: WeeklyStats,
): Promise<void> {
  const dashboardUrl = getAppBaseUrl()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekRange = `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  await brevo.transactionalEmails.sendTransacEmail({
    sender: DIGEST_SENDER,
    to: [{ email: developer.email, name: developer.name }],
    subject: `Your Octively Week: ${stats.conversationCount} conversations, ${stats.leadCount} leads`,
    htmlContent: generateDigestHtml({
      developerName: developer.name,
      conversationCount: stats.conversationCount,
      leadCount: stats.leadCount,
      unansweredQuestions: stats.unansweredQuestions,
      dashboardUrl,
      weekRange,
    }),
  })
}
