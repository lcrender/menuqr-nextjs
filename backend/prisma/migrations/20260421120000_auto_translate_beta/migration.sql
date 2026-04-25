-- Traducción automática (beta): flags, caché de textos, uso mensual por usuario, override por plan

ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "auto_translated" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "auto_translate_enabled" BOOLEAN;

ALTER TABLE "tenant_plan_limit_overrides"
  ADD COLUMN IF NOT EXISTS "auto_translate_monthly_per_user" INTEGER NOT NULL DEFAULT 6;

CREATE TABLE IF NOT EXISTS "translation_text_cache" (
    "id" TEXT NOT NULL,
    "source_locale" TEXT NOT NULL,
    "target_locale" TEXT NOT NULL,
    "source_hash" CHAR(64) NOT NULL,
    "translated_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_text_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "translation_text_cache_src_tgt_hash_key"
  ON "translation_text_cache" ("source_locale", "target_locale", "source_hash");

CREATE TABLE IF NOT EXISTS "auto_translate_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "target_locale" TEXT NOT NULL,
    "forced" BOOLEAN NOT NULL DEFAULT false,
    "segment_count" INTEGER NOT NULL DEFAULT 0,
    "api_units" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_translate_usage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "auto_translate_usage_user_created_idx"
  ON "auto_translate_usage" ("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "auto_translate_usage_tenant_created_idx"
  ON "auto_translate_usage" ("tenant_id", "created_at");

ALTER TABLE "auto_translate_usage"
  DROP CONSTRAINT IF EXISTS "auto_translate_usage_user_id_fkey";

ALTER TABLE "auto_translate_usage"
  ADD CONSTRAINT "auto_translate_usage_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "app_settings" ("key", "value", "updated_at")
VALUES ('auto_translate_global_enabled', 'true', NOW())
ON CONFLICT ("key") DO NOTHING;
