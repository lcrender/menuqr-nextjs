-- Add revoked_sessions_before to users (invalidate refresh tokens issued before this time)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "revoked_sessions_before" TIMESTAMP(3);
