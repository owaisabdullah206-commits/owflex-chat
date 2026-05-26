import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, schema } from '@/lib/db'
import { getBalance, PLAN_CREDIT_ALLOCATIONS, FREE_TIER_CREDITS } from '@/lib/credits'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'developer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, session.user.id))
    .limit(1)

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const balance = await getBalance(org.id, org.plan)
  const limit   = PLAN_CREDIT_ALLOCATIONS[org.plan] ?? FREE_TIER_CREDITS

  return NextResponse.json({ balance, limit, plan: org.plan })
}
