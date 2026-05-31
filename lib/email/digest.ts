import type { WeeklyStats } from '@/lib/db/queries/digest'
import { brevo, DIGEST_SENDER } from './clients'
import { LOGO_DARK } from './shared'

function generateDigestHtml(params: {
  developerName: string
  conversationCount: number
  leadCount: number
  unansweredQuestions: WeeklyStats['unansweredQuestions']
  dashboardUrl: string
  weekRange: string
}): string {
  const { developerName, conversationCount, leadCount, unansweredQuestions, dashboardUrl, weekRange } = params

  const unansweredHtml = unansweredQuestions.length > 0
    ? `
      <h3 style="color:#0EA5E9;font-size:13px;margin:20px 0 8px">Top Unanswered Questions</h3>
      ${unansweredQuestions.map((q) => `
        <div style="background:#1a1a1a;border-left:3px solid #0EA5E9;padding:10px 14px;margin-bottom:8px;border-radius:3px">
          <p style="color:#ccc;font-size:13px;margin:0">${q.content.slice(0, 200)}${q.content.length > 200 ? '…' : ''}</p>
          <a href="${dashboardUrl}" style="color:#0EA5E9;font-size:11px;text-decoration:none">View conversation →</a>
        </div>
      `).join('')}
    `
    : '<p style="color:#666;font-size:13px">No unanswered questions this week 🎉</p>'

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Your Octively Week</title></head>
    <body style="background:#0C0A09;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px 20px;margin:0">
      <div style="max-width:560px;margin:0 auto">
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;width:100%;">
          <tr>
            <td>${LOGO_DARK}</td>
            <td style="text-align:right;vertical-align:bottom;padding-bottom:4px;">
              <span style="color:#555;font-size:12px;">${weekRange}</span>
            </td>
          </tr>
        </table>

        <h2 style="font-size:20px;font-weight:600;margin:0 0 6px">Hi ${developerName},</h2>
        <p style="color:#999;font-size:14px;margin:0 0 28px">Here's your weekly summary.</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px">
            <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px">Conversations</p>
            <p style="color:#e5e5e5;font-size:28px;font-weight:700;margin:0;font-family:monospace">${conversationCount}</p>
          </div>
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px">
            <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px">Leads Captured</p>
            <p style="color:#e5e5e5;font-size:28px;font-weight:700;margin:0;font-family:monospace">${leadCount}</p>
          </div>
        </div>

        ${unansweredHtml}

        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #2a2a2a">
          <a href="${dashboardUrl}" style="background:#0EA5E9;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500">
            Open Dashboard →
          </a>
        </div>

        <p style="color:#444;font-size:11px;margin-top:32px">
          You're receiving this because you have a bot on Octively. Sent every Monday at 8am PKT.
        </p>
      </div>
    </body>
    </html>
  `
}

export async function sendDigestEmail(
  developer: { name: string; email: string },
  stats: WeeklyStats,
): Promise<void> {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.octively.com'
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
