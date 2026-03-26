-- Precio anual explícito (oferta); si NULL se sigue derivando en código con monthly × factor.
ALTER TABLE "plan_prices" ADD COLUMN IF NOT EXISTS "price_yearly" DECIMAL(12, 2);

-- Catálogo: Free y Premium (suscripción)
INSERT INTO "plans" ("id", "name", "description", "created_at", "updated_at") VALUES
  ('plan_free', 'Free', 'Empezá sin costo', NOW(), NOW()),
  ('plan_premium', 'Premium', 'Máximo alcance', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "updated_at" = NOW();

-- Argentina (ARS) — Mercado Pago
UPDATE "plan_prices" SET "price" = 4999, "price_yearly" = 49000, "updated_at" = NOW()
WHERE "plan_id" = 'plan_starter' AND "country" = 'AR';

UPDATE "plan_prices" SET "price" = 11999, "price_yearly" = 119000, "updated_at" = NOW()
WHERE "plan_id" = 'plan_pro' AND "country" = 'AR';

-- Global (USD) — PayPal
UPDATE "plan_prices" SET "price" = 3.49, "price_yearly" = 29, "updated_at" = NOW()
WHERE "plan_id" = 'plan_starter' AND "country" = 'GLOBAL';

UPDATE "plan_prices" SET "price" = 7.99, "price_yearly" = 69, "updated_at" = NOW()
WHERE "plan_id" = 'plan_pro' AND "country" = 'GLOBAL';

INSERT INTO "plan_prices" ("id", "plan_id", "country", "currency", "price", "price_yearly", "payment_provider", "created_at", "updated_at") VALUES
  ('pp_ar_premium', 'plan_premium', 'AR', 'ARS', 19999, 202000, 'mercadopago', NOW(), NOW()),
  ('pp_global_premium', 'plan_premium', 'GLOBAL', 'USD', 13.99, 119, 'paypal', NOW(), NOW()),
  ('pp_ar_free', 'plan_free', 'AR', 'ARS', 0, 0, 'mercadopago', NOW(), NOW()),
  ('pp_global_free', 'plan_free', 'GLOBAL', 'USD', 0, 0, 'paypal', NOW(), NOW())
ON CONFLICT ("plan_id", "country") DO UPDATE SET
  "price" = EXCLUDED."price",
  "price_yearly" = EXCLUDED."price_yearly",
  "currency" = EXCLUDED."currency",
  "payment_provider" = EXCLUDED."payment_provider",
  "updated_at" = NOW();
