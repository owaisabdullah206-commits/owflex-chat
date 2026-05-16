CREATE TABLE "document_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"bot_id" text NOT NULL,
	"page_idx" integer DEFAULT 0 NOT NULL,
	"chunk_idx" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"text" text NOT NULL,
	"token_count" integer NOT NULL,
	"embedding" vector(768) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"bot_id" text NOT NULL,
	"org_id" text NOT NULL,
	"source_type" varchar(10) NOT NULL,
	"source_url" text,
	"storage_key" text,
	"display_name" varchar(255) NOT NULL,
	"mime_type" varchar(100),
	"byte_size" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"error_code" varchar(50),
	"error_msg" text,
	"page_count" integer DEFAULT 1 NOT NULL,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ready_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "routing_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"bot_id" text NOT NULL,
	"classification" varchar(20) NOT NULL,
	"classifier_model" varchar(100) NOT NULL,
	"classifier_latency_ms" integer NOT NULL,
	"chosen_model" varchar(100) NOT NULL,
	"fallback_used" boolean DEFAULT false NOT NULL,
	"credit_cost" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bots" ADD COLUMN "smart_routing_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routing_decisions" ADD CONSTRAINT "routing_decisions_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routing_decisions" ADD CONSTRAINT "routing_decisions_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_chunks_bot_id_idx" ON "document_chunks" USING btree ("bot_id");--> statement-breakpoint
CREATE INDEX "documents_bot_id_idx" ON "documents" USING btree ("bot_id");--> statement-breakpoint
CREATE INDEX "documents_org_id_idx" ON "documents" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "routing_decisions_bot_id_idx" ON "routing_decisions" USING btree ("bot_id");--> statement-breakpoint
CREATE INDEX "routing_decisions_message_id_idx" ON "routing_decisions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_chunks_embedding_hnsw_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);