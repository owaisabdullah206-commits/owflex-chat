-- Human handoff: flag conversation for human escalation
ALTER TABLE "conversations" ADD COLUMN "needs_human" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "escalated_at" timestamp with time zone;--> statement-breakpoint

-- Sub-tenant / per-org credit cap (platform-admin set, enforced in chat route)
ALTER TABLE "organizations" ADD COLUMN "credit_cap" integer;--> statement-breakpoint

-- BYOK: bring your own LLM key (AES-GCM encrypted, stored as iv:ciphertext hex)
ALTER TABLE "organizations" ADD COLUMN "llm_api_key" text;--> statement-breakpoint

-- Audit log: append-only workspace action history
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" text PRIMARY KEY,
  "org_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "action" varchar(100) NOT NULL,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" text,
  "meta" jsonb DEFAULT '{}' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_org_id_idx" ON "audit_logs"("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");--> statement-breakpoint

-- Team seats: colleagues invited to developer workspace
CREATE TABLE IF NOT EXISTS "org_members" (
  "id" text PRIMARY KEY,
  "org_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" varchar(20) NOT NULL DEFAULT 'member',
  "invited_at" timestamp with time zone DEFAULT now() NOT NULL,
  "joined_at" timestamp with time zone
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "org_members_org_user_idx" ON "org_members"("org_id", "user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_members_org_id_idx" ON "org_members"("org_id");
