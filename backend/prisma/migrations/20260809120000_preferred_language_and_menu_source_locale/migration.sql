-- Preferencia de idioma de UI / contenido del usuario (es | en)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_language" TEXT NOT NULL DEFAULT 'es';

-- Idioma base del menú (antes implícito es-ES)
ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "source_locale" TEXT NOT NULL DEFAULT 'es-ES';

CREATE INDEX IF NOT EXISTS "menus_source_locale_idx" ON "menus"("source_locale");
