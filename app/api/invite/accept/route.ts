import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

const tokenSchema = z.object({ token: z.string().min(1).max(64) })

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const parsed = tokenSchema.safeParse({ token: searchParams.get('token') })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid token', code: 'INVALID_TOKEN', status: 400 }, { status: 400 })
  }

  const [invitation] = await db
    .select({
      id: schema.invitations.id,
      email: schema.invitations.email,
      botId: schema.invitations.botId,
      expiresAt: schema.invitations.expiresAt,
      usedAt: schema.invitations.usedAt,
    })
    .from(schema.invitations)
    .where(eq(schema.invitations.token, parsed.data.token))
    .limit(1)

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found', code: 'NOT_FOUND', status: 404 }, { status: 404 })
  }
  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invitation expired', code: 'EXPIRED', status: 410 }, { status: 410 })
  }
  if (invitation.usedAt !== null) {
    return NextResponse.json({ error: 'Invitation already accepted', code: 'ALREADY_USED', status: 409 }, { status: 409 })
  }

  return NextResponse.json({ valid: true, email: invitation.email, botId: invitation.botId })
}

// POST: called after the client has already signed up via authClient.signUp.email()
// Just marks the invite used, sets role=client, and assigns the bot.
export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'INVALID_JSON', status: 400 }, { status: 400 })
  }

  const parsed = tokenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const { token } = parsed.data

  const [invitation] = await db
    .select()
    .from(schema.invitations)
    .where(eq(schema.invitations.token, token))
    .limit(1)

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found', code: 'NOT_FOUND', status: 404 }, { status: 404 })
  }
  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invitation expired', code: 'EXPIRED', status: 410 }, { status: 410 })
  }
  if (invitation.usedAt !== null) {
    return NextResponse.json({ error: 'Already accepted', code: 'ALREADY_USED', status: 409 }, { status: 409 })
  }

  // Find the user who just signed up with this email
  const [user] = await db
    .select({ id: schema.users.id, role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.email, invitation.email))
    .limit(1)

  if (!user) {
    return NextResponse.json(
      { error: 'Account not found. Please create your account first.', code: 'USER_NOT_FOUND', status: 400 },
      { status: 400 },
    )
  }

  // Developers testing with their own email keep their developer role so the
  // dashboard stays accessible — requireClient() lets them through because they
  // have a bot assigned. Real clients always get role=client.
  const userUpdates = user.role === 'developer'
    ? { emailVerified: true }
    : { role: 'client' as const, emailVerified: true }

  await Promise.all([
    db.update(schema.users)
      .set(userUpdates)
      .where(eq(schema.users.id, user.id)),
    db.update(schema.invitations)
      .set({ usedAt: new Date() })
      .where(eq(schema.invitations.token, token)),
    db.update(schema.bots)
      .set({ clientUserId: user.id })
      .where(eq(schema.bots.id, invitation.botId)),
  ])

  return NextResponse.json({ success: true })
}
