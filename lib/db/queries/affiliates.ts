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
  discountPercent: number
  appliesTo?: 'plan' | 'credits' | 'both'
  maxUses?: number | null
  expiresAt?: Date | null
}) {
  await requirePlatformOwner()

  const [row] = await db
    .insert(schema.affiliateCoupons)
    .values({
      affiliateId:     data.affiliateId,
      code:            data.code,
      discountPercent: String(data.discountPercent),
      appliesTo:       data.appliesTo ?? 'both',
      maxUses:         data.maxUses ?? null,
      expiresAt:       data.expiresAt ?? null,
    })
    .returning()

  revalidatePath('/dashboard/admin/affiliates')
  return row
}

// ── Platform Coupon CRUD ─────────────────────────────────────────────────────

export async function listPlatformCoupons() {
  await requirePlatformOwner()

  return await db
    .select()
    .from(schema.affiliateCoupons)
    .where(eq(schema.affiliateCoupons.type, 'platform'))
    .orderBy(desc(schema.affiliateCoupons.createdAt))
}

export async function createPlatformCoupon(data: {
  code: string
  name?: string
  discountPercent: number
  appliesTo?: 'plan' | 'credits' | 'both'
  maxUses?: number | null
  expiresAt?: Date | null
}) {
  await requirePlatformOwner()

  const [row] = await db
    .insert(schema.affiliateCoupons)
    .values({
      type:            'platform',
      code:            data.code.toUpperCase(),
      name:            data.name ?? null,
      discountPercent: String(data.discountPercent),
      appliesTo:       data.appliesTo ?? 'both',
      maxUses:         data.maxUses ?? null,
      expiresAt:       data.expiresAt ?? null,
    })
    .returning()

  revalidatePath('/dashboard/admin/affiliates')
  return row
}

export async function updatePlatformCoupon(
  id: string,
  data: Partial<{
    name: string
    code: string
    discountPercent: number
    appliesTo: 'plan' | 'credits' | 'both'
    maxUses: number | null
    isActive: boolean
    expiresAt: Date | null
  }>,
) {
  await requirePlatformOwner()

  const values: Record<string, unknown> = {}
  if (data.name !== undefined) values.name = data.name
  if (data.code !== undefined) values.code = data.code.toUpperCase()
  if (data.discountPercent !== undefined) values.discountPercent = String(data.discountPercent)
  if (data.appliesTo !== undefined) values.appliesTo = data.appliesTo
  if (data.maxUses !== undefined) values.maxUses = data.maxUses
  if (data.isActive !== undefined) values.isActive = data.isActive
  if (data.expiresAt !== undefined) values.expiresAt = data.expiresAt

  if (Object.keys(values).length === 0) return null

  const [row] = await db
    .update(schema.affiliateCoupons)
    .set(values)
    .where(eq(schema.affiliateCoupons.id, id))
    .returning()

  revalidatePath('/dashboard/admin/affiliates')
  return row
}

