-- Replace discountType/discountValue with discountPercent on affiliate_coupons
-- discountPercent: 0-100 for platform coupons, 0-commissionRate*100 for affiliate coupons
ALTER TABLE "affiliate_coupons" ADD COLUMN "discount_percent" numeric(5, 2) DEFAULT '0' NOT NULL;
-- Copy existing percentage discount values (assuming all existing are percentage-based)
UPDATE "affiliate_coupons" SET "discount_percent" = "discount_value" WHERE "discount_type" = 'percentage';
UPDATE "affiliate_coupons" SET "discount_percent" = ROUND(("discount_value" / 1000 * 100), 2) WHERE "discount_type" = 'fixed';
ALTER TABLE "affiliate_coupons" DROP COLUMN "discount_type";
ALTER TABLE "affiliate_coupons" DROP COLUMN "discount_value";
