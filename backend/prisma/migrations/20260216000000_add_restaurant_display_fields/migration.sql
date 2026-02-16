-- AlterTable: add display/currency fields to restaurants (used by API and public templates)
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "default_currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "additional_currencies" JSONB;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "primary_color" TEXT;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "secondary_color" TEXT;
