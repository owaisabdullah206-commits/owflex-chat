import { and, desc, eq, gte } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export type AuditAction =
  | 'bot.created' | 'bot.updated' | 'bot.deleted'
  | 'document.uploaded' | 'document.deleted'
  | 'client.invited' | 'client.removed'
  | 'billing.plan_changed' | 'billing.credits_purchased'
  | 'settings.updated'
  | 'org_member.invited' | 'org_member.removed'

export async function createAuditLog(entry: {
  orgId:      string
  userId?:    string
  action:     AuditAction
  entityType: string
  entityId?:  string
  meta?:      Record<string, unknown>
}): Promise<void> {
  await db.insert(schema.auditLogs).values({
    orgId:      entry.orgId,
    userId:     entry.userId,
    action:     entry.action,
    entityType: entry.entityType,
    entityId:   entry.entityId,
    meta:       entry.meta ?? {},
  }).catch(() => {}) // non-blocking — audit must not break primary flows
}

export async function listAuditLogs(
  orgId: string,
  opts: { limit?: number; since?: Date } = {},
) {
  const { limit = 100, since } = opts

  const conditions = [eq(schema.auditLogs.orgId, orgId)]
  if (since) conditions.push(gte(schema.auditLogs.createdAt, since))

  return db
    .select({
      id:         schema.auditLogs.id,
      action:     schema.auditLogs.action,
      entityType: schema.auditLogs.entityType,
      entityId:   schema.auditLogs.entityId,
      meta:       schema.auditLogs.meta,
      createdAt:  schema.auditLogs.createdAt,
      userName:   schema.users.name,
      userEmail:  schema.users.email,
    })
    .from(schema.auditLogs)
    .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
    .where(and(...conditions))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(limit)
}

export async function listAllAuditLogs(opts: { limit?: number; since?: Date } = {}) {
  const { limit = 200, since } = opts
  const conditions = since ? [gte(schema.auditLogs.createdAt, since)] : []

  return db
    .select({
      id:         schema.auditLogs.id,
      orgId:      schema.auditLogs.orgId,
      action:     schema.auditLogs.action,
      entityType: schema.auditLogs.entityType,
      entityId:   schema.auditLogs.entityId,
      meta:       schema.auditLogs.meta,
      createdAt:  schema.auditLogs.createdAt,
      userName:   schema.users.name,
      userEmail:  schema.users.email,
      orgName:    schema.organizations.name,
    })
    .from(schema.auditLogs)
    .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
    .leftJoin(schema.organizations, eq(schema.auditLogs.orgId, schema.organizations.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(limit)
}
