-- Backfill `translations` for default locale (`es-ES`)
-- This migration populates translatable fields from legacy columns:
-- - restaurants.name / restaurants.description
-- - menus.name / menus.description
-- - menu_sections.name
-- - menu_items.name / menu_items.description

BEGIN;

-- Restaurants: name
INSERT INTO "translations" (
  "id",
  "tenant_id",
  "entity_type",
  "entity_id",
  "locale",
  "key",
  "value",
  "created_at",
  "updated_at"
)
SELECT
  md5(concat_ws(':', r."tenant_id", 'restaurant', r.id, 'es-ES', 'name')) as "id",
  r."tenant_id" as "tenant_id",
  'restaurant' as "entity_type",
  r.id as "entity_id",
  'es-ES' as "locale",
  'name' as "key",
  r.name as "value",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "restaurants" r
WHERE r.deleted_at IS NULL
ON CONFLICT ("tenant_id", "entity_type", "entity_id", "locale", "key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW();

-- Restaurants: description (optional)
INSERT INTO "translations" (
  "id",
  "tenant_id",
  "entity_type",
  "entity_id",
  "locale",
  "key",
  "value",
  "created_at",
  "updated_at"
)
SELECT
  md5(concat_ws(':', r."tenant_id", 'restaurant', r.id, 'es-ES', 'description')) as "id",
  r."tenant_id" as "tenant_id",
  'restaurant' as "entity_type",
  r.id as "entity_id",
  'es-ES' as "locale",
  'description' as "key",
  r.description as "value",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "restaurants" r
WHERE r.deleted_at IS NULL
  AND r.description IS NOT NULL
ON CONFLICT ("tenant_id", "entity_type", "entity_id", "locale", "key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW();

-- Menus: name
INSERT INTO "translations" (
  "id",
  "tenant_id",
  "entity_type",
  "entity_id",
  "locale",
  "key",
  "value",
  "created_at",
  "updated_at"
)
SELECT
  md5(concat_ws(':', m."tenant_id", 'menu', m.id, 'es-ES', 'name')) as "id",
  m."tenant_id" as "tenant_id",
  'menu' as "entity_type",
  m.id as "entity_id",
  'es-ES' as "locale",
  'name' as "key",
  m.name as "value",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "menus" m
WHERE m.deleted_at IS NULL
ON CONFLICT ("tenant_id", "entity_type", "entity_id", "locale", "key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW();

-- Menus: description (optional)
INSERT INTO "translations" (
  "id",
  "tenant_id",
  "entity_type",
  "entity_id",
  "locale",
  "key",
  "value",
  "created_at",
  "updated_at"
)
SELECT
  md5(concat_ws(':', m."tenant_id", 'menu', m.id, 'es-ES', 'description')) as "id",
  m."tenant_id" as "tenant_id",
  'menu' as "entity_type",
  m.id as "entity_id",
  'es-ES' as "locale",
  'description' as "key",
  m.description as "value",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "menus" m
WHERE m.deleted_at IS NULL
  AND m.description IS NOT NULL
ON CONFLICT ("tenant_id", "entity_type", "entity_id", "locale", "key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW();

-- Menu sections: name
INSERT INTO "translations" (
  "id",
  "tenant_id",
  "entity_type",
  "entity_id",
  "locale",
  "key",
  "value",
  "created_at",
  "updated_at"
)
SELECT
  md5(concat_ws(':', ms."tenant_id", 'menu_section', ms.id, 'es-ES', 'name')) as "id",
  ms."tenant_id" as "tenant_id",
  'menu_section' as "entity_type",
  ms.id as "entity_id",
  'es-ES' as "locale",
  'name' as "key",
  ms.name as "value",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "menu_sections" ms
WHERE ms.deleted_at IS NULL
ON CONFLICT ("tenant_id", "entity_type", "entity_id", "locale", "key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW();

-- Menu items: name
INSERT INTO "translations" (
  "id",
  "tenant_id",
  "entity_type",
  "entity_id",
  "locale",
  "key",
  "value",
  "created_at",
  "updated_at"
)
SELECT
  md5(concat_ws(':', mi."tenant_id", 'menu_item', mi.id, 'es-ES', 'name')) as "id",
  mi."tenant_id" as "tenant_id",
  'menu_item' as "entity_type",
  mi.id as "entity_id",
  'es-ES' as "locale",
  'name' as "key",
  mi.name as "value",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "menu_items" mi
WHERE mi.deleted_at IS NULL
ON CONFLICT ("tenant_id", "entity_type", "entity_id", "locale", "key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW();

-- Menu items: description (optional)
INSERT INTO "translations" (
  "id",
  "tenant_id",
  "entity_type",
  "entity_id",
  "locale",
  "key",
  "value",
  "created_at",
  "updated_at"
)
SELECT
  md5(concat_ws(':', mi."tenant_id", 'menu_item', mi.id, 'es-ES', 'description')) as "id",
  mi."tenant_id" as "tenant_id",
  'menu_item' as "entity_type",
  mi.id as "entity_id",
  'es-ES' as "locale",
  'description' as "key",
  mi.description as "value",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "menu_items" mi
WHERE mi.deleted_at IS NULL
  AND mi.description IS NOT NULL
ON CONFLICT ("tenant_id", "entity_type", "entity_id", "locale", "key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW();

COMMIT;

