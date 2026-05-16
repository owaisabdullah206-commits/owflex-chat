'use server'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, schema } from '@/lib/db'

export async function updateName(name: string): Promise<{ error?: string }> {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Name cannot be empty.' }
  if (trimmed.length > 80) return { error: 'Name must be 80 characters or fewer.' }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: 'Not authenticated.' }

  await db
    .update(schema.users)
    .set({ name: trimmed })
    .where(eq(schema.users.id, session.user.id))

  return {}
}
