CREATE TABLE "affiliate_coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"code" varchar(32) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"applies_to" varchar(20) DEFAULT 'both' NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "affiliate_payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'PKR' NOT NULL,
	"method" varchar(50) NOT NULL,
	"reference" text,
	"notes" text,
	"referral_ids" text[],
	"paid_by" text,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"coupon_id" text NOT NULL,
	"org_id" text NOT NULL,
	"referred_user_id" text,
	"payment_type" varchar(20) NOT NULL,
	"original_amount" numeric(14, 2) NOT NULL,
	"discount_amount" numeric(14, 2) NOT NULL,
	"final_amount" numeric(14, 2) NOT NULL,
	"commission_rate" numeric(5, 4) NOT NULL,
	"commission_amount" numeric(14, 2) NOT NULL,
	"payment_ref_id" varchar(255) NOT NULL,
	"currency" varchar(10) DEFAULT 'PKR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_referrals_payment_ref_id_unique" UNIQUE("payment_ref_id")
);
--> statement-breakpoint
CREATE TABLE "affiliate_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_id" text,
	"commission_rate" numeric(5, 4) DEFAULT '0.20' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"payout_info" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text,
	"total_earned" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_paid" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliates_code_unique" UNIQUE("code"),
	CONSTRAINT "affiliates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "session_id" varchar(100);--> statement-breakpoint
ALTER TABLE "affiliate_coupons" ADD CONSTRAINT "affiliate_coupons_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_paid_by_users_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_coupon_id_affiliate_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."affiliate_coupons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_sessions" ADD CONSTRAINT "affiliate_sessions_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "affiliate_coupons_affiliate_id_idx" ON "affiliate_coupons" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "affiliate_payouts_affiliate_id_idx" ON "affiliate_payouts" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "affiliate_referrals_affiliate_id_idx" ON "affiliate_referrals" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "affiliate_referrals_org_id_idx" ON "affiliate_referrals" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_referrals_payment_ref_id_idx" ON "affiliate_referrals" USING btree ("payment_ref_id");--> statement-breakpoint
CREATE INDEX "affiliate_sessions_affiliate_id_idx" ON "affiliate_sessions" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "affiliate_sessions_token_idx" ON "affiliate_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "affiliates_user_id_idx" ON "affiliates" USING btree ("user_id");