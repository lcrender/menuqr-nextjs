-- Metadatos opcionales de idiomas configurados por menú (label, código de bandera)
ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "translation_manifest" JSONB;
