import { createHmac, timingSafeEqual } from 'crypto'
import { CREDIT_PACKS, type PackId } from './payfast'

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
    }
  }
}

export function extractOrderInfo(payload: LsOrderPayload): {
  orderId: string
  status: string
  orgId: string
  packId: PackId | null
  tokens: number
} {
  const orderId = payload.data.id
  const status  = payload.data.attributes.status
  const orgId   = payload.meta?.custom_data?.org_id ?? ''
  const variantId = String(payload.data.attributes.first_order_item?.variant_id ?? '')
  const packId = VARIANT_TO_PACK[variantId] ?? null
  const tokens = packId ? CREDIT_PACKS[packId].tokens : 0
  return { orderId, status, orgId, packId, tokens }
}

export function generateCheckoutUrl(orgId: string, variantId: string): string {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID ?? ''
  return `https://store.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][org_id]=${encodeURIComponent(orgId)}&store=${storeId}`
}
