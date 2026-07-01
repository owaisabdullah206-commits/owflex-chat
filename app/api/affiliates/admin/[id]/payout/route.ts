import { NextRequest, NextResponse } from 'next/server'
import { requirePlatformOwner } from '@/lib/auth/session'
import { recordAdminPayout } from '@/lib/db/queries/affiliates'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().min(1),
  method: z.string().min(1).max(50),
  reference: z.string().max(255).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  referralIds: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePlatformOwner()
  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const row = await recordAdminPayout({
    affiliateId: id,
    ...parsed.data,
  })

  return NextResponse.json(row, { status: 201 })
}
