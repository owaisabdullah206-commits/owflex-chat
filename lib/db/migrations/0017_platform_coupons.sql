-- Platform coupon support: add type, name, make affiliate_id nullable
ALTER TABLE "affiliate_coupons" ADD COLUMN "type" varchar(20) DEFAULT 'affiliate' NOT NULL;
ALTER TABLE "affiliate_coupons" ADD COLUMN "name" varchar(100);
ALTER TABLE "affiliate_coupons" ALTER COLUMN "affiliate_id" DROP NOT NULL;
CREATE INDEX "affiliate_coupons_type_idx" ON "affiliate_coupons" USING btree ("type");
