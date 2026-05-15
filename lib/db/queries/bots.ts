'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

const createBotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  systemPrompt: z.string().min(1, 'System prompt is required'),
})

export async function createBot(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const user = await requireDeveloper()

  const parsed = createBotSchema.safeParse({
    name: formData.get('name'),
    systemPrompt: formData.get('systemPrompt'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) {
    return { error: 'No organization found. Please sign out and sign in again.' }
  }

  // pk_ prefix + 29 hex chars = 32 chars total
  const embedKey = 'pk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 29)

  const [newBot] = await db
    .insert(schema.bots)
    .values({
      orgId: org.id,
      name: parsed.data.name,
      systemPrompt: parsed.data.systemPrompt,
      embedKey,
    })
    .returning({ id: schema.bots.id })

  revalidatePath('/dashboard/bots')
  redirect(`/dashboard/bots/${newBot.id}`)
}
