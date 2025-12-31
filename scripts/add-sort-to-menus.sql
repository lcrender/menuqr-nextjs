-- ========================================
-- Agregar campo sort a la tabla menus
-- ========================================
-- Este script agrega un campo sort para poder ordenar los menús

-- Agregar columna sort si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menus' AND column_name = 'sort'
  ) THEN
    ALTER TABLE menus ADD COLUMN sort INTEGER DEFAULT 0;
    
    -- Inicializar el sort con valores basados en created_at
    UPDATE menus 
    SET sort = subquery.row_number
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
      FROM menus
    ) AS subquery
    WHERE menus.id = subquery.id;
  END IF;
END $$;

