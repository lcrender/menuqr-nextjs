-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('completed', 'failed', 'pending');

-- CreateTable payment_attempts
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "payment_provider" "PaymentProvider" NOT NULL,
    "external_payment_id" TEXT NOT NULL,
    "provider_event_id" TEXT,
    "provider_status" TEXT,
    "status" "PaymentAttemptStatus" NOT NULL,
    "plan_slug" TEXT,
    "plan_type" "PlanType",
    "amount" NUMERIC(12, 2),
    "currency" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "failure_reason" TEXT,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_subscription_id_fkey"
FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Uniqueness (dedupe por intento)
CREATE UNIQUE INDEX "payment_attempts_provider_external_payment_id_key"
ON "payment_attempts"("payment_provider", "external_payment_id");

-- Indexes for filtering
CREATE INDEX "payment_attempts_user_id_idx" ON "payment_attempts"("user_id");
CREATE INDEX "payment_attempts_status_idx" ON "payment_attempts"("status");
CREATE INDEX "payment_attempts_provider_status_idx" ON "payment_attempts"("payment_provider", "provider_status");
CREATE INDEX "payment_attempts_occurred_at_idx" ON "payment_attempts"("occurred_at");
CREATE INDEX "payment_attempts_plan_slug_idx" ON "payment_attempts"("plan_slug");

