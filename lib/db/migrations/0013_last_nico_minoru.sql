ALTER TABLE "bots" ADD COLUMN "slack_webhook_url" text;--> statement-breakpoint
ALTER TABLE "bots" ADD COLUMN "previous_embed_key" varchar(64);--> statement-breakpoint
ALTER TABLE "bots" ADD COLUMN "embed_key_rotated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "status" varchar(20) DEFAULT 'new' NOT NULL;