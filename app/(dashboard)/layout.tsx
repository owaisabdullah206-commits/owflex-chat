import { eq } from 'drizzle-orm'
import { Redis } from '@upstash/redis'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { UsageWarningBanner } from '@/components/dashboard/UsageWarningBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Best-effort: if session unavailable, render without banners (auth guard is on each page)
  let activeWarnings: string[] = []
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user?.id) {
      const [org] = await db
        .select({ id: schema.organizations.id, plan: schema.organizations.plan })
        .from(schema.organizations)
        .where(eq(schema.organizations.ownerId, session.user.id))
        .limit(1)

      if (org) {
        const metrics = ['conversations', 'credits', 'leads'] as const
        const yyyyMM = new Date().toISOString().slice(0, 7)
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        })
        const flags = await Promise.all(
          metrics.map((m) => redis.get(`limit_warn:${org.id}:${m}:${yyyyMM}`)),
        )
        // Skip credit warning if grace is active or disabled (CreditStatusBanner covers that)
        const graceKey = `credit_grace:${org.id}:${yyyyMM}`
        const graceUsedKey = `credit_grace_used:${org.id}:${yyyyMM}`
        const [graceTtl, graceUsed] = await Promise.all([redis.ttl(graceKey), redis.get(graceUsedKey)])
        const graceOrDisabled = (graceTtl ?? 0) > 0 || graceUsed !== null

        activeWarnings = metrics.filter((m, i) => {
          if (m === 'credits' && graceOrDisabled) return false
          return !!flags[i]
        })
      }
    }
  } catch {
    // Non-critical — warnings best-effort; never block the dashboard
  }

  const banner = activeWarnings.length > 0
    ? <UsageWarningBanner activeWarnings={activeWarnings} />
    : undefined

  return <DashboardShell banner={banner}>{children}</DashboardShell>
}
