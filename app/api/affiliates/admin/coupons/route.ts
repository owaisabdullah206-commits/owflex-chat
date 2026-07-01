import { NextRequest, NextResponse } from 'next/server'
import { requirePlatformOwner } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { affiliateCoupons, affiliates } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const createSchema = z.object({
  code: z.string().min(3).max(32),
  name: z.string().max(100).nullable().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(1),
  appliesTo: z.enum(['plan', 'credits', 'both']).default('both'),
  type: z.enum(['affiliate', 'platform']).default('platform'),
  affiliateId: z.string().nullable().optional(),
  maxUses: z.number().nullable().optional(),
})

export async function POST(req: NextRequest) {
  await requirePlatformOwner()
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data = parsed.data

  // Verify affiliate exists if type is affiliate
  if (data.type === 'affiliate' && data.affiliateId) {
    const [aff] = await db.select().from(affiliates).where(eq(affiliates.id, data.affiliateId)).limit(1)
    if (!aff) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
  }

  const [row] = await db.insert(affiliateCoupons).values({
    type: data.type,
    affiliateId: data.type === 'affiliate' ? data.affiliateId : null,
    code: data.code.toUpperCase(),
    name: data.name ?? null,
    discountType: data.discountType,
    discountValue: String(data.discountValue),
    appliesTo: data.appliesTo,
    maxUses: data.maxUses ?? null,
  }).returning()

  revalidatePath('/dashboard/admin/affiliates')
  return NextResponse.json(row, { status: 201 })
}

const patchSchema = z.object({
  id: z.string(),
  code: z.string().min(3).max(32).optional(),
  name: z.string().max(100).nullable().optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(1).optional(),
  appliesTo: z.enum(['plan', 'credits', 'both']).optional(),
  type: z.enum(['affiliate', 'platform']).optional(),
  affiliateId: z.string().nullable().optional(),
  maxUses: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  await requirePlatformOwner()
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { id, ...updates } = parsed.data
  const values: Record<string, unknown> = {}
  if (updates.code !== undefined) values.code = updates.code.toUpperCase()
  if (updates.name !== undefined) values.name = updates.name
  if (updates.discountType !== undefined) values.discountType = updates.discountType
  if (updates.discountValue !== undefined) values.discountValue = String(updates.discountValue)
  if (updates.appliesTo !== undefined) values.appliesTo = updates.appliesTo
  if (updates.type !== undefined) values.type = updates.type
  if (updates.affiliateId !== undefined) values.affiliateId = updates.affiliateId
  if (updates.maxUses !== undefined) values.maxUses = updates.maxUses
  if (updates.isActive !== undefined) values.isActive = updates.isActive

  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const [row] = await db.update(affiliateCoupons).set(values).where(eq(affiliateCoupons.id, id)).returning()
  revalidatePath('/dashboard/admin/affiliates')
  return NextResponse.json(row)
}

const deleteSchema = z.object({ id: z.string() })

export async function DELETE(req: NextRequest) {
  await requirePlatformOwner()
  const body = await req.json()
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await db.delete(affiliateCoupons).where(eq(affiliateCoupons.id, parsed.data.id))
  revalidatePath('/dashboard/admin/affiliates')
  return NextResponse.json({ ok: true })
}
