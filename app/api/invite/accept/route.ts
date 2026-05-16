import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

const tokenSchema = z.object({ token: z.string().min(1).max(64) })
const acceptSchema = z.object({
  token: z.string().min(1).max(64),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

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

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'INVALID_JSON', status: 400 }, { status: 400 })
  }

  const parsed = acceptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const { token, password } = parsed.data

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

  // Check if user already exists
  const [existingUser] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, invitation.email))
    .limit(1)

  let userId: string

  if (existingUser) {
    userId = existingUser.id
  } else {
    // Create new client account
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: invitation.email,
        password,
        name: invitation.email.split('@')[0],
      },
    })

    if (!signUpResult?.user?.id) {
      return NextResponse.json({ error: 'Account creation failed', code: 'SIGNUP_FAILED', status: 500 }, { status: 500 })
    }

    userId = signUpResult.user.id

    // Set role to client and mark email verified (invite link = verification)
    await db
      .update(schema.users)
      .set({ role: 'client', emailVerified: true })
      .where(eq(schema.users.id, userId))
  }

  // Mark invitation as used
  await db
    .update(schema.invitations)
    .set({ usedAt: new Date() })
    .where(eq(schema.invitations.token, token))

  // Assign client to the bot
  await db
    .update(schema.bots)
    .set({ clientUserId: userId })
    .where(eq(schema.bots.id, invitation.botId))

  return NextResponse.json({ success: true })
}
