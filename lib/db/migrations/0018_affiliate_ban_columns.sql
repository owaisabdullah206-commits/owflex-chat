-- Add ban tracking columns to affiliates
ALTER TABLE "affiliates" ADD COLUMN "banned_reason" text;
ALTER TABLE "affiliates" ADD COLUMN "banned_at" timestamp with time zone;
