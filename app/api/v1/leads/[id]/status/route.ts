import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq, inArray } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { LEAD_STATUSES } from '@/lib/leads/status'

const bodySchema = z.object({ status: z.enum(LEAD_STATUSES) })

// Developer dashboard: update a lead's pipeline stage. Tenant isolation is
// enforced in the WHERE clause — the lead must belong to a bot owned by the
// caller's organization, so a forged id from another org updates zero rows.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 },
      { status: 401 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', code: 'INVALID_JSON', status: 400 },
      { status: 400 },
    )
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR', status: 400 },
      { status: 400 },
    )
  }

  const ownedBotIds = db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(eq(schema.organizations.ownerId, session.user.id))

  const updated = await db
    .update(schema.leads)
    .set({ status: parsed.data.status })
    .where(and(eq(schema.leads.id, id), inArray(schema.leads.botId, ownedBotIds)))
    .returning({ id: schema.leads.id })

  if (updated.length === 0) {
    return NextResponse.json(
      { error: 'Lead not found', code: 'NOT_FOUND', status: 404 },
      { status: 404 },
    )
  }

  return NextResponse.json({ success: true, status: parsed.data.status })
}
