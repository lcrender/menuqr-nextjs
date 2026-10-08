-- Permite al super admin ocultar usuarios de prueba (y los datos de su tenant) en las métricas generales.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "exclude_from_metrics" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "users_exclude_from_metrics_idx"
  ON "users" ("tenant_id")
  WHERE "deleted_at" IS NULL AND "exclude_from_metrics" = true;
