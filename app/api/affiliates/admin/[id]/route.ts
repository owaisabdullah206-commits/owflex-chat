import { NextRequest, NextResponse } from 'next/server'
import { requirePlatformOwner } from '@/lib/auth/session'
import { updateAffiliateStatus, removeAffiliate, getFraudFlags } from '@/lib/db/queries/affiliates'
import { z } from 'zod'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePlatformOwner()
  const { id } = await params
  const flags = await getFraudFlags(id)
  return NextResponse.json({ flags })
}

const banSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePlatformOwner()
  const { id } = await params
  const body = await req.json()
  const parsed = banSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const row = await updateAffiliateStatus(id, parsed.data.isActive, parsed.data.reason)
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePlatformOwner()
  const { id } = await params
  const result = await removeAffiliate(id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }
  return NextResponse.json({ ok: true })
}
