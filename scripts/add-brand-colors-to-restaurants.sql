-- Agregar columnas de colores de marca a la tabla restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#007bff';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#0056b3';

-- Actualizar restaurantes existentes con valores por defecto
UPDATE restaurants SET primary_color = '#007bff' WHERE primary_color IS NULL;
UPDATE restaurants SET secondary_color = '#0056b3' WHERE secondary_color IS NULL;

