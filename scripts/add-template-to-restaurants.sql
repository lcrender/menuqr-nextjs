-- Script para agregar la columna template a la tabla restaurants
-- y migrar los datos de template desde menus si es necesario

-- Agregar la columna template a restaurants si no existe
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS template VARCHAR(50) DEFAULT 'classic';

-- Actualizar restaurants con el template de su primer menú publicado si no tienen template
UPDATE restaurants r
SET template = COALESCE(
  (SELECT m.template 
   FROM menus m 
   WHERE m.restaurant_id = r.id 
     AND m.deleted_at IS NULL 
   ORDER BY m.created_at ASC 
   LIMIT 1),
  'classic'
)
WHERE r.template IS NULL OR r.template = 'classic';

-- Asegurar que todos los restaurantes tengan un template válido
UPDATE restaurants 
SET template = 'classic' 
WHERE template IS NULL OR template NOT IN ('classic', 'modern', 'foodie');

-- Agregar comentario a la columna
COMMENT ON COLUMN restaurants.template IS 'Plantilla de diseño del restaurante: classic, modern, foodie';

