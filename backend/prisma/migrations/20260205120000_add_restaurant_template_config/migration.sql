-- AlterTable: add template_config for per-restaurant template options
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "template_config" JSONB;
