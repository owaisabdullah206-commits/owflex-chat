'use server'

import { revalidateTag } from 'next/cache'
import { unstable_cache } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

const faqInputSchema = z.object({
  question: z.string().min(1).max(500),
  answer:   z.string().min(1).max(2000),
})

async function verifyBotOwnership(botId: string, orgId: string): Promise<boolean> {
  const [bot] = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .where(and(eq(schema.bots.id, botId), eq(schema.bots.orgId, orgId)))
    .limit(1)
  return !!bot
}

async function getOrgId(userId: string): Promise<string | null> {
  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, userId))
    .limit(1)
  return org?.id ?? null
}

export async function createFaq(
  botId: string,
  input: { question: string; answer: string },
): Promise<{ id?: string; error?: string }> {
  const user = await requireDeveloper()
  const orgId = await getOrgId(user.id)
  if (!orgId) return { error: 'No organisation found' }

  const parsed = faqInputSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const owned = await verifyBotOwnership(botId, orgId)
  if (!owned) return { error: 'Bot not found or access denied' }

  const [row] = await db
    .insert(schema.botFaqs)
    .values({ botId, question: parsed.data.question, answer: parsed.data.answer })
    .returning({ id: schema.botFaqs.id })

  revalidateTag(`faq-${botId}`)
  return { id: row.id }
}

export async function updateFaq(
  faqId: string,
  patch: { question?: string; answer?: string; isActive?: boolean },
): Promise<{ error?: string }> {
  const user = await requireDeveloper()
  const orgId = await getOrgId(user.id)
  if (!orgId) return { error: 'No organisation found' }

  const [faq] = await db
    .select({ id: schema.botFaqs.id, botId: schema.botFaqs.botId })
    .from(schema.botFaqs)
    .where(eq(schema.botFaqs.id, faqId))
    .limit(1)

  if (!faq) return { error: 'FAQ not found' }

  const owned = await verifyBotOwnership(faq.botId, orgId)
  if (!owned) return { error: 'Access denied' }

  await db.update(schema.botFaqs).set(patch).where(eq(schema.botFaqs.id, faqId))

  revalidateTag(`faq-${faq.botId}`)
  return {}
}

export async function deleteFaq(faqId: string): Promise<{ error?: string }> {
  const user = await requireDeveloper()
  const orgId = await getOrgId(user.id)
  if (!orgId) return { error: 'No organisation found' }

  const [faq] = await db
    .select({ id: schema.botFaqs.id, botId: schema.botFaqs.botId })
    .from(schema.botFaqs)
    .where(eq(schema.botFaqs.id, faqId))
    .limit(1)

  if (!faq) return { error: 'FAQ not found' }

  const owned = await verifyBotOwnership(faq.botId, orgId)
  if (!owned) return { error: 'Access denied' }

  await db.delete(schema.botFaqs).where(eq(schema.botFaqs.id, faqId))

  revalidateTag(`faq-${faq.botId}`)
  return {}
}

export async function listFaqs(botId: string) {
  const user = await requireDeveloper()
  const orgId = await getOrgId(user.id)
  if (!orgId) return []

  const owned = await verifyBotOwnership(botId, orgId)
  if (!owned) return []

  return db
    .select({
      id:        schema.botFaqs.id,
      question:  schema.botFaqs.question,
      answer:    schema.botFaqs.answer,
      isActive:  schema.botFaqs.isActive,
      createdAt: schema.botFaqs.createdAt,
    })
    .from(schema.botFaqs)
    .where(eq(schema.botFaqs.botId, botId))
    .orderBy(schema.botFaqs.createdAt)
}

// Used by chat route — cached per botId, invalidated on any FAQ mutation
export function getActiveFaqs(botId: string) {
  return unstable_cache(
    async () => {
      return db
        .select({ question: schema.botFaqs.question, answer: schema.botFaqs.answer })
        .from(schema.botFaqs)
        .where(and(eq(schema.botFaqs.botId, botId), eq(schema.botFaqs.isActive, true)))
        .orderBy(schema.botFaqs.createdAt)
    },
    [`faq-${botId}`],
    { tags: [`faq-${botId}`], revalidate: 300 },
  )()
}
