CREATE TABLE "model_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"model_id" varchar(150) NOT NULL,
	"prompt_price_per_1m" numeric(14, 8) NOT NULL,
	"completion_price_per_1m" numeric(14, 8) NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar(20) DEFAULT 'openrouter-api' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bots" ADD COLUMN "portal_config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "bots" ADD COLUMN "monthly_conv_limit" integer;--> statement-breakpoint
ALTER TABLE "bots" ADD COLUMN "monthly_lead_limit" integer;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "input_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "output_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "cost_usd" numeric(14, 8) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "banned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "platform_config" ADD COLUMN "model_price_priority" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "model_prices_model_id_idx" ON "model_prices" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "model_prices_model_source_idx" ON "model_prices" USING btree ("model_id","source");