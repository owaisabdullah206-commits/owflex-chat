-- Sample affiliate (Owais, 20% commission)
INSERT INTO "affiliates" ("id", "code", "name", "email", "commission_rate")
VALUES ('aff_owais_001', 'OWAIS20', 'Owais', 'mrowaisabdullah@gmail.com', 0.20)
ON CONFLICT ("code") DO NOTHING;

-- Sample platform coupon: WELCOME15 — 15% off first payment, no affiliate attached
INSERT INTO "affiliate_coupons" ("id", "type", "code", "name", "discount_type", "discount_value", "applies_to", "is_active")
VALUES ('coup_welcome15', 'platform', 'WELCOME15', 'Welcome Discount', 'percentage', '15.00', 'both', true)
ON CONFLICT ("code") DO NOTHING;
