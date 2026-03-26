-- Registro de intención de checkout antes de redirigir al proveedor de pago
CREATE TABLE "subscription_checkout_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_slug" TEXT NOT NULL,
    "billing_cycle" "PlanType" NOT NULL,
    "price_amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "payment_provider" "PaymentProvider" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "terms_accepted_at" TIMESTAMP(3) NOT NULL,
    "subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_checkout_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "subscription_checkout_sessions_user_id_idx" ON "subscription_checkout_sessions"("user_id");

ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
