-- Agregar campo slug a la tabla menus
ALTER TABLE menus ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Crear índice único para slug por restaurante
CREATE UNIQUE INDEX IF NOT EXISTS idx_menus_restaurant_slug 
ON menus(restaurant_id, slug) 
WHERE deleted_at IS NULL;

-- Generar slugs para menús existentes
UPDATE menus 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || SUBSTRING(id, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Asegurar que los slugs sean únicos por restaurante
DO $$
DECLARE
  menu_record RECORD;
  counter INTEGER;
  new_slug VARCHAR(255);
BEGIN
  FOR menu_record IN 
    SELECT id, restaurant_id, name 
    FROM menus 
    WHERE deleted_at IS NULL
  LOOP
    new_slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(menu_record.name, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      )
    );
    
    counter := 1;
    WHILE EXISTS (
      SELECT 1 FROM menus 
      WHERE restaurant_id = menu_record.restaurant_id 
        AND slug = new_slug 
        AND id != menu_record.id
        AND deleted_at IS NULL
    ) LOOP
      new_slug := new_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    UPDATE menus SET slug = new_slug WHERE id = menu_record.id;
  END LOOP;
END $$;

