/**
 * Crea un usuario SUPER_ADMIN desde consola.
 * Uso en el servidor (con el backend en Docker):
 *
 *   docker compose -f docker-compose.prod.yml run --rm \
 *     -e ADMIN_EMAIL=tu@email.com \
 *     -e ADMIN_PASSWORD=TuPasswordSeguro123! \
 *     backend node scripts/create-admin.js
 *
 * Opcional: ADMIN_FIRST_NAME, ADMIN_LAST_NAME (por defecto "Admin" / "Sistema")
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'Sistema';

  if (!email || !password) {
    console.error('Faltan variables de entorno: ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios.');
    console.error('Ejemplo:');
    console.error('  docker compose -f docker-compose.prod.yml run --rm \\');
    console.error('    -e ADMIN_EMAIL=admin@tudominio.com -e ADMIN_PASSWORD=TuPass123! \\');
    console.error('    backend node scripts/create-admin.js');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({
    where: { email, tenantId: null }
  });

  if (existing) {
    console.error(`Ya existe un usuario con email ${email}.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      firstName,
      lastName,
      isActive: true,
      tenantId: null
    }
  });

  console.log('Usuario SUPER_ADMIN creado correctamente.');
  console.log('  Email:', user.email);
  console.log('  ID:', user.id);
  console.log('Iniciá sesión en el frontend con este email y la contraseña que definiste.');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
