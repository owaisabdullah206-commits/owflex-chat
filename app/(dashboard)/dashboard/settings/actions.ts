'use server'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, schema } from '@/lib/db'
import { createAuditLog } from '@/lib/db/queries/audit'

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

  // Non-blocking audit log — fetch org to satisfy orgId requirement
  void (async () => {
    const [org] = await db
      .select({ id: schema.organizations.id })
      .from(schema.organizations)
      .where(eq(schema.organizations.ownerId, session.user.id))
      .limit(1)
    if (org) {
      void createAuditLog({
        orgId:      org.id,
        userId:     session.user.id,
        action:     'settings.updated',
        entityType: 'user',
        entityId:   session.user.id,
        meta:       { field: 'name' },
      })
    }
  })()

  return {}
}
