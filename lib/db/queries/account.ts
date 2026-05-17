'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db, schema } from '@/lib/db'
import { requireClient } from '@/lib/auth/session'

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
