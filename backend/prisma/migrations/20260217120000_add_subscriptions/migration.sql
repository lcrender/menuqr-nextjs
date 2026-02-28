-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('paypal', 'mercadopago');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'past_due', 'incomplete', 'expired');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('monthly', 'yearly');

-- AlterTable users: add registration_country and declared_country
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "registration_country" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "declared_country" TEXT;

-- CreateTable subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_provider" "PaymentProvider" NOT NULL,
    "external_subscription_id" TEXT NOT NULL,
    "billing_country" TEXT,
    "currency" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'incomplete',
    "plan_type" "PlanType" NOT NULL,
    "subscription_plan" TEXT,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable webhook_events (idempotency)
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_payment_provider_external_subscription_id_key" ON "subscriptions"("payment_provider", "external_subscription_id");
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

CREATE UNIQUE INDEX "webhook_events_provider_event_id_key" ON "webhook_events"("provider", "event_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
