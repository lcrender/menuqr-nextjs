-- Códigos promocionales y redenciones
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL DEFAULT 'free',
    "discount_percent" INTEGER,
    "grant_plan_slug" TEXT NOT NULL,
    "applicable_plan_slugs" JSONB NOT NULL,
    "valid_from" TIMESTAMPTZ NOT NULL,
    "valid_until" TIMESTAMPTZ NOT NULL,
    "grant_duration_months" INTEGER NOT NULL,
    "max_redemptions" INTEGER,
    "max_redemptions_per_user" INTEGER NOT NULL DEFAULT 1,
    "redemption_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");
CREATE INDEX "promo_codes_valid_until_idx" ON "promo_codes"("valid_until");

CREATE TABLE "promo_code_redemptions" (
    "id" TEXT NOT NULL,
    "promo_code_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "subscription_id" TEXT NOT NULL,
    "grant_plan_slug" TEXT NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "redeemed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "promo_code_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_code_redemptions_promo_code_id_user_id_key"
    ON "promo_code_redemptions"("promo_code_id", "user_id");
CREATE INDEX "promo_code_redemptions_expires_at_idx" ON "promo_code_redemptions"("expires_at");
CREATE INDEX "promo_code_redemptions_user_id_idx" ON "promo_code_redemptions"("user_id");

CREATE TABLE "promo_code_reminder_sends" (
    "id" TEXT NOT NULL,
    "redemption_id" TEXT NOT NULL,
    "days_before" INTEGER NOT NULL,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_code_reminder_sends_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_code_reminder_sends_redemption_id_days_before_key"
    ON "promo_code_reminder_sends"("redemption_id", "days_before");

ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_promo_code_id_fkey"
    FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_subscription_id_fkey"
    FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "promo_code_reminder_sends" ADD CONSTRAINT "promo_code_reminder_sends_redemption_id_fkey"
    FOREIGN KEY ("redemption_id") REFERENCES "promo_code_redemptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
