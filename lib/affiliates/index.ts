import { eq, and, sql, gte, lt, lte, isNull } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export interface CouponValidation {
  valid: boolean
  error?: string
  couponId?: string
  affiliateId?: string
  commissionRate?: number
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
}

/**
 * Validate a coupon code and return its details.
 * Called from checkout URL routes when a coupon code is provided.
 */
export async function validateCoupon(
  code: string,
  paymentType: 'plan' | 'credits',
): Promise<CouponValidation> {
  const trimmed = code.trim().toUpperCase()

  const [coupon] = await db
    .select({
      id:            schema.affiliateCoupons.id,
      affiliateId:   schema.affiliateCoupons.affiliateId,
      discountType:  schema.affiliateCoupons.discountType,
      discountValue: schema.affiliateCoupons.discountValue,
      appliesTo:     schema.affiliateCoupons.appliesTo,
      maxUses:       schema.affiliateCoupons.maxUses,
      usedCount:     schema.affiliateCoupons.usedCount,
      isActive:      schema.affiliateCoupons.isActive,
      expiresAt:     schema.affiliateCoupons.expiresAt,
    })
    .from(schema.affiliateCoupons)
    .where(
      and(
        eq(schema.affiliateCoupons.code, trimmed),
        eq(schema.affiliateCoupons.isActive, true),
      ),
    )
    .limit(1)

  if (!coupon) {
    return { valid: false, error: 'Invalid or inactive coupon code' }
  }

  // Expiry check
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: 'This coupon has expired' }
  }

  // Max uses check
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its usage limit' }
  }

  // Payment type applicability
  if (coupon.appliesTo !== 'both' && coupon.appliesTo !== paymentType) {
    return { valid: false, error: `This coupon is not valid for ${paymentType} purchases` }
  }

  // Fetch the affiliate's commission rate
  const [affiliate] = await db
    .select({ commissionRate: schema.affiliates.commissionRate, isActive: schema.affiliates.isActive })
    .from(schema.affiliates)
    .where(eq(schema.affiliates.id, coupon.affiliateId))
    .limit(1)

  if (!affiliate?.isActive) {
    return { valid: false, error: 'This coupon is no longer active' }
  }

  return {
    valid: true,
    couponId: coupon.id,
    affiliateId: coupon.affiliateId,
    commissionRate: Number(affiliate.commissionRate),
    discountType: coupon.discountType as 'percentage' | 'fixed',
    discountValue: Number(coupon.discountValue),
  }
}

/**
 * Calculate the discount amount for a given coupon and original price.
 */
export function calculateDiscount(
  originalAmount: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  currency: string,
): { discountAmount: number; finalAmount: number } {
  let discountAmount: number

  if (discountType === 'percentage') {
    // discountValue is e.g. 20 for 20%
    discountAmount = Math.round((originalAmount * discountValue) / 100 * 100) / 100
  } else {
    // Fixed discount — convert from USD cents to actual amount if needed
    discountAmount = Math.min(discountValue, originalAmount)
  }

  return {
    discountAmount,
    finalAmount: Math.round((originalAmount - discountAmount) * 100) / 100,
  }
}

/**
 * Calculate the affiliate commission on the final (discounted) amount.
 */
export function calculateCommission(
  finalAmount: number,
  commissionRate: number,
): number {
  return Math.round(finalAmount * commissionRate * 100) / 100
}

/**
 * Record a successful referral after payment is confirmed.
 * Called from webhook handlers after verifying payment.
 */
export async function recordReferral(data: {
  affiliateId: string
  couponId: string
  orgId: string
  referredUserId?: string | null
  paymentType: 'plan' | 'credits'
  originalAmount: number
  discountAmount: number
  finalAmount: number
  commissionRate: number
  commissionAmount: number
  paymentRefId: string
  currency?: string
}): Promise<{ referralId?: string; error?: string }> {
  // Idempotency check — prevent duplicate referrals for the same payment
  const [existing] = await db
    .select({ id: schema.affiliateReferrals.id })
    .from(schema.affiliateReferrals)
    .where(eq(schema.affiliateReferrals.paymentRefId, data.paymentRefId))
    .limit(1)

  if (existing) {
    return { referralId: existing.id, error: 'Referral already recorded' }
  }

  const [referral] = await db
    .insert(schema.affiliateReferrals)
    .values({
      affiliateId:      data.affiliateId,
      couponId:         data.couponId,
      orgId:            data.orgId,
      referredUserId:   data.referredUserId ?? null,
      paymentType:      data.paymentType,
      originalAmount:   String(data.originalAmount),
      discountAmount:   String(data.discountAmount),
      finalAmount:      String(data.finalAmount),
      commissionRate:   String(data.commissionRate),
      commissionAmount: String(data.commissionAmount),
      paymentRefId:     data.paymentRefId,
      currency:         data.currency ?? 'PKR',
    })
    .returning()

  // Increment coupon used_count
  await db
    .update(schema.affiliateCoupons)
    .set({
      usedCount: sql`${schema.affiliateCoupons.usedCount} + 1`,
    })
    .where(eq(schema.affiliateCoupons.id, data.couponId))

  // Increment affiliate total_earned
  await db
    .update(schema.affiliates)
    .set({
      totalEarned: sql`${schema.affiliates.totalEarned} + ${String(data.commissionAmount)}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.affiliates.id, data.affiliateId))

  return { referralId: referral.id }
}
