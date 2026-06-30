import { createHmac, timingSafeEqual } from 'crypto'
import { CREDIT_PACKS, type PackId, type PlanId } from './payfast'
export type { PlanId }

// Lemon Squeezy variant ID → pack mapping (set these in LS dashboard)
const VARIANT_TO_PACK: Record<string, PackId> = {
  [process.env.LS_VARIANT_STARTER ?? 'starter']: 'starter',
  [process.env.LS_VARIANT_GROWTH  ?? 'growth']:  'growth',
  [process.env.LS_VARIANT_PRO     ?? 'pro']:     'pro',
}

export function verifyWebhook(rawBody: Buffer, signature: string): { valid: boolean } {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? ''
  const computed = createHmac('sha256', secret).update(rawBody).digest('hex')

  try {
    const valid = timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'))
    return { valid }
  } catch {
    return { valid: false }
  }
}

export interface LsOrderPayload {
  data: {
    id: string
    attributes: {
      status: string
      first_order_item?: {
        variant_id?: number
      }
    }
  }
  meta?: {
    custom_data?: {
      org_id?: string
      coupon_id?: string
    }
  }
}

export function extractOrderInfo(payload: LsOrderPayload): {
  orderId: string
  status: string
  orgId: string
  packId: PackId | null
  tokens: number
  couponId: string | null
} {
  const orderId = payload.data.id
  const status  = payload.data.attributes.status
  const orgId   = payload.meta?.custom_data?.org_id ?? ''
  const couponId = payload.meta?.custom_data?.coupon_id ?? null
  const variantId = String(payload.data.attributes.first_order_item?.variant_id ?? '')
  const packId = VARIANT_TO_PACK[variantId] ?? null
  const tokens = packId ? CREDIT_PACKS[packId].tokens : 0
  return { orderId, status, orgId, packId, tokens, couponId }
}

export function generateCheckoutUrl(orgId: string, variantId: string, couponId?: string): string {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID ?? ''
  let url = `https://store.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][org_id]=${encodeURIComponent(orgId)}&store=${storeId}`
  if (couponId) {
    url += `&checkout[custom][coupon_id]=${encodeURIComponent(couponId)}`
  }
  return url
}

// Plan subscription helpers

const PLAN_VARIANT_MAP: Record<string, PlanId> = {
  [process.env.LS_VARIANT_PLAN_STARTER ?? '']: 'starter',
  [process.env.LS_VARIANT_PLAN_PRO     ?? '']: 'pro',
  [process.env.LS_VARIANT_PLAN_AGENCY  ?? '']: 'agency',
}

export function getPlanVariantId(planId: PlanId): string | null {
  const envKey = `LS_VARIANT_PLAN_${planId.toUpperCase()}` as keyof NodeJS.ProcessEnv
  const variantId = process.env[envKey] ?? ''
  return variantId || null
}

export interface LsSubscriptionPayload {
  data: {
    id: string
    attributes: {
      status: 'active' | 'past_due' | 'unpaid' | 'cancelled' | 'expired'
      variant_id: number
      custom_data?: {
        org_id?: string
        coupon_id?: string
      }
    }
  }
}

export function generatePlanCheckoutUrl(orgId: string, planId: PlanId, returnUrl?: string, couponId?: string): string {
  const variantId = getPlanVariantId(planId)
  if (!variantId) throw new Error(`LS_VARIANT_PLAN_${planId.toUpperCase()} env var not set`)
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID ?? ''
  let base = `https://store.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][org_id]=${encodeURIComponent(orgId)}&store=${storeId}`
  if (couponId) {
    base += `&checkout[custom][coupon_id]=${encodeURIComponent(couponId)}`
  }
  return returnUrl ? `${base}&checkout[redirect_url]=${encodeURIComponent(returnUrl)}` : base
}

export function extractSubscriptionInfo(payload: LsSubscriptionPayload): {
  subscriptionId: string
  status: string
  orgId: string
  planId: PlanId | null
  couponId: string | null
} {
  const subscriptionId = payload.data.id
  const status = payload.data.attributes.status
  const orgId = payload.data.attributes.custom_data?.org_id ?? ''
  const couponId = payload.data.attributes.custom_data?.coupon_id ?? null
  const variantId = String(payload.data.attributes.variant_id)
  const planId = PLAN_VARIANT_MAP[variantId] ?? null
  return { subscriptionId, status, orgId, planId, couponId }
}
