-- Persiste el desbloqueo del QR del dashboard una vez completado el onboarding
-- (comercio + menú publicado + producto). Así el QR no se vuelve a ocultar
-- si después despublican el menú o desactivan productos.
ALTER TABLE "restaurants"
  ADD COLUMN IF NOT EXISTS "onboarding_completed_at" TIMESTAMPTZ;

-- Backfill: ya completos ahora (menú publicado con producto)
UPDATE "restaurants" r
SET "onboarding_completed_at" = COALESCE(r."updated_at", NOW())
WHERE r."deleted_at" IS NULL
  AND r."onboarding_completed_at" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "menus" m
    INNER JOIN "menu_items" mi
      ON mi."menu_id" = m."id"
     AND mi."deleted_at" IS NULL
    WHERE m."restaurant_id" = r."id"
      AND m."deleted_at" IS NULL
      AND m."status" = 'PUBLISHED'
  );

-- Backfill: tuvieron menú + producto y hoy el menú puede estar despublicado
-- (caso típico: completaron el wizard y luego desactivaron/despublicaron)
UPDATE "restaurants" r
SET "onboarding_completed_at" = COALESCE(r."updated_at", NOW())
WHERE r."deleted_at" IS NULL
  AND r."onboarding_completed_at" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "menus" m
    INNER JOIN "menu_items" mi
      ON mi."menu_id" = m."id"
     AND mi."deleted_at" IS NULL
    WHERE m."restaurant_id" = r."id"
      AND m."deleted_at" IS NULL
  );
