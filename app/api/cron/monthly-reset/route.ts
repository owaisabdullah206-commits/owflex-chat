import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { resetFreeCredits, getAllFreeOrgIds } from '@/lib/credits'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Reset monthly counters for ALL orgs
  await db.update(schema.organizations).set({
    conversationsThisMonth: 0,
    leadsThisMonth: 0,
  })

  // Restore free-tier credit allocation (SET — overrides to 2 M baseline)
  const freeOrgIds = await getAllFreeOrgIds()
  await Promise.all(freeOrgIds.map((id) => resetFreeCredits(id)))

  return NextResponse.json({ orgsReset: freeOrgIds.length })
}
