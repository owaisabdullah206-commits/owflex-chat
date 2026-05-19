import { createHash } from 'crypto'

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
    item_name:     `octively ${packId.charAt(0).toUpperCase() + packId.slice(1)} Pack`,
    item_description: `${(pack.tokens / 1000).toFixed(0)}k tokens`,
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
    item_name:        `octively ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
    item_description: `Monthly subscription — ${planId} tier`,
  }

  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  return `${getBaseUrl()}?${qs}`
}

export interface ItnVerifyResult {
  valid: boolean
  paymentId: string
  status: string
  orgId: string
  packId: PackId | null
}

export function verifyItn(
  formData: Record<string, string>,
): ItnVerifyResult {
  const signature = formData.signature ?? ''
  const params = { ...formData }
  delete params.signature

  const sortedKeys = Object.keys(params).sort()
  let queryString = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`).join('&')

  const passphrase = process.env.PAYFAST_PASSPHRASE
  if (passphrase) queryString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`

  const hash = createHash('md5').update(queryString).digest('hex')
  const valid = hash === signature && formData.payment_status === 'COMPLETE'

  // Parse m_payment_id: {orgId}:{packId}:{timestamp}
  const parts = (formData.m_payment_id ?? '').split(':')
  const orgId  = parts[0] ?? ''
  const rawPack = parts[1] ?? ''
  const packId = rawPack in CREDIT_PACKS ? (rawPack as PackId) : null

  return { valid, paymentId: formData.m_payment_id ?? '', status: formData.payment_status ?? '', orgId, packId }
}
