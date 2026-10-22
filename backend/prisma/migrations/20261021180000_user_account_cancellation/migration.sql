ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "account_cancelled_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "account_cancel_reason" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "account_cancel_reason_detail" TEXT,
  ADD COLUMN IF NOT EXISTS "account_reactivation_token" VARCHAR(128),
  ADD COLUMN IF NOT EXISTS "account_reactivation_expires_at" TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS "users_account_reactivation_token_key"
  ON "users" ("account_reactivation_token")
  WHERE "account_reactivation_token" IS NOT NULL;
