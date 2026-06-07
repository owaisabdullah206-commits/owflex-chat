'use server'

import { randomUUID } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '@/lib/db'
import { requirePlatformOwner } from '@/lib/auth/session'

const createSchema = z.object({
  label:        z.string().max(120).optional(),
  destinationUrl: z.string().url().max(2000),
  code:         z.string().regex(/^[a-z0-9_-]{2,32}$/).optional(),
  utmSource:    z.string().max(100).optional(),
  utmMedium:    z.string().max(100).optional(),
  utmCampaign:  z.string().max(100).optional(),
  utmTerm:      z.string().max(100).optional(),
  utmContent:   z.string().max(100).optional(),
})

export type CreateLinkInput = z.infer<typeof createSchema>

export async function createShortLink(data: CreateLinkInput) {
  await requirePlatformOwner()

  const parsed = createSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const code = parsed.data.code || randomUUID().slice(0, 8)

  const existing = await db
    .select({ id: schema.shortLinks.id })
    .from(schema.shortLinks)
    .where(eq(schema.shortLinks.code, code))
    .limit(1)

  if (existing.length) return { error: 'Code already in use. Choose a different one.' }

  const [row] = await db.insert(schema.shortLinks).values({
    code,
    label:          parsed.data.label,
    destinationUrl: parsed.data.destinationUrl,
    utmSource:      parsed.data.utmSource,
    utmMedium:      parsed.data.utmMedium,
    utmCampaign:    parsed.data.utmCampaign,
    utmTerm:        parsed.data.utmTerm,
    utmContent:     parsed.data.utmContent,
  }).returning()

  return { link: row }
}

export async function listShortLinks() {
  await requirePlatformOwner()
  return db
    .select()
    .from(schema.shortLinks)
    .orderBy(desc(schema.shortLinks.createdAt))
}

export async function deleteShortLink(id: string) {
  await requirePlatformOwner()
  await db.delete(schema.shortLinks).where(eq(schema.shortLinks.id, id))
}
