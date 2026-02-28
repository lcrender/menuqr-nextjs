/**
 * Backfill: crea suscripción free (internal) para usuarios que no tienen ninguna.
 * Ejecutar una sola vez. Idempotente.
 *
 * Uso (desde carpeta backend, con .env cargado):
 *   node scripts/backfill-free-subscriptions.js
 *
 * O con DATABASE_URL en el entorno:
 *   DATABASE_URL="postgresql://..." node scripts/backfill-free-subscriptions.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar .env si existe (sin dependencia de dotenv)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
      }
    }
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Falta DATABASE_URL. Ejecuta desde backend con .env o define DATABASE_URL.');
  process.exit(1);
}

const sql = `
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
`;

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const result = await pool.query(sql);
    const count = result.rowCount ?? 0;
    console.log('Backfill listo. Filas insertadas:', count);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
