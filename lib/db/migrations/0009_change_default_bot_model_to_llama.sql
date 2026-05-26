-- Change default model for new bots (llama-3.3-70b via Groq: 0.66s E2E, 150 tok/s, smooth streaming)
ALTER TABLE "bots" ALTER COLUMN "model" SET DEFAULT 'meta-llama/llama-3.3-70b-instruct';--> statement-breakpoint

-- Migrate existing bots that were using the old deepseek default
-- Bots deliberately set to any other model are untouched
UPDATE "bots" SET "model" = 'meta-llama/llama-3.3-70b-instruct'
WHERE "model" = 'deepseek/deepseek-v4-flash';--> statement-breakpoint

-- latency_ms was added to schema.ts without a recorded migration;
-- use IF NOT EXISTS so this is safe whether the column already exists or not
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "latency_ms" integer;