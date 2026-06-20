'use server'

import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'

export interface PortalConfig {
  // Visible tabs
  showConversations?: boolean
  showLeads?: boolean
  showSettings?: boolean
  // Data & capabilities
  showLeadContacts?: boolean   // reveal visitor email & phone (vs name only)
  allowLiveReply?: boolean     // let the client take over chats live (Agency live handoff)
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
