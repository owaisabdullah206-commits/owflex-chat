'use server'

import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

export interface PortalConfig {
  showConversations?: boolean
  showLeads?: boolean
  showSettings?: boolean
}

export async function updatePortalConfig(botId: string, config: PortalConfig): Promise<void> {
  const user = await requireDeveloper()

  // Verify bot belongs to this developer's org
  const [bot] = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(
      and(
        eq(schema.bots.id, botId),
        eq(schema.organizations.ownerId, user.id),
      ),
    )
    .limit(1)

  if (!bot) throw new Error('Bot not found')

  await db
    .update(schema.bots)
    .set({ portalConfig: config })
    .where(eq(schema.bots.id, botId))
}
