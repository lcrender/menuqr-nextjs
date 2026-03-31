-- Datos de facturación para checkout de suscripciones
ALTER TABLE "subscription_checkout_sessions"
ADD COLUMN "first_name" TEXT,
ADD COLUMN "last_name" TEXT,
ADD COLUMN "document_type" TEXT,
ADD COLUMN "document_number" TEXT,
ADD COLUMN "street" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "postal_code" TEXT,
ADD COLUMN "country" TEXT;

UPDATE "subscription_checkout_sessions"
SET
  "first_name" = COALESCE("first_name", ''),
  "last_name" = COALESCE("last_name", ''),
  "street" = COALESCE("street", ''),
  "city" = COALESCE("city", ''),
  "state" = COALESCE("state", ''),
  "postal_code" = COALESCE("postal_code", ''),
  "country" = COALESCE("country", '');

ALTER TABLE "subscription_checkout_sessions"
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL,
ALTER COLUMN "street" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "postal_code" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL;
