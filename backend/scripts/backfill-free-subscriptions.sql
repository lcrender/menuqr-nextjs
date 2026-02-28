-- Backfill: crea suscripción free (internal) para usuarios que no tienen ninguna.
-- Ejecutar una sola vez después de añadir la suscripción free al registro.
-- Uso: psql $DATABASE_URL -f scripts/backfill-free-subscriptions.sql

INSERT INTO subscriptions (
  id,
  user_id,
  payment_provider,
  external_subscription_id,
  billing_country,
  currency,
  status,
  plan_type,
  subscription_plan,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
)
SELECT
  'sub_free_' || u.id AS id,
  u.id AS user_id,
  'internal'::"PaymentProvider" AS payment_provider,
  'free-' || u.id AS external_subscription_id,
  u.registration_country AS billing_country,
  'USD' AS currency,
  'active'::"SubscriptionStatus" AS status,
  'monthly'::"PlanType" AS plan_type,
  'free' AS subscription_plan,
  u.created_at AS current_period_start,
  NULL AS current_period_end,
  false AS cancel_at_period_end,
  NOW() AS created_at,
  NOW() AS updated_at
FROM users u
WHERE u.deleted_at IS NULL
  AND u.tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = u.id
  )
ON CONFLICT (payment_provider, external_subscription_id) DO NOTHING;
