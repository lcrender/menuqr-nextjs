-- Script para migrar el campo template de menus a restaurants
-- Este script asigna a cada restaurante el template del primer menú publicado que tenga,
-- o 'classic' como valor por defecto si no tiene menús

-- Primero, agregar la columna template a restaurants si no existe
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS template VARCHAR(50) DEFAULT 'classic';

-- Actualizar restaurants con el template de su primer menú publicado
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

-- Ahora podemos eliminar la columna template de menus (opcional, comentado por seguridad)
-- ALTER TABLE menus DROP COLUMN IF EXISTS template;

