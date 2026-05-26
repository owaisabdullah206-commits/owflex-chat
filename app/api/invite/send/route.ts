import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { sendClientInvitation } from '@/lib/email/invitations'
import { createAuditLog } from '@/lib/db/queries/audit'

const bodySchema = z.object({
  botId: z.string().uuid(),
  clientEmail: z.string().email(),
})

export async function POST(req: NextRequest) {
  const user = await requireDeveloper()

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

  const { botId, clientEmail } = parsed.data

  // Verify bot ownership
  const [bot] = await db
    .select({ id: schema.bots.id, name: schema.bots.name, orgId: schema.bots.orgId })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!bot) {
    return NextResponse.json(
      { error: 'Not authorized', code: 'NOT_AUTHORIZED', status: 403 },
      { status: 403 },
    )
  }

  // Check for active unused non-expired invitation
  const now = new Date()
  const [existingInvite] = await db
    .select({ id: schema.invitations.id })
    .from(schema.invitations)
    .where(
      and(
        eq(schema.invitations.botId, botId),
        eq(schema.invitations.email, clientEmail),
        isNull(schema.invitations.usedAt),
        gt(schema.invitations.expiresAt, now),
      ),
    )
    .limit(1)

  if (existingInvite) {
    return NextResponse.json(
      { error: 'Already invited', code: 'ALREADY_INVITED', status: 409 },
      { status: 409 },
    )
  }

  // Generate token and create invitation
  const token = crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.insert(schema.invitations).values({
    botId,
    email: clientEmail,
    token,
    expiresAt,
  })

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3000'
  const inviteUrl = `${portalUrl}/portal/invite?token=${token}`

  let emailSent = false
  try {
    const result = await sendClientInvitation({ clientEmail, botName: bot.name, inviteUrl })
    emailSent = result.sent
  } catch (err) {
    console.error('Invitation email failed (non-blocking):', err)
  }

  void createAuditLog({
    orgId:      bot.orgId,
    userId:     user.id,
    action:     'client.invited',
    entityType: 'bot',
    entityId:   botId,
    meta:       { clientEmail, emailSent },
  })

  return NextResponse.json({
    success: true,
    emailSent,
    inviteUrl,
    message: emailSent
      ? `Invitation sent to ${clientEmail}`
      : `Invite link created. Email delivery failed — share the invite link manually.`,
  })
}
