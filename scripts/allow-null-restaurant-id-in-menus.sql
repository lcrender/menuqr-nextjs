-- ========================================
-- Permitir que restaurant_id sea NULL en menus
-- Esto permite crear menús sin asignar a un restaurante específico
-- ========================================

-- Primero, eliminar el constraint único que incluye restaurant_id
-- ya que necesitamos modificarlo para permitir null
ALTER TABLE menus 
  DROP CONSTRAINT IF EXISTS menus_restaurant_id_slug_key;

-- Permitir que restaurant_id sea NULL
ALTER TABLE menus 
  ALTER COLUMN restaurant_id DROP NOT NULL;

-- Recrear el constraint único pero solo cuando restaurant_id no sea null
-- Para null, solo validar que el slug sea único globalmente
CREATE UNIQUE INDEX IF NOT EXISTS menus_restaurant_id_slug_unique 
  ON menus (restaurant_id, slug) 
  WHERE restaurant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS menus_slug_unique_when_null_restaurant 
  ON menus (slug) 
  WHERE restaurant_id IS NULL;

-- Actualizar la foreign key para permitir NULL con ON DELETE SET NULL
ALTER TABLE menus 
  DROP CONSTRAINT IF EXISTS menus_restaurant_id_fkey;

ALTER TABLE menus 
  ADD CONSTRAINT menus_restaurant_id_fkey 
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

