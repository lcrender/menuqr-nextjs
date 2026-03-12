import { PrismaClient, MenuStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Leer email desde los argumentos
  const args = process.argv.slice(2);
  let email: string | undefined;

  if (args.length === 1) {
    email = args[0];
  } else if (args.length >= 2) {
    // Cuando se ejecuta como: npx ts-node prisma/seed-single-menu-29-items.ts email
    // a veces el primer arg es la ruta del script; detectamos eso por extensión .ts
    email = args[0].endsWith('.ts') ? args[1] : args[0];
  }

  if (!email) {
    console.error('❌ Debes indicar el email del usuario.');
    console.error('   Ejemplo: npx ts-node prisma/seed-single-menu-29-items.ts lcrender@gmail.com');
    process.exit(1);
  }

  console.log(`➡️  Buscando usuario con email: ${email}`);

  // 1) Buscar usuario por email
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });

  if (!user) {
    console.error(`❌ No se encontró ningún usuario con el email "${email}".`);
    process.exit(1);
  }

  if (!user.tenantId) {
    console.error(
      `❌ El usuario "${email}" no tiene un tenant asociado (posible SUPER_ADMIN). ` +
        'Este seed necesita un tenant para poder crear el restaurante y el menú.'
    );
    process.exit(1);
  }

  const tenantId = user.tenantId;
  console.log(`✅ Usuario encontrado. tenantId = ${tenantId}`);

  // 2) Crear (o reutilizar) un restaurante para este usuario/tenant
  const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const restaurantSlug = `demo-29-${emailPrefix}`;

  let restaurant = await prisma.restaurant.findFirst({
    where: {
      tenantId,
      slug: restaurantSlug,
      deletedAt: null,
    },
  });

  if (restaurant) {
    console.log(`ℹ️  Restaurante demo ya existe para este usuario (slug: ${restaurantSlug}). Se reutilizará.`);
  } else {
    restaurant = await prisma.restaurant.create({
      data: {
        tenantId,
        name: `Demo 29 productos (${emailPrefix})`,
        slug: restaurantSlug,
        description: 'Restaurante de ejemplo con 1 menú, secciones y 29 productos.',
        timezone: 'America/Argentina/Buenos_Aires',
        template: 'classic',
        address: 'Dirección demo',
        isActive: true,
      },
    });
    console.log(`✅ Restaurante creado: ${restaurant.name} (slug: ${restaurant.slug})`);
  }

  // 3) Crear menú (si no existe) para este restaurante
  const menuSlug = 'menu-demo-29';
  let menu = await prisma.menu.findFirst({
    where: {
      tenantId,
      restaurantId: restaurant.id,
      slug: menuSlug,
      deletedAt: null,
    },
  });

  if (menu) {
    console.log(`ℹ️  Menú demo ya existe para este restaurante (slug: ${menuSlug}). Se reutilizará.`);
  } else {
    menu = await prisma.menu.create({
      data: {
        tenantId,
        restaurantId: restaurant.id,
        name: 'Menú demo 29 productos',
        slug: menuSlug,
        description: 'Menú de ejemplo con 29 productos y un solo precio por producto.',
        status: MenuStatus.PUBLISHED,
        isActive: true,
      },
    });
    console.log(`✅ Menú creado: ${menu.name} (slug: ${menu.slug})`);
  }

  // 4) Crear secciones
  const sectionNames = ['Entradas', 'Platos principales', 'Bebidas'];

  // Para evitar duplicados de secciones si ya se corrió el seed, revisamos por nombre
  const existingSections = await prisma.menuSection.findMany({
    where: {
      tenantId,
      menuId: menu.id,
      deletedAt: null,
    },
    orderBy: { sort: 'asc' },
  });

  const sections =
    existingSections.length > 0
      ? existingSections
      : await Promise.all(
          sectionNames.map((name, i) =>
            prisma.menuSection.create({
              data: {
                tenantId,
                menuId: menu.id,
                name,
                sort: i + 1,
                isActive: true,
              },
            })
          )
        );

  if (existingSections.length > 0) {
    console.log(`ℹ️  Se reutilizan ${sections.length} secciones ya existentes para este menú.`);
  } else {
    console.log(`✅ Secciones creadas: ${sections.map((s) => s.name).join(', ')}`);
  }

  // 5) Crear 29 productos con un solo precio cada uno
  // Antes de crear, verificamos cuántos productos hay ya en este menú para no duplicar en exceso.
  const existingItemsCount = await prisma.menuItem.count({
    where: {
      tenantId,
      menuId: menu.id,
      deletedAt: null,
    },
  });

  const toCreate = Math.max(0, 29 - existingItemsCount);
  if (toCreate === 0) {
    console.log(`ℹ️  El menú ya tiene ${existingItemsCount} productos. No se crean nuevos (objetivo: 29).`);
    return;
  }

  console.log(`➡️  Creando ${toCreate} productos demo (hasta llegar a 29 en total)...`);

  const baseIndex = existingItemsCount; // para continuar numeración

  for (let i = 0; i < toCreate; i++) {
    const globalIndex = baseIndex + i + 1; // 1-based
    const sectionIndex = globalIndex % sections.length; // reparte entre secciones
    const section = sections[sectionIndex];

    const itemName = `Producto demo ${globalIndex}`;
    const itemDescription = `Descripción del producto demo ${globalIndex}`;
    const amount = 1000 + globalIndex * 100;

    const menuItem = await prisma.menuItem.create({
      data: {
        tenantId,
        menuId: menu.id,
        sectionId: section.id,
        name: itemName,
        description: itemDescription,
        sort: 0,
        active: true,
      },
    });

    await prisma.itemPrice.create({
      data: {
        tenantId,
        itemId: menuItem.id,
        currency: 'ARS',
        label: 'Precio',
        amount,
      },
    });
  }

  console.log('✅ Seed completado. Menú con 29 productos de ejemplo preparado para el usuario:', email);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

