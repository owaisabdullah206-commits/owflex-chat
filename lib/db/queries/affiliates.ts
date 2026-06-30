'use server'

import { and, asc, count, desc, eq, gte, inArray, lte, ne, not, sql, sum } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requirePlatformOwner } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

// ── Affiliate CRUD ───────────────────────────────────────────────────────────

export async function listAffiliates() {
  await requirePlatformOwner()

  const rows = await db
    .select({
      id:             schema.affiliates.id,
      code:           schema.affiliates.code,
      name:           schema.affiliates.name,
      email:          schema.affiliates.email,
      commissionRate: schema.affiliates.commissionRate,
      isActive:       schema.affiliates.isActive,
      totalEarned:    schema.affiliates.totalEarned,
      totalPaid:      schema.affiliates.totalPaid,
      referralCount:  sql<number>`(SELECT COUNT(*)::int FROM ${schema.affiliateReferrals} WHERE affiliate_id = ${schema.affiliates.id})`,
      createdAt:      schema.affiliates.createdAt,
    })
    .from(schema.affiliates)
    .orderBy(desc(schema.affiliates.createdAt))

  return rows.map((r) => ({
    ...r,
    commissionRate: Number(r.commissionRate),
    totalEarned:    Number(r.totalEarned),
    totalPaid:      Number(r.totalPaid),
  }))
}

export async function getAffiliate(id: string) {
  await requirePlatformOwner()

  const [row] = await db
    .select()
    .from(schema.affiliates)
    .where(eq(schema.affiliates.id, id))
    .limit(1)

  if (!row) return null
  return {
    ...row,
    commissionRate: Number(row.commissionRate),
    totalEarned:    Number(row.totalEarned),
    totalPaid:      Number(row.totalPaid),
  }
}

export async function createAffiliate(data: {
  code: string
  name: string
  email: string
  userId?: string | null
  commissionRate?: number
  notes?: string | null
}) {
  await requirePlatformOwner()

  const [row] = await db
    .insert(schema.affiliates)
    .values({
      code:           data.code,
      name:           data.name,
      email:          data.email,
      userId:         data.userId ?? null,
      commissionRate: data.commissionRate !== undefined ? String(data.commissionRate) : '0.20',
      notes:          data.notes ?? null,
    })
    .returning()

  revalidatePath('/dashboard/admin/affiliates')
  return row
}

export async function updateAffiliate(
  id: string,
  data: Partial<{
    code: string
    name: string
    email: string
    userId: string | null
    commissionRate: number
    isActive: boolean
    payoutInfo: Record<string, unknown>
    notes: string | null
  }>,
) {
  await requirePlatformOwner()

  const values: Record<string, unknown> = { updatedAt: new Date() }
  if (data.code !== undefined) values.code = data.code
  if (data.name !== undefined) values.name = data.name
  if (data.email !== undefined) values.email = data.email
  if (data.userId !== undefined) values.userId = data.userId
  if (data.commissionRate !== undefined) values.commissionRate = String(data.commissionRate)
  if (data.isActive !== undefined) values.isActive = data.isActive
  if (data.payoutInfo !== undefined) values.payoutInfo = data.payoutInfo
  if (data.notes !== undefined) values.notes = data.notes

  const [row] = await db
    .update(schema.affiliates)
    .set(values)
    .where(eq(schema.affiliates.id, id))
    .returning()

  revalidatePath('/dashboard/admin/affiliates')
  return row
}

// ── Coupon CRUD ──────────────────────────────────────────────────────────────

export async function listCoupons(affiliateId?: string) {
  await requirePlatformOwner()

  const filters = affiliateId ? eq(schema.affiliateCoupons.affiliateId, affiliateId) : undefined

  return await db
    .select()
    .from(schema.affiliateCoupons)
    .where(filters)
    .orderBy(desc(schema.affiliateCoupons.createdAt))
}

export async function createCoupon(data: {
  affiliateId: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  appliesTo?: 'plan' | 'credits' | 'both'
  maxUses?: number | null
  expiresAt?: Date | null
}) {
  await requirePlatformOwner()

  const [row] = await db
    .insert(schema.affiliateCoupons)
    .values({
      affiliateId:   data.affiliateId,
      code:           data.code,
      discountType:   data.discountType,
      discountValue:  String(data.discountValue),
      appliesTo:      data.appliesTo ?? 'both',
      maxUses:        data.maxUses ?? null,
      expiresAt:      data.expiresAt ?? null,
    })
    .returning()

  revalidatePath('/dashboard/admin/affiliates')
  return row
}

// ── Referral tracking ────────────────────────────────────────────────────────

