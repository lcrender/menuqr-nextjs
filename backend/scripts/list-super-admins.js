/**
 * Lista usuarios con rol SUPER_ADMIN.
 *
 * Uso (desde carpeta backend):
 *   node scripts/list-super-admins.js
 *
 * O con DATABASE_URL en el entorno:
 *   DATABASE_URL="postgresql://..." node scripts/list-super-admins.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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
  SELECT id, email, first_name, last_name, role, tenant_id
  FROM users
  WHERE role = 'SUPER_ADMIN' AND deleted_at IS NULL
  ORDER BY email
`;

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const { rows } = await pool.query(sql);
    if (rows.length === 0) {
      console.log('No hay usuarios con rol SUPER_ADMIN.');
      return;
    }
    console.log(`Super admins (${rows.length}):\n`);
    rows.forEach((r, i) => {
      console.log(`${i + 1}. ${r.email}`);
      console.log(`   id: ${r.id}`);
      console.log(`   nombre: ${r.first_name || '-'} ${r.last_name || '-'}`);
      console.log(`   role: ${r.role}  tenant_id: ${r.tenant_id ?? 'null'}`);
      console.log('');
    });
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
