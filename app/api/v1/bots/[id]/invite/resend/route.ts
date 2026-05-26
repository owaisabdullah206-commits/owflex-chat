import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq, isNull } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { sendClientInvitation } from '@/lib/email/invitations'
import { createAuditLog } from '@/lib/db/queries/audit'

const bodySchema = z.object({ email: z.string().email() })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireDeveloper()
  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'INVALID_JSON', status: 400 }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const { email } = parsed.data

  const [bot] = await db
    .select({ id: schema.bots.id, name: schema.bots.name, orgId: schema.bots.orgId })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, id), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!bot) {
    return NextResponse.json(
      { error: 'Not authorized', code: 'NOT_AUTHORIZED', status: 403 },
      { status: 403 },
    )
  }

  // Expire all unused tokens for this bot + email
  await db
    .update(schema.invitations)
    .set({ expiresAt: new Date() })
    .where(
      and(
        eq(schema.invitations.botId, id),
        eq(schema.invitations.email, email),
        isNull(schema.invitations.usedAt),
      ),
    )

  // Create fresh invitation
  const token = crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.insert(schema.invitations).values({ botId: id, email, token, expiresAt })

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3000'
  const inviteUrl = `${portalUrl}/portal/invite?token=${token}`

  let emailSent = false
  try {
    const result = await sendClientInvitation({ clientEmail: email, botName: bot.name, inviteUrl })
    emailSent = result.sent
  } catch (err) {
    console.error('Resend invite email failed (non-blocking):', err)
  }

  void createAuditLog({
    orgId:      bot.orgId,
    userId:     user.id,
    action:     'client.invited',
    entityType: 'bot',
    entityId:   id,
    meta:       { email, emailSent, resent: true },
  })

  return NextResponse.json({
    success: true,
    emailSent,
    message: emailSent
      ? `Invitation resent to ${email}`
      : `Invite link created. Email delivery failed — share the invite link manually.`,
  })
}
