'use server'

import { eq, and, gt } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'not-configured')

const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Send a magic link to an affiliate's email.
 * Creates a session token and sends an email with the login link.
 */
export async function sendMagicLink(email: string): Promise<{ error?: string; success?: boolean }> {
  const trimmed = email.trim().toLowerCase()

  const [affiliate] = await db
    .select({ id: schema.affiliates.id, name: schema.affiliates.name, isActive: schema.affiliates.isActive })
    .from(schema.affiliates)
    .where(eq(schema.affiliates.email, trimmed))
    .limit(1)

  if (!affiliate) {
    // Don't reveal whether the email exists
    return { success: true }
  }

  if (!affiliate.isActive) {
    return { success: true }
  }

  // Generate token
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS)

  // Delete any existing sessions for this affiliate
  await db
    .delete(schema.affiliateSessions)
    .where(eq(schema.affiliateSessions.affiliateId, affiliate.id))

  // Create new session
  await db.insert(schema.affiliateSessions).values({
    affiliateId: affiliate.id,
    token,
    expiresAt,
  })

  // Send email
  const appUrl = process.env.BETTER_AUTH_URL ?? 'https://affiliates.octively.com'
  const loginUrl = `${appUrl}/login?token=${token}`

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Octively <onboarding@resend.dev>',
      to: trimmed,
      subject: 'Your Octively Affiliate Login Link',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1e293b">
          <p style="font-size:15px;margin:0 0 16px">Hi ${affiliate.name},</p>
          <p style="font-size:15px;margin:0 0 24px;line-height:1.6">
            Click the button below to log in to your affiliate dashboard. This link expires in 15 minutes.
          </p>
          <a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#0EA5E9;color:#fff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">
            Log in to Dashboard
          </a>
          <p style="font-size:13px;color:#94a3b8;margin:24px 0 0;line-height:1.5">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[affiliate-auth] failed to send magic link', err)
    return { error: 'Failed to send email. Please try again.' }
  }

  return { success: true }
}

/**
 * Verify a magic link token and return the affiliate ID.
 * Returns null if the token is invalid or expired.
 */
export async function verifyMagicLink(token: string): Promise<{ affiliateId: string | null; error?: string }> {
  if (!token || token.length < 20) {
    return { affiliateId: null, error: 'Invalid token' }
  }

  const [session] = await db
    .select({ affiliateId: schema.affiliateSessions.affiliateId })
    .from(schema.affiliateSessions)
    .where(
      and(
        eq(schema.affiliateSessions.token, token),
        gt(schema.affiliateSessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!session) {
    return { affiliateId: null, error: 'Invalid or expired link. Please request a new one.' }
  }

  // Delete the used token (one-time use)
  await db
    .delete(schema.affiliateSessions)
    .where(eq(schema.affiliateSessions.token, token))

  return { affiliateId: session.affiliateId }
}

/**
 * Get affiliate by ID (for session verification in portal pages).
 */
export async function getAffiliateById(id: string) {
  const [affiliate] = await db
    .select({
      id:             schema.affiliates.id,
      code:           schema.affiliates.code,
      name:           schema.affiliates.name,
      email:          schema.affiliates.email,
      commissionRate: schema.affiliates.commissionRate,
      isActive:       schema.affiliates.isActive,
      totalEarned:    schema.affiliates.totalEarned,
      totalPaid:      schema.affiliates.totalPaid,
      payoutInfo:     schema.affiliates.payoutInfo,
      createdAt:      schema.affiliates.createdAt,
    })
    .from(schema.affiliates)
    .where(eq(schema.affiliates.id, id))
    .limit(1)

  if (!affiliate) return null
  return {
    ...affiliate,
    commissionRate: Number(affiliate.commissionRate),
    totalEarned:    Number(affiliate.totalEarned),
    totalPaid:      Number(affiliate.totalPaid),
  }
}
