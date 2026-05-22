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

  async function run(label: string, stmt: ReturnType<typeof sql>) {
    try {
      await db.execute(stmt)
      results.push(`${label}: ok`)
    } catch (e) {
      results.push(`${label}: ${String(e)}`)
    }
  }

  // ── 0004 — routing model columns ─────────────────────────────────────────────
  await run('routing_light_model',  sql`ALTER TABLE "bots" ADD COLUMN IF NOT EXISTS "routing_light_model" varchar(100)`)
  await run('routing_strong_model', sql`ALTER TABLE "bots" ADD COLUMN IF NOT EXISTS "routing_strong_model" varchar(100)`)

  // ── 0005 — roadmap features ───────────────────────────────────────────────────

  // Human handoff columns on conversations
  await run('conversations.needs_human',  sql`ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "needs_human" boolean NOT NULL DEFAULT false`)
  await run('conversations.escalated_at', sql`ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "escalated_at" timestamptz`)
  await run('conversations.needs_human_idx', sql`CREATE INDEX IF NOT EXISTS "conversations_needs_human_idx" ON "conversations"("needs_human")`)

  // Sub-tenant credit cap on organizations
  await run('organizations.credit_cap', sql`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "credit_cap" integer`)

  // BYOK encrypted LLM key on organizations
  await run('organizations.llm_api_key', sql`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "llm_api_key" text`)

  // Audit logs table
  await run('audit_logs table', sql`
    CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" text PRIMARY KEY,
      "org_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
      "action" varchar(100) NOT NULL,
      "entity_type" varchar(50) NOT NULL,
      "entity_id" text,
      "meta" jsonb NOT NULL DEFAULT '{}',
      "created_at" timestamptz NOT NULL DEFAULT now()
    )
  `)
  await run('audit_logs_org_id_idx',    sql`CREATE INDEX IF NOT EXISTS "audit_logs_org_id_idx" ON "audit_logs"("org_id")`)
  await run('audit_logs_created_at_idx', sql`CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at")`)

  // Org members table (team seats)
  await run('org_members table', sql`
    CREATE TABLE IF NOT EXISTS "org_members" (
      "id" text PRIMARY KEY,
      "org_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "role" varchar(20) NOT NULL DEFAULT 'member',
      "invited_at" timestamptz NOT NULL DEFAULT now(),
      "joined_at" timestamptz
    )
  `)
  await run('org_members_org_user_idx', sql`CREATE UNIQUE INDEX IF NOT EXISTS "org_members_org_user_idx" ON "org_members"("org_id", "user_id")`)
  await run('org_members_org_id_idx',   sql`CREATE INDEX IF NOT EXISTS "org_members_org_id_idx" ON "org_members"("org_id")`)

  return NextResponse.json({ results })
}
