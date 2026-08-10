-- Consentimiento legal y opt-in de novedades en registro
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "accepted_terms_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_in_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "users_marketing_opt_in_idx" ON "users"("marketing_opt_in") WHERE "deleted_at" IS NULL AND "marketing_opt_in" = true;
