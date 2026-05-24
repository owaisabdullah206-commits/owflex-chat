import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'

const bodySchema = z.object({
  type:    z.enum(['feature', 'suggestion', 'bug', 'general']),
  message: z.string().min(10).max(2000),
  pageUrl: z.string().url().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const user = await requireDeveloper()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'bad_request', status: 400 }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    const issues = parsed.error.issues
    return NextResponse.json(
      { error: issues[0]?.message ?? 'Validation error', code: 'validation_error', status: 422 },
      { status: 422 },
    )
  }

  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) {
    return NextResponse.json({ error: 'Organization not found', code: 'not_found', status: 404 }, { status: 404 })
  }

  await db.insert(schema.feedback).values({
    orgId:   org.id,
    userId:  user.id,
    type:    parsed.data.type,
    message: parsed.data.message,
    pageUrl: parsed.data.pageUrl || null,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
