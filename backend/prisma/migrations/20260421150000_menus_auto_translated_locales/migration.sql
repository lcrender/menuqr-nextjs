-- Idiomas del menú que ya se tradujeron automáticamente (por locale), además del flag legacy auto_translated.
ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "auto_translated_locales" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Recuperar locales ya ejecutados según el historial de uso (menús marcados como auto_translated).
UPDATE menus m
SET auto_translated_locales = to_jsonb(s.locales)
FROM (
  SELECT menu_id, array_agg(locale ORDER BY locale) AS locales
  FROM (
    SELECT DISTINCT menu_id, target_locale AS locale
    FROM auto_translate_usage
  ) d
  GROUP BY menu_id
) s
WHERE m.id = s.menu_id
  AND m.auto_translated = true;
