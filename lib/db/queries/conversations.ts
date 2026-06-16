'use server'

import { eq, and } from 'drizzle-orm'
import { Resend } from 'resend'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'not-configured')

export async function acceptHandoff(conversationId: string): Promise<{ error?: string }> {
  const user = await requireDeveloper()

  // Verify ownership before updating
  const [conv] = await db
    .select({ id: schema.conversations.id })
    .from(schema.conversations)
    .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(
      and(
        eq(schema.conversations.id, conversationId),
        eq(schema.organizations.ownerId, user.id),
      )
    )
    .limit(1)

  if (!conv) return { error: 'Conversation not found' }

  await db
    .update(schema.conversations)
    .set({ needsHuman: false, escalatedAt: null })
    .where(eq(schema.conversations.id, conversationId))

  return {}
}

export async function replyByEmail(
  conversationId: string,
  message: string,
): Promise<{ error?: string }> {
  const user = await requireDeveloper()

  // Load conversation + bot name + visitor lead email in one shot
  const [row] = await db
    .select({
      botName:      schema.bots.name,
      ownerEmail:   schema.users.email,
      orgId:        schema.organizations.id,
    })
    .from(schema.conversations)
    .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .innerJoin(schema.users, eq(schema.organizations.ownerId, schema.users.id))
    .where(
      and(
        eq(schema.conversations.id, conversationId),
        eq(schema.organizations.ownerId, user.id),
      )
    )
    .limit(1)

  if (!row) return { error: 'Conversation not found' }

  const [lead] = await db
    .select({ name: schema.leads.name, email: schema.leads.email })
    .from(schema.leads)
    .where(eq(schema.leads.conversationId, conversationId))
    .limit(1)

  if (!lead?.email) return { error: 'No visitor email found for this conversation' }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'octively <onboarding@resend.dev>',
    to: lead.email,
    replyTo: row.ownerEmail,
    subject: `Follow-up from ${row.botName}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <div style="margin-bottom:20px">
          <span style="font-size:18px;font-weight:700;color:#0EA5E9">${row.botName}</span>
        </div>
        <p style="font-size:15px;color:#1e293b;line-height:1.7;margin:0 0 24px;white-space:pre-wrap">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
        <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.5">
          You can reply to this email directly and we'll get back to you.
        </p>
      </div>
    `,
  })

  if (error) return { error: error.message ?? 'Failed to send email' }
  return {}
}
