import { timingSafeEqual } from 'crypto'

/**
 * Constant-time comparison of two strings. Returns false on length mismatch
 * (length is not secret here) without leaking timing on the content compare.
 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Verify an `Authorization: Bearer <secret>` header against an expected secret
 * using a constant-time compare. Fails closed if either side is missing.
 */
export function verifyBearer(authHeader: string | null, secret: string | undefined): boolean {
  if (!authHeader || !secret) return false
  return safeEqual(authHeader, `Bearer ${secret}`)
}
