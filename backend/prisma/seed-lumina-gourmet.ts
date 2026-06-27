import { PrismaClient, MenuStatus } from '@prisma/client';
import {
  LUMINA_GOURMET_MENU,
  LUMINA_GOURMET_RESTAURANT,
  LuminaItem,
} from './data/lumina-gourmet-data';

const prisma = new PrismaClient();

const ICON_DEFINITIONS = [
  { code: 'celiaco', labelI18nKey: 'icons.celiac' },
  { code: 'picante', labelI18nKey: 'icons.spicy' },
  { code: 'vegano', labelI18nKey: 'icons.vegan' },
  { code: 'vegetariano', labelI18nKey: 'icons.vegetarian' },
  { code: 'sin-gluten', labelI18nKey: 'icons.gluten-free' },
  { code: 'sin-lactosa', labelI18nKey: 'icons.lactose-free' },
];

function parseEmailArg(): string {
  const args = process.argv.slice(2);
  let email: string | undefined;

  if (args.length === 1) {
    email = args[0];
  } else if (args.length >= 2) {
    email = args[0].endsWith('.ts') ? args[1] : args[0];
  }

  if (!email) {
    console.error('❌ Debes indicar el email del usuario.');
    console.error('   Ejemplo: npx ts-node --project prisma/tsconfig.json prisma/seed-lumina-gourmet.ts usuario@ejemplo.com');
    process.exit(1);
  }

  return email;
}

function photoFilename(photoPath: string): string {
  const parts = photoPath.split('/');
  return parts[parts.length - 1] || 'photo.jpg';
}

async function ensureIcons(): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (const def of ICON_DEFINITIONS) {
    const icon = await prisma.icon.upsert({
      where: { code: def.code },
      create: def,
      update: {},
    });
    map.set(icon.code, icon.id);
  }

  return map;
}

async function attachIcons(itemId: string, iconCodes: string[], iconMap: Map<string, string>) {
  for (const code of iconCodes) {
    const iconId = iconMap.get(code);
    if (!iconId) {
      console.warn(`⚠️  Ícono "${code}" no encontrado; se omite para el producto.`);
      continue;
    }

    await prisma.itemIcon.upsert({
      where: { itemId_iconId: { itemId, iconId } },
      create: { itemId, iconId },
      update: {},
    });
  }
}

async function attachPhoto(tenantId: string, itemId: string, photoPath: string) {
  const filename = photoFilename(photoPath);
  const existing = await prisma.mediaAsset.findFirst({
    where: {
      tenantId,
      itemId,
      kind: 'image',
      deletedAt: null,
      url: photoPath,
    },
  });

  if (existing) return;

  await prisma.mediaAsset.create({
    data: {
      tenantId,
      itemId,
      url: photoPath,
      kind: 'image',
      filename,
      mimeType: 'image/jpeg',
      size: 0,
    },
  });
}

async function createItem(
  tenantId: string,
  menuId: string,
  sectionId: string,
  sort: number,
  item: LuminaItem,
  iconMap: Map<string, string>,
) {
  const existing = await prisma.menuItem.findFirst({
    where: {
      tenantId,
      menuId,
      sectionId,
      name: item.name,
      deletedAt: null,
    },
  });

  if (existing) {
    console.log(`   ℹ️  Producto ya existe: ${item.name}`);
    await attachIcons(existing.id, item.icons, iconMap);
    if (item.photoPath) {
      await attachPhoto(tenantId, existing.id, item.photoPath);
    }
    return existing;
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      tenantId,
      menuId,
      sectionId,
      name: item.name,
      description: item.description ?? null,
      sort,
      active: true,
    },
  });

  for (const price of item.prices) {
    await prisma.itemPrice.create({
      data: {
        tenantId,
        itemId: menuItem.id,
        currency: price.currency,
        label: price.label ?? null,
        amount: price.amount,
      },
    });
  }

  await attachIcons(menuItem.id, item.icons, iconMap);

  if (item.photoPath) {
    await attachPhoto(tenantId, menuItem.id, item.photoPath);
  }

  console.log(`   ✅ Producto: ${item.name}`);
  return menuItem;
}

