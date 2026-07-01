-- Duración ilimitada en códigos promo (p. ej. Pro Team) y canjes sin fecha de fin
ALTER TABLE "promo_codes" ALTER COLUMN "grant_duration_months" DROP NOT NULL;

ALTER TABLE "promo_code_redemptions" ALTER COLUMN "duration_months" DROP NOT NULL;
ALTER TABLE "promo_code_redemptions" ALTER COLUMN "expires_at" DROP NOT NULL;
