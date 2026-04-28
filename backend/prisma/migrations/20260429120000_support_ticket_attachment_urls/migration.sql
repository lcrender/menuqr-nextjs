-- URLs de adjuntos (imágenes) en tickets de soporte
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "attachment_urls" JSONB NOT NULL DEFAULT '[]'::jsonb;
