-- Permitir que menu_id y section_id sean NULL en menu_items
-- Esto permite crear productos sin asignar a un menú específico

ALTER TABLE menu_items 
  ALTER COLUMN menu_id DROP NOT NULL,
  ALTER COLUMN section_id DROP NOT NULL;

-- Actualizar las foreign keys para permitir NULL
-- Primero eliminar las constraints existentes
ALTER TABLE menu_items 
  DROP CONSTRAINT IF EXISTS menu_items_menu_id_fkey,
  DROP CONSTRAINT IF EXISTS menu_items_section_id_fkey;

-- Recrear las foreign keys con ON DELETE SET NULL para permitir NULL
ALTER TABLE menu_items 
  ADD CONSTRAINT menu_items_menu_id_fkey 
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE menu_items 
  ADD CONSTRAINT menu_items_section_id_fkey 
  FOREIGN KEY (section_id) REFERENCES menu_sections(id) ON DELETE SET NULL ON UPDATE CASCADE;

