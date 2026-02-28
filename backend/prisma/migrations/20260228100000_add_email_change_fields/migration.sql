-- Campos para cambio de email seguro (pending_email, token, expiración)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_email" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_change_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_change_expires_at" TIMESTAMP(3);

-- Índice para búsqueda por token al confirmar
CREATE INDEX IF NOT EXISTS "users_email_change_token_idx" ON "users" ("email_change_token") WHERE "email_change_token" IS NOT NULL;
