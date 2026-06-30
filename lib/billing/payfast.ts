import { createHash } from 'crypto'
import { safeEqual } from '@/lib/security'

export const CREDIT_PACKS = {
  starter: { tokens: 100_000,   pkr: 500,  usd: 2  },
  growth:  { tokens: 500_000,   pkr: 2000, usd: 8  },
  pro:     { tokens: 1_500_000, pkr: 5000, usd: 18 },
} as const

export type PackId = keyof typeof CREDIT_PACKS

const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process'
const PAYFAST_LIVE_URL    = 'https://www.payfast.co.za/eng/process'

function getBaseUrl(): string {
  return process.env.NODE_ENV === 'production' ? PAYFAST_LIVE_URL : PAYFAST_SANDBOX_URL
}

export function generatePaymentUrl(
  orgId: string,
  packId: PackId,
  returnUrl: string,
  notifyUrl: string,
  couponId?: string,
): string {
  const pack = CREDIT_PACKS[packId]
  const mPaymentId = `${orgId}:${packId}:${Date.now()}`

  const params: Record<string, string> = {
    merchant_id:   process.env.PAYFAST_MERCHANT_ID ?? '',
    merchant_key:  process.env.PAYFAST_MERCHANT_KEY ?? '',
    return_url:    returnUrl,
    notify_url:    notifyUrl,
    m_payment_id:  mPaymentId,
    amount:        pack.pkr.toFixed(2),
    item_name:     `Octively ${packId.charAt(0).toUpperCase() + packId.slice(1)} Pack`,
    item_description: `${(pack.tokens / 1000).toFixed(0)}k tokens`,
  }

  if (couponId) {
    params.custom_str1 = couponId
  }

  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  return `${getBaseUrl()}?${qs}`
}

export const PLAN_PRICES_PKR = {
  starter: 2500,
  pro:     7500,
  agency:  20000,
} as const

export type PlanId = keyof typeof PLAN_PRICES_PKR

export function generatePlanPaymentUrl(
  orgId: string,
  planId: PlanId,
  returnUrl: string,
  notifyUrl: string,
  couponId?: string,
): string {
  const amount = PLAN_PRICES_PKR[planId]
  const mPaymentId = `plan:${orgId}:${planId}:${Date.now()}`

  const params: Record<string, string> = {
    merchant_id:      process.env.PAYFAST_MERCHANT_ID ?? '',
    merchant_key:     process.env.PAYFAST_MERCHANT_KEY ?? '',
    return_url:       returnUrl,
    notify_url:       notifyUrl,
    m_payment_id:     mPaymentId,
    amount:           amount.toFixed(2),
    item_name:        `Octively ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
    item_description: `Monthly subscription — ${planId} tier`,
  }

  if (couponId) {
    params.custom_str1 = couponId
  }

  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  return `${getBaseUrl()}?${qs}`
}

export interface ItnVerifyResult {
  /** Signature + passphrase + payment_status all checked out. */
  valid: boolean
  paymentId: string
  status: string
  orgId: string
  /** Set only for credit-pack payments (`{orgId}:{packId}:{ts}`). */
  packId: PackId | null
  /** Set only for plan-upgrade payments (`plan:{orgId}:{planId}:{ts}`). */
  planId: PlanId | null
  /** Gross amount PayFast reports actually paid. */
  amountGross: number
  /** True only when amountGross matches the expected price for the pack/plan. */
  amountValid: boolean
  /** Affiliate coupon ID passed via custom_str1 at checkout. */
  couponId: string | null
}

export function verifyItn(
  formData: Record<string, string>,
): ItnVerifyResult {
  const paymentId = formData.m_payment_id ?? ''
  const status = formData.payment_status ?? ''
  const amountGross = Number.parseFloat(formData.amount_gross ?? '') || 0

  // Parse m_payment_id for BOTH layouts:
  //   credit pack  → {orgId}:{packId}:{timestamp}
  //   plan upgrade → plan:{orgId}:{planId}:{timestamp}
  const parts = paymentId.split(':')
  let orgId = ''
  let packId: PackId | null = null
  let planId: PlanId | null = null
  let expectedAmount: number | null = null

  if (parts[0] === 'plan') {
    orgId = parts[1] ?? ''
    const rawPlan = parts[2] ?? ''
    if (rawPlan in PLAN_PRICES_PKR) {
      planId = rawPlan as PlanId
      expectedAmount = PLAN_PRICES_PKR[planId]
    }
  } else {
    orgId = parts[0] ?? ''
    const rawPack = parts[1] ?? ''
    if (rawPack in CREDIT_PACKS) {
      packId = rawPack as PackId
      expectedAmount = CREDIT_PACKS[packId].pkr
    }
  }

  // Amount integrity: the outgoing checkout request is unsigned, so a user can
  // tamper with `amount` before paying. Never trust m_payment_id alone — require
  // the gross paid to match the server-side price for that pack/plan.
  const amountValid = expectedAmount !== null && Math.abs(amountGross - expectedAmount) < 0.01

  // Fail closed: a passphrase is mandatory. Without it the MD5 signature is
  // computable from semi-public merchant fields, making ITNs forgeable.
  const passphrase = process.env.PAYFAST_PASSPHRASE
  if (!passphrase) {
    console.error('[payfast] PAYFAST_PASSPHRASE not configured — rejecting ITN as unverifiable')
    return { valid: false, paymentId, status, orgId, packId, planId, amountGross, amountValid, couponId: null }
  }

  // PayFast spec: concatenate the posted variables in the ORDER RECEIVED
  // (not sorted), URL-encode values, then append the passphrase.
  const params = { ...formData }
  delete params.signature
  const queryString =
    Object.keys(params)
      .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
      .join('&') +
    `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`

  const hash = createHash('md5').update(queryString).digest('hex')
  const signature = formData.signature ?? ''
  const valid = safeEqual(hash, signature) && status === 'COMPLETE'
  const couponId = formData.custom_str1 || null

  return { valid, paymentId, status, orgId, packId, planId, amountGross, amountValid, couponId }
}
