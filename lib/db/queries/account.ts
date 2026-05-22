'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db, schema } from '@/lib/db'
import { requireClient, requireDeveloper } from '@/lib/auth/session'
import { encryptApiKey } from '@/lib/ai/byok'

export async function saveOrgApiKey(apiKey: string): Promise<{ error?: string }> {
  const user = await requireDeveloper()
  if (!apiKey || apiKey.length < 10) return { error: 'API key too short' }
  if (apiKey.length > 500) return { error: 'API key too long' }

  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) return { error: 'Workspace not found' }

  let encrypted: string
  try {
    encrypted = await encryptApiKey(apiKey)
  } catch {
    return { error: 'Encryption not configured — set LLM_KEY_ENCRYPTION_SECRET' }
  }

  await db
    .update(schema.organizations)
    .set({ llmApiKey: encrypted })
    .where(eq(schema.organizations.id, org.id))

  revalidatePath('/dashboard/settings')
  return {}
}

export async function clearOrgApiKey(): Promise<{ error?: string }> {
  const user = await requireDeveloper()

  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) return { error: 'Workspace not found' }

  await db
    .update(schema.organizations)
    .set({ llmApiKey: null })
    .where(eq(schema.organizations.id, org.id))

  revalidatePath('/dashboard/settings')
  return {}
}

export async function updateClientProfile(
  name: string,
): Promise<{ error?: string }> {
  const user = await requireClient()
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Name cannot be empty' }
  if (trimmed.length > 100) return { error: 'Name too long (max 100 chars)' }

  await db
    .update(schema.users)
    .set({ name: trimmed, updatedAt: new Date() })
    .where(eq(schema.users.id, user.id))

  revalidatePath('/portal/settings')
  return {}
}
