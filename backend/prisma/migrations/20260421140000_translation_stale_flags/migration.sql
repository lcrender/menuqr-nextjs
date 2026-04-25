-- Marcar traducciones no-base como desactualizadas cuando cambia el texto en es-ES (u origen canónico guardado en i18n).

ALTER TABLE "translations" ADD COLUMN IF NOT EXISTS "stale" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "translations" ADD COLUMN IF NOT EXISTS "stale_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "translations_stale_idx"
  ON "translations" ("tenant_id", "entity_type", "entity_id", "locale")
  WHERE "stale" = true;
