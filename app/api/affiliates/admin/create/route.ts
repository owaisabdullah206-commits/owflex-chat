import { NextRequest, NextResponse } from 'next/server'
import { requirePlatformOwner } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { affiliates } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  code: z.string().min(3).max(32),
  commissionRate: z.number().min(0.01).max(0.5),
})

export async function POST(req: NextRequest) {
  await requirePlatformOwner()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, code, commissionRate } = parsed.data

  // Check unique constraints
  const [existingCode] = await db.select().from(affiliates).where(eq(affiliates.code, code.toUpperCase())).limit(1)
  if (existingCode) {
    return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
  }

  const [existingEmail] = await db.select().from(affiliates).where(eq(affiliates.email, email)).limit(1)
  if (existingEmail) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const [row] = await db.insert(affiliates).values({
    name,
    email,
    code: code.toUpperCase(),
    commissionRate: String(commissionRate),
  }).returning()

  revalidatePath('/dashboard/admin/affiliates')
  return NextResponse.json(row, { status: 201 })
}
