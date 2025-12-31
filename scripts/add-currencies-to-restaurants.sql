-- Agregar campos de monedas a la tabla restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS additional_currencies JSONB DEFAULT '[]'::jsonb;

-- Actualizar restaurantes existentes con moneda por defecto
UPDATE restaurants SET default_currency = 'USD' WHERE default_currency IS NULL;
UPDATE restaurants SET additional_currencies = '[]'::jsonb WHERE additional_currencies IS NULL;