export async function getAffiliateReferrals(
  affiliateId: string,
  limit = 50,
  offset = 0,
) {
  await requirePlatformOwner()

  const rows = await db
    .select()
    .from(schema.affiliateReferrals)
    .where(eq(schema.affiliateReferrals.affiliateId, affiliateId))
    .orderBy(desc(schema.affiliateReferrals.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map((r) => ({
    ...r,
    originalAmount:   Number(r.originalAmount),
    discountAmount:   Number(r.discountAmount),
    finalAmount:      Number(r.finalAmount),
    commissionRate:   Number(r.commissionRate),
    commissionAmount: Number(r.commissionAmount),
  }))
}

export async function getReferralsCount(affiliateId: string): Promise<number> {
  await requirePlatformOwner()

  const [row] = await db
    .select({ cnt: count() })
    .from(schema.affiliateReferrals)
    .where(eq(schema.affiliateReferrals.affiliateId, affiliateId))

  return row?.cnt ?? 0
}

// ── Payouts ───────────────────────────────────────────────────────────────────

export async function getAffiliatePayouts(affiliateId: string) {
  await requirePlatformOwner()

  return await db
    .select()
    .from(schema.affiliatePayouts)
    .where(eq(schema.affiliatePayouts.affiliateId, affiliateId))
    .orderBy(desc(schema.affiliatePayouts.paidAt))
}

export async function createPayout(data: {
  affiliateId: string
  amount: number
  currency?: string
  method: string
  reference?: string | null
  notes?: string | null
  referralIds: string[]
  paidBy: string
}) {
  await requirePlatformOwner()

  const [row] = await db
    .insert(schema.affiliatePayouts)
    .values({
      affiliateId:  data.affiliateId,
      amount:       String(data.amount),
      currency:     data.currency ?? 'PKR',
      method:       data.method,
      reference:    data.reference ?? null,
      notes:        data.notes ?? null,
      referralIds:  data.referralIds,
      paidBy:       data.paidBy,
    })
    .returning()

  // Update affiliate total_paid
  await db
    .update(schema.affiliates)
    .set({
      totalPaid: sql`${schema.affiliates.totalPaid} + ${String(data.amount)}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.affiliates.id, data.affiliateId))

  revalidatePath('/dashboard/admin/affiliates')
  return row
}

// ── Affiliate stats (for admin analytics) ────────────────────────────────────

export async function getAffiliateStats() {
  await requirePlatformOwner()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totals, monthlyReferrals, topAffiliates] = await Promise.all([
    // All-time stats
    db
      .select({
        totalAffiliates: count(schema.affiliates.id),
        activeAffiliates: sql<number>`COUNT(*) FILTER (WHERE ${schema.affiliates.isActive} = true)::int`,
        totalEarnedAll:   sql<string>`COALESCE(SUM(${schema.affiliates.totalEarned}::numeric), 0)`,
        totalPaidAll:     sql<string>`COALESCE(SUM(${schema.affiliates.totalPaid}::numeric), 0)`,
        totalReferrals:   sql<number>`(SELECT COUNT(*)::int FROM ${schema.affiliateReferrals})`,
      })
      .from(schema.affiliates),

    // Monthly referral count
    db
      .select({ cnt: count() })
      .from(schema.affiliateReferrals)
      .where(gte(schema.affiliateReferrals.createdAt, monthStart)),

    // Top 5 affiliates by total earned
    db
      .select({
        id:          schema.affiliates.id,
        code:        schema.affiliates.code,
        name:        schema.affiliates.name,
        totalEarned: schema.affiliates.totalEarned,
        referralCount: sql<number>`(SELECT COUNT(*)::int FROM ${schema.affiliateReferrals} WHERE affiliate_id = ${schema.affiliates.id})`,
      })
      .from(schema.affiliates)
      .where(eq(schema.affiliates.isActive, true))
      .orderBy(desc(schema.affiliates.totalEarned))
      .limit(5),
  ])

  return {
    totalAffiliates:  Number(totals[0]?.totalAffiliates ?? 0),
    activeAffiliates: Number(totals[0]?.activeAffiliates ?? 0),
    totalEarnedAll:   Number(totals[0]?.totalEarnedAll ?? 0),
    totalPaidAll:     Number(totals[0]?.totalPaidAll ?? 0),
    totalReferrals:   Number(totals[0]?.totalReferrals ?? 0),
    monthlyReferrals: Number(monthlyReferrals[0]?.cnt ?? 0),
    topAffiliates:    topAffiliates.map((r) => ({
      ...r,
      totalEarned: Number(r.totalEarned),
    })),
  }
}