export async function deletePlatformCoupon(id: string) {
  await requirePlatformOwner()

  await db
    .delete(schema.affiliateCoupons)
    .where(eq(schema.affiliateCoupons.id, id))

  revalidatePath('/dashboard/admin/affiliates')
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

// ── Admin: Affiliate Detail ─────────────────────────────────────────────────

export async function getAffiliateDetail(id: string) {
  await requirePlatformOwner()

  const [aff] = await db
    .select()
    .from(schema.affiliates)
    .where(eq(schema.affiliates.id, id))
    .limit(1)

  if (!aff) return null

  const [referralStats, recentReferrals, payouts] = await Promise.all([
    db
      .select({
        count: count(),
        totalCommission: sql<string>`COALESCE(SUM(${schema.affiliateReferrals.commissionAmount}::numeric), 0)`,
        totalFinalAmount: sql<string>`COALESCE(SUM(${schema.affiliateReferrals.finalAmount}::numeric), 0)`,
      })
      .from(schema.affiliateReferrals)
      .where(eq(schema.affiliateReferrals.affiliateId, id)),
    db
      .select({
        id: schema.affiliateReferrals.id,
        orgId: schema.affiliateReferrals.orgId,
        paymentType: schema.affiliateReferrals.paymentType,
        originalAmount: schema.affiliateReferrals.originalAmount,
        discountAmount: schema.affiliateReferrals.discountAmount,
        finalAmount: schema.affiliateReferrals.finalAmount,
        commissionRate: schema.affiliateReferrals.commissionRate,
        commissionAmount: schema.affiliateReferrals.commissionAmount,
        paymentRefId: schema.affiliateReferrals.paymentRefId,
        currency: schema.affiliateReferrals.currency,
        createdAt: schema.affiliateReferrals.createdAt,
        couponCode: schema.affiliateCoupons.code,
      })
      .from(schema.affiliateReferrals)
      .innerJoin(schema.affiliateCoupons, eq(schema.affiliateReferrals.couponId, schema.affiliateCoupons.id))
      .where(eq(schema.affiliateReferrals.affiliateId, id))
      .orderBy(desc(schema.affiliateReferrals.createdAt))
      .limit(100),
    db
      .select()
      .from(schema.affiliatePayouts)
      .where(eq(schema.affiliatePayouts.affiliateId, id))
      .orderBy(desc(schema.affiliatePayouts.paidAt)),
  ])

  const stats = referralStats[0]
  const totalEarned = Number(aff.totalEarned)
  const totalPaid = Number(aff.totalPaid)
  const pendingPayout = totalEarned - totalPaid

  return {
    ...aff,
    payoutInfo: (aff.payoutInfo ?? {}) as Record<string, unknown>,
    totalEarned,
    totalPaid,
    pendingPayout,
    referralCount: stats?.count ?? 0,
    totalCommission: Number(stats?.totalCommission ?? 0),
    totalRevenue: Number(stats?.totalFinalAmount ?? 0),
    recentReferrals: recentReferrals.map((r) => ({
      ...r,
      originalAmount: Number(r.originalAmount),
      discountAmount: Number(r.discountAmount),
      finalAmount: Number(r.finalAmount),
      commissionRate: Number(r.commissionRate),
      commissionAmount: Number(r.commissionAmount),
    })),
    payouts: payouts.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  }
}

// ── Admin: Ban / Unban ──────────────────────────────────────────────────────

export async function updateAffiliateStatus(
  id: string,
  isActive: boolean,
  reason?: string | null,
) {
  await requirePlatformOwner()

  const [row] = await db
    .update(schema.affiliates)
    .set({
      isActive,
      bannedReason: isActive ? null : (reason ?? null),
      bannedAt: isActive ? null : new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.affiliates.id, id))
    .returning()

  revalidatePath('/dashboard/admin/affiliates')
  revalidatePath(`/dashboard/admin/affiliates/${id}`)
  return row
}

// ── Admin: Delete Affiliate ─────────────────────────────────────────────────

export async function removeAffiliate(id: string) {
  await requirePlatformOwner()

  // Check for existing referrals — can't delete if referrals exist
  const [ref] = await db
    .select({ cnt: count() })
    .from(schema.affiliateReferrals)
    .where(eq(schema.affiliateReferrals.affiliateId, id))

  if (ref && ref.cnt > 0) {
    return { error: `Cannot delete: ${ref.cnt} referral(s) exist. Ban instead.` }
  }

  // Delete coupons first (cascade would handle it, but be explicit)
  await db.delete(schema.affiliateCoupons).where(eq(schema.affiliateCoupons.affiliateId, id))
  await db.delete(schema.affiliates).where(eq(schema.affiliates.id, id))

  revalidatePath('/dashboard/admin/affiliates')
  return { ok: true }
}

// ── Admin: Payout Summary (who to pay) ─────────────────────────────────────

export async function getPayoutSummary() {
  await requirePlatformOwner()

  const rows = await db
    .select({
      id: schema.affiliates.id,
      name: schema.affiliates.name,
      email: schema.affiliates.email,
      code: schema.affiliates.code,
      totalEarned: schema.affiliates.totalEarned,
      totalPaid: schema.affiliates.totalPaid,
      isActive: schema.affiliates.isActive,
      payoutInfo: schema.affiliates.payoutInfo,
      referralCount: sql<number>`(SELECT COUNT(*)::int FROM ${schema.affiliateReferrals} WHERE affiliate_id = ${schema.affiliates.id})`,
    })
    .from(schema.affiliates)
    .where(eq(schema.affiliates.isActive, true))
    .orderBy(desc(sql`(${schema.affiliates.totalEarned}::numeric - ${schema.affiliates.totalPaid}::numeric)`))

  return rows.map((r) => ({
    ...r,
    totalEarned: Number(r.totalEarned),
    totalPaid: Number(r.totalPaid),
    pendingPayout: Number(r.totalEarned) - Number(r.totalPaid),
  }))
}

// ── Admin: Record Manual Payout ─────────────────────────────────────────────

export async function recordAdminPayout(data: {
  affiliateId: string
  amount: number
  method: string
  reference?: string | null
  notes?: string | null
  referralIds?: string[]
}) {
  await requirePlatformOwner()

  const owner = await requirePlatformOwner()

  const [row] = await db
    .insert(schema.affiliatePayouts)
    .values({
      affiliateId: data.affiliateId,
      amount: String(data.amount),
      method: data.method,
      reference: data.reference ?? null,
      notes: data.notes ?? null,
      referralIds: data.referralIds ?? [],
      paidBy: owner.id,
    })
    .returning()

  await db
    .update(schema.affiliates)
    .set({
      totalPaid: sql`${schema.affiliates.totalPaid} + ${String(data.amount)}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.affiliates.id, data.affiliateId))

  revalidatePath('/dashboard/admin/affiliates')
  revalidatePath(`/dashboard/admin/affiliates/${data.affiliateId}`)
  return row
}

// ── Admin: Fraud Detection ──────────────────────────────────────────────────

export async function getFraudFlags(affiliateId: string) {
  await requirePlatformOwner()

  const [aff] = await db
    .select()
    .from(schema.affiliates)
    .where(eq(schema.affiliates.id, affiliateId))
    .limit(1)

  if (!aff) return []

  const flags: { type: string; severity: 'low' | 'medium' | 'high'; message: string }[] = []

  // Check 1: Self-referral (same email domain or exact match)
  const selfReferrals = await db
    .select({ cnt: count() })
    .from(schema.affiliateReferrals)
    .innerJoin(schema.users, eq(schema.affiliateReferrals.referredUserId, schema.users.id))
    .where(
      and(
        eq(schema.affiliateReferrals.affiliateId, affiliateId),
        eq(schema.users.email, aff.email),
      ),
    )

  if (selfReferrals[0]?.cnt ?? 0 > 0) {
    flags.push({
      type: 'self_referral',
      severity: 'high',
      message: `${selfReferrals[0].cnt} referral(s) use the same email as the affiliate`,
    })
  }

  // Check 2: Rapid signups (5+ referrals in 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const rapidSignups = await db
    .select({ cnt: count() })
    .from(schema.affiliateReferrals)
    .where(
      and(
        eq(schema.affiliateReferrals.affiliateId, affiliateId),
        gte(schema.affiliateReferrals.createdAt, oneDayAgo),
      ),
    )

  if ((rapidSignups[0]?.cnt ?? 0) >= 5) {
    flags.push({
      type: 'rapid_signups',
      severity: 'medium',
      message: `${rapidSignups[0].cnt} referrals in the last 24 hours`,
    })
  }

  // Check 3: High commission rate (> 30%)
  const rate = Number(aff.commissionRate) * 100
  if (rate > 30) {
    flags.push({
      type: 'high_commission',
      severity: 'low',
      message: `Commission rate is ${rate}% (above 30% threshold)`,
    })
  }

  // Check 4: All referrals are same payment type (potential gaming)
  const paymentTypes = await db
    .select({
      paymentType: schema.affiliateReferrals.paymentType,
      cnt: count(),
    })
    .from(schema.affiliateReferrals)
    .where(eq(schema.affiliateReferrals.affiliateId, affiliateId))
    .groupBy(schema.affiliateReferrals.paymentType)

  if (paymentTypes.length === 1 && (paymentTypes[0]?.cnt ?? 0) >= 3) {
    flags.push({
      type: 'single_payment_type',
      severity: 'low',
      message: `All ${paymentTypes[0].cnt} referrals are ${paymentTypes[0].paymentType} purchases`,
    })
  }

  // Check 5: Low conversion (many clicks/signups but no payments)
  // This would need click tracking which we don't have yet — skip for now

  return flags
}
