import { count, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export const PLAN_LIMITS = {
  free:    { bots: 1,        conversations: 100,    leads: 10        },
  starter: { bots: 3,        conversations: 2_000,  leads: 500       },
  pro:     { bots: 10,       conversations: 10_000, leads: 2_000     },
  agency:  { bots: Infinity, conversations: Infinity, leads: Infinity },
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
