import { eq, and, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export interface CouponValidation {
  valid: boolean
  error?: string
  couponId?: string
  couponType?: 'affiliate' | 'platform'
  affiliateId?: string
  commissionRate?: number   // affiliate's total commission pool (e.g. 0.30)
  discountPercent?: number  // discount given to customer (e.g. 0.10)
}

/**
 * Validate a coupon code and return its details.
 *
 * Affiliate coupon model:
 *   - Affiliate has a commissionRate (e.g. 30%)
 *   - They set a discountPercent on their coupon (0 to commissionRate)
 *   - Customer gets discountPercent off the original price
 *   - Affiliate earns commissionRate on the final (discounted) price
 *
 *   Example: commissionRate=30%, discountPercent=10%
 *     Original = ₨1000
 *     Customer pays = ₨900 (10% off)
 *     Affiliate earns = 30% × ₨900 = ₨270
 *
 * Platform coupon: simple % or fixed discount, no affiliate commission.
 */
export async function validateCoupon(
  code: string,
  paymentType: 'plan' | 'credits',
): Promise<CouponValidation> {
  const trimmed = code.trim().toUpperCase()

  const [coupon] = await db
    .select({
      id:              schema.affiliateCoupons.id,
      type:            schema.affiliateCoupons.type,
      affiliateId:     schema.affiliateCoupons.affiliateId,
      discountPercent: schema.affiliateCoupons.discountPercent,
      appliesTo:       schema.affiliateCoupons.appliesTo,
      maxUses:         schema.affiliateCoupons.maxUses,
      usedCount:       schema.affiliateCoupons.usedCount,
      isActive:        schema.affiliateCoupons.isActive,
      expiresAt:       schema.affiliateCoupons.expiresAt,
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

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: 'This coupon has expired' }
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its usage limit' }
  }

  if (coupon.appliesTo !== 'both' && coupon.appliesTo !== paymentType) {
    return { valid: false, error: `This coupon is not valid for ${paymentType} purchases` }
  }

  const couponType = (coupon.type as 'affiliate' | 'platform') ?? 'affiliate'

  // Platform coupon — simple discount, no affiliate
  if (couponType === 'platform') {
    return {
      valid: true,
      couponId: coupon.id,
      couponType: 'platform',
      discountPercent: Number(coupon.discountPercent),
    }
  }

  // Affiliate coupon — fetch affiliate commission rate
  if (!coupon.affiliateId) {
    return { valid: false, error: 'This coupon has no associated affiliate' }
  }

  const [affiliate] = await db
    .select({ commissionRate: schema.affiliates.commissionRate, isActive: schema.affiliates.isActive })
    .from(schema.affiliates)
    .where(eq(schema.affiliates.id, coupon.affiliateId))
    .limit(1)

  if (!affiliate?.isActive) {
    return { valid: false, error: 'This affiliate account is no longer active' }
  }

  return {
    valid: true,
    couponId: coupon.id,
    couponType: 'affiliate',
    affiliateId: coupon.affiliateId,
    commissionRate: Number(affiliate.commissionRate),
    discountPercent: Number(coupon.discountPercent),
  }
}

/**
 * Calculate discount and final amount from a discount percentage.
 */
export function calculateDiscount(
  originalAmount: number,
  discountPercent: number,
): { discountAmount: number; finalAmount: number } {
  const discountAmount = Math.round((originalAmount * discountPercent) / 100 * 100) / 100
  return {
    discountAmount,
    finalAmount: Math.round((originalAmount - discountAmount) * 100) / 100,
  }
}

/**
 * Calculate affiliate commission on the final (discounted) amount.
 * commission = commissionRate × finalAmount
 */
export function calculateCommission(
  finalAmount: number,
  commissionRate: number,
): number {
  return Math.round(finalAmount * commissionRate * 100) / 100
}

/**
 * Record a successful referral after payment is confirmed.
 * Called from webhook handlers after verifying payment (affiliate coupons only).
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

  await db
    .update(schema.affiliateCoupons)
    .set({ usedCount: sql`${schema.affiliateCoupons.usedCount} + 1` })
    .where(eq(schema.affiliateCoupons.id, data.couponId))

  await db
    .update(schema.affiliates)
    .set({
      totalEarned: sql`${schema.affiliates.totalEarned} + ${String(data.commissionAmount)}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.affiliates.id, data.affiliateId))

  return { referralId: referral.id }
}

/**
 * Record a platform coupon usage — increments used_count only.
 */
export async function recordPlatformCouponUsage(couponId: string): Promise<void> {
  await db
    .update(schema.affiliateCoupons)
    .set({ usedCount: sql`${schema.affiliateCoupons.usedCount} + 1` })
    .where(eq(schema.affiliateCoupons.id, couponId))
}