async function main() {
  const email = parseEmailArg();
  console.log(`➡️  Buscando usuario con email: ${email}`);

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user) {
    console.error(`❌ No se encontró ningún usuario con el email "${email}".`);
    process.exit(1);
  }

  if (!user.tenantId) {
    console.error(
      `❌ El usuario "${email}" no tiene tenant asociado. Este seed necesita un tenant de restaurante.`,
    );
    process.exit(1);
  }

  const tenantId = user.tenantId;
  console.log(`✅ Usuario encontrado. tenantId = ${tenantId}`);

  const iconMap = await ensureIcons();

  const restaurantConfig = LUMINA_GOURMET_RESTAURANT;
  let restaurant = await prisma.restaurant.findFirst({
    where: {
      tenantId,
      slug: restaurantConfig.slug,
      deletedAt: null,
    },
  });

  if (restaurant) {
    console.log(`ℹ️  Restaurante "${restaurantConfig.name}" ya existe (slug: ${restaurantConfig.slug}). Se reutilizará.`);
  } else {
    restaurant = await prisma.restaurant.create({
      data: {
        tenantId,
        name: restaurantConfig.name,
        slug: restaurantConfig.slug,
        description: restaurantConfig.description,
        timezone: restaurantConfig.timezone,
        template: restaurantConfig.template,
        address: restaurantConfig.address,
        phone: restaurantConfig.phone,
        email: restaurantConfig.email,
        website: restaurantConfig.website,
        logoUrl: restaurantConfig.logoUrl,
        coverUrl: restaurantConfig.coverUrl,
        isActive: true,
      },
    });
    console.log(`✅ Restaurante creado: ${restaurant.name} (slug: ${restaurant.slug})`);
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: restaurantConfig.name,
      description: restaurantConfig.description,
      timezone: restaurantConfig.timezone,
      template: restaurantConfig.template,
      address: restaurantConfig.address,
      phone: restaurantConfig.phone,
      email: restaurantConfig.email,
      website: restaurantConfig.website,
      logoUrl: restaurantConfig.logoUrl,
      coverUrl: restaurantConfig.coverUrl,
    },
  });

  await prisma.$executeRaw`
    UPDATE restaurants
    SET primary_color = ${restaurantConfig.primaryColor},
        secondary_color = ${restaurantConfig.secondaryColor},
        default_currency = ${restaurantConfig.defaultCurrency}
    WHERE id = ${restaurant.id}
  `;

  const menuConfig = LUMINA_GOURMET_MENU;
  let menu = await prisma.menu.findFirst({
    where: {
      tenantId,
      restaurantId: restaurant.id,
      slug: menuConfig.slug,
      deletedAt: null,
    },
  });

  if (menu) {
    console.log(`ℹ️  Menú "${menuConfig.name}" ya existe (slug: ${menuConfig.slug}). Se reutilizará.`);
  } else {
    menu = await prisma.menu.create({
      data: {
        tenantId,
        restaurantId: restaurant.id,
        name: menuConfig.name,
        slug: menuConfig.slug,
        description: menuConfig.description,
        status: MenuStatus.PUBLISHED,
        isActive: true,
      },
    });
    console.log(`✅ Menú creado: ${menu.name} (slug: ${menu.slug})`);
  }

  const existingSections = await prisma.menuSection.findMany({
    where: { tenantId, menuId: menu.id, deletedAt: null },
    orderBy: { sort: 'asc' },
  });

  const sectionByName = new Map(existingSections.map((s) => [s.name, s]));

  for (let sectionIndex = 0; sectionIndex < menuConfig.sections.length; sectionIndex++) {
    const sectionData = menuConfig.sections[sectionIndex];
    let section = sectionByName.get(sectionData.name);

    if (!section) {
      section = await prisma.menuSection.create({
        data: {
          tenantId,
          menuId: menu.id,
          name: sectionData.name,
          sort: sectionIndex + 1,
          isActive: true,
        },
      });
      console.log(`✅ Sección creada: ${section.name}`);
    }

    for (let itemIndex = 0; itemIndex < sectionData.items.length; itemIndex++) {
      await createItem(
        tenantId,
        menu.id,
        section.id,
        itemIndex + 1,
        sectionData.items[itemIndex],
        iconMap,
      );
    }
  }

  const totalItems = menuConfig.sections.reduce((acc, s) => acc + s.items.length, 0);
  console.log('');
  console.log('🎉 Seed Lumina (Gourmet) completado.');
  console.log(`   Restaurante: ${restaurantConfig.name} → /r/${restaurantConfig.slug}/${menuConfig.slug}`);
  console.log(`   Productos en carta: ${totalItems} (12 con foto, 3 bebidas sin foto)`);
  console.log(`   Plantilla: gourmet | Moneda: ${restaurantConfig.defaultCurrency}`);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
