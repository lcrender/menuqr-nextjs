-- Tabla de planes (slug: basic, pro, etc.)
CREATE TABLE IF NOT EXISTS "plans" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- Precios por país/región. country = 'GLOBAL' para fallback internacional (USD).
CREATE TABLE IF NOT EXISTS "plan_prices" (
  "id" TEXT NOT NULL,
  "plan_id" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "price" DECIMAL(12, 2) NOT NULL,
  "payment_provider" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plan_prices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_prices_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_prices_plan_country_key" ON "plan_prices"("plan_id", "country");
CREATE INDEX IF NOT EXISTS "plan_prices_country_idx" ON "plan_prices"("country");

-- Seed planes y precios
INSERT INTO "plans" ("id", "name", "description", "created_at", "updated_at") VALUES
  ('plan_basic', 'Basic', 'Para crecer un poco más', NOW(), NOW()),
  ('plan_pro', 'Pro', 'Para restaurantes en serio', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Argentina: ARS + MercadoPago
INSERT INTO "plan_prices" ("id", "plan_id", "country", "currency", "price", "payment_provider", "created_at", "updated_at") VALUES
  ('pp_ar_basic', 'plan_basic', 'AR', 'ARS', 2900, 'mercadopago', NOW(), NOW()),
  ('pp_ar_pro', 'plan_pro', 'AR', 'ARS', 14000, 'mercadopago', NOW(), NOW())
ON CONFLICT (plan_id, country) DO NOTHING;

-- Global: USD + PayPal (precios actuales de la app)
INSERT INTO "plan_prices" ("id", "plan_id", "country", "currency", "price", "payment_provider", "created_at", "updated_at") VALUES
  ('pp_global_basic', 'plan_basic', 'GLOBAL', 'USD', 1.90, 'paypal', NOW(), NOW()),
  ('pp_global_pro', 'plan_pro', 'GLOBAL', 'USD', 9, 'paypal', NOW(), NOW())
ON CONFLICT (plan_id, country) DO NOTHING;
