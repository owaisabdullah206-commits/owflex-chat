import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

// One-shot endpoint to apply pending DDL migrations.
// Protected by CRON_SECRET so it cannot be called anonymously.
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  // 0004 — routing model columns (idempotent: IF NOT EXISTS)
  try {
    await db.execute(sql`ALTER TABLE "bots" ADD COLUMN IF NOT EXISTS "routing_light_model" varchar(100)`)
    results.push('routing_light_model: ok')
  } catch (e) {
    results.push('routing_light_model: ' + String(e))
  }

  try {
    await db.execute(sql`ALTER TABLE "bots" ADD COLUMN IF NOT EXISTS "routing_strong_model" varchar(100)`)
    results.push('routing_strong_model: ok')
  } catch (e) {
    results.push('routing_strong_model: ' + String(e))
  }

  return NextResponse.json({ results })
}
