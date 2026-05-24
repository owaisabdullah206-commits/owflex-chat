import { and, count, eq, gte, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export const PLAN_LIMITS = {
  //                              bots        conversations    leads        docs        crawlPages    storageMb    catalogProducts
  free:       { bots: 1,        conversations: 200,      leads: 15,        docs: 3,        crawlPages: 0,        storageMb: 5,        catalogProducts: 10        },
  starter:    { bots: 2,        conversations: 3_000,    leads: Infinity,  docs: 20,       crawlPages: 20,       storageMb: 25,       catalogProducts: Infinity  },
  pro:        { bots: 8,        conversations: 15_000,   leads: Infinity,  docs: 50,       crawlPages: 100,      storageMb: 100,      catalogProducts: Infinity  },
  agency:     { bots: Infinity, conversations: 75_000,   leads: Infinity,  docs: 500,      crawlPages: 1000,     storageMb: 500,      catalogProducts: Infinity  },
  enterprise: { bots: Infinity, conversations: Infinity, leads: Infinity,  docs: Infinity, crawlPages: Infinity, storageMb: Infinity, catalogProducts: Infinity  },
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

interface BotLimitInfo {
  botId: string
  monthlyConvLimit: number | null
}

export async function checkConversationLimit(
  org: Org,
  bot?: BotLimitInfo,
): Promise<{ allowed: boolean }> {
  // Bot-level cap: if set, enforce it regardless of org pool headroom
  if (bot && bot.monthlyConvLimit !== null) {
    const startOfMonth = new Date()
    startOfMonth.setUTCDate(1)
    startOfMonth.setUTCHours(0, 0, 0, 0)

    const [row] = await db
      .select({ cnt: count() })
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.botId, bot.botId),
          gte(schema.conversations.startedAt, startOfMonth),
        ),
      )
    if ((row?.cnt ?? 0) >= bot.monthlyConvLimit) return { allowed: false }
  }

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
