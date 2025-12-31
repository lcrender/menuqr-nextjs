-- ========================================
-- Agregar campo sort a la tabla menu_items
-- ========================================
-- Este script agrega un campo sort para poder ordenar los productos dentro de cada sección

-- Agregar columna sort si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'sort'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN sort INTEGER DEFAULT 0;
    
    -- Inicializar el sort con valores basados en created_at dentro de cada sección
    UPDATE menu_items 
    SET sort = subquery.row_number - 1
    FROM (
      SELECT id, section_id, ROW_NUMBER() OVER (PARTITION BY section_id ORDER BY created_at) as row_number
      FROM menu_items
      WHERE deleted_at IS NULL
    ) AS subquery
    WHERE menu_items.id = subquery.id;
  END IF;
END $$;

