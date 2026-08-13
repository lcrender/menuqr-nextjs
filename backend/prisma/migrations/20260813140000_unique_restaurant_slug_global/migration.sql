-- Slug público /r/:slug debe ser único entre comercios activos (cualquier tenant).
-- El más antiguo conserva el slug original; los duplicados reciben sufijo -1, -2, …

DO $$
DECLARE
  rec RECORD;
  new_slug TEXT;
  counter INT;
BEGIN
  FOR rec IN
    SELECT id, slug
    FROM (
      SELECT
        id,
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC, id ASC) AS rn
      FROM restaurants
      WHERE deleted_at IS NULL
    ) d
    WHERE rn > 1
    ORDER BY slug, rn
  LOOP
    counter := 1;
    new_slug := rec.slug || '-' || counter;
    WHILE EXISTS (
      SELECT 1 FROM restaurants WHERE slug = new_slug AND deleted_at IS NULL
    ) LOOP
      counter := counter + 1;
      new_slug := rec.slug || '-' || counter;
    END LOOP;

    UPDATE restaurants
    SET slug = new_slug, updated_at = NOW()
    WHERE id = rec.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "restaurants_slug_active_key"
  ON "restaurants" ("slug")
  WHERE "deleted_at" IS NULL;
