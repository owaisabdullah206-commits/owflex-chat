import { and, count, eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export const PLAN_LIMITS = {
  free:    { bots: 1,        conversations: 100,     leads: 10,        docs: 5,         crawlPages: 10,       storageMb: 50      },
  starter: { bots: 3,        conversations: 2_000,   leads: 500,       docs: 50,        crawlPages: 100,      storageMb: 500     },
  pro:     { bots: 10,       conversations: 10_000,  leads: 2_000,     docs: 200,       crawlPages: 500,      storageMb: 5_120   },
  agency:  { bots: Infinity, conversations: Infinity, leads: Infinity,  docs: Infinity,  crawlPages: Infinity, storageMb: 10_240  },
} as const

type Plan = keyof typeof PLAN_LIMITS

interface Org {
  plan: string
  conversationsThisMonth: number
  leadsThisMonth: number
}

function getLimits(plan: string) {
  return PLAN_LIMITS[(plan as Plan) in PLAN_LIMITS ? (plan as Plan) : 'free']
}

export async function checkBotLimit(orgId: string): Promise<{ allowed: boolean }> {
  const [org] = await db
    .select({ plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, orgId))
    .limit(1)

  if (!org) return { allowed: false }
  const limits = getLimits(org.plan)
  if (limits.bots === Infinity) return { allowed: true }

  const [result] = await db
    .select({ count: count() })
    .from(schema.bots)
    .where(eq(schema.bots.orgId, orgId))

  return { allowed: (result?.count ?? 0) < limits.bots }
}

export async function checkConversationLimit(org: Org): Promise<{ allowed: boolean }> {
  const limits = getLimits(org.plan)
  return { allowed: org.conversationsThisMonth < limits.conversations }
}

export async function checkLeadLimit(orgId: string): Promise<{ allowed: boolean }> {
  const [org] = await db
    .select({ plan: schema.organizations.plan, leadsThisMonth: schema.organizations.leadsThisMonth })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, orgId))
    .limit(1)

  if (!org) return { allowed: false }
  const limits = getLimits(org.plan)
  return { allowed: org.leadsThisMonth < limits.leads }
}

export async function checkDocumentLimit(
  orgId: string,
  botId: string,
  plan: string,
): Promise<{ allowed: boolean; used: number; max: number }> {
  const limits = getLimits(plan)
  const max = limits.docs

  if (max === Infinity) return { allowed: true, used: 0, max: Infinity }

  const [row] = await db
    .select({ used: sql<number>`count(*)::int` })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.botId, botId),
        sql`${schema.documents.status} != 'failed'`,
      ),
    )

  const used = row?.used ?? 0
  return { allowed: used < max, used, max }
}

export async function checkCrawlLimit(
  orgId: string,
  botId: string,
  plan: string,
  requestedPages: number,
): Promise<{ allowed: boolean; used: number; max: number }> {
  const limits = getLimits(plan)
  const max = limits.crawlPages

  if (max === Infinity) return { allowed: true, used: 0, max: Infinity }

  const [row] = await db
    .select({ used: sql<number>`coalesce(sum(page_count), 0)::int` })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.botId, botId),
        eq(schema.documents.sourceType, 'url'),
        sql`${schema.documents.status} != 'failed'`,
      ),
    )

  const used = row?.used ?? 0
  return { allowed: used + requestedPages <= max, used, max }
}

export async function checkStorageLimit(
  orgId: string,
  plan: string,
  additionalBytes: number,
): Promise<{ allowed: boolean; usedMb: number; maxMb: number }> {
  const limits = getLimits(plan)
  const maxMb = limits.storageMb

  const [row] = await db
    .select({ totalBytes: sql<number>`coalesce(sum(byte_size), 0)::int` })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.orgId, orgId),
        eq(schema.documents.status, 'ready'),
      ),
    )

  const usedBytes = (row?.totalBytes ?? 0) + additionalBytes
  const usedMb = usedBytes / 1_048_576
  return { allowed: usedMb <= maxMb, usedMb, maxMb }
}

export async function getStorageUsedMb(orgId: string): Promise<number> {
  const [row] = await db
    .select({ totalBytes: sql<number>`coalesce(sum(byte_size), 0)::int` })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.orgId, orgId),
        eq(schema.documents.status, 'ready'),
      ),
    )
  return (row?.totalBytes ?? 0) / 1_048_576
}
