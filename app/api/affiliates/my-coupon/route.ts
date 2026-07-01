import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAffiliateById } from '@/lib/affiliates/auth'
import { db } from '@/lib/db'
import { affiliateCoupons } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export async function GET() {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')
  if (!affSession) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const affiliate = await getAffiliateById(affSession.value)
  if (!affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [coupon] = await db
    .select()
    .from(affiliateCoupons)
    .where(
      and(
        eq(affiliateCoupons.affiliateId, affiliate.id),
        eq(affiliateCoupons.type, 'affiliate'),
      ),
    )
    .limit(1)

  if (!coupon) {
    return NextResponse.json({ coupon: null, commissionRate: Number(affiliate.commissionRate) })
  }

  return NextResponse.json({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
    },
    commissionRate: Number(affiliate.commissionRate),
  })
}

const updateSchema = z.object({
  discountPercent: z.number().min(0).max(100),
})

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')
  if (!affSession) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const affiliate = await getAffiliateById(affSession.value)
  if (!affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const maxDiscount = Number(affiliate.commissionRate) * 100
  if (parsed.data.discountPercent > maxDiscount) {
    return NextResponse.json({ error: `Discount cannot exceed ${maxDiscount}%` }, { status: 400 })
  }

  const [coupon] = await db
    .select()
    .from(affiliateCoupons)
    .where(
      and(
        eq(affiliateCoupons.affiliateId, affiliate.id),
        eq(affiliateCoupons.type, 'affiliate'),
      ),
    )
    .limit(1)

  if (!coupon) {
    return NextResponse.json({ error: 'No coupon found' }, { status: 404 })
  }

  await db
    .update(affiliateCoupons)
    .set({ discountPercent: String(parsed.data.discountPercent) })
    .where(eq(affiliateCoupons.id, coupon.id))

  return NextResponse.json({ ok: true })
}
