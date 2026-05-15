CREATE TABLE "bot_faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"bot_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" varchar(50) NOT NULL,
	"ref_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_config" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"system_prompt" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "flagged_unanswered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "conversations_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "leads_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bot_faqs" ADD CONSTRAINT "bot_faqs_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bot_faqs_bot_id_idx" ON "bot_faqs" USING btree ("bot_id");--> statement-breakpoint
CREATE INDEX "credit_transactions_org_id_idx" ON "credit_transactions" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_transactions_ref_id_idx" ON "credit_transactions" USING btree ("ref_id");