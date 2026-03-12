/**
 * Seed de restaurantes de ejemplo: pizzería argentina, pizzería italiana,
 * parrilla argentina, bodegón argentino, tapas españolas, casa de pastas.
 * Monedas: ARS (pesos) para todos salvo pizzería italiana y tapas españolas (EUR).
 */
import { PrismaClient, MenuStatus } from '@prisma/client';

const prisma = new PrismaClient();

type PriceRow = { currency: string; label?: string; amount: number };
type ItemRow = { name: string; description?: string; sectionIndex: number; prices: PriceRow[] };

async function ensureTenantAndIcons() {
  let tenant = await prisma.tenant.findFirst({ where: { name: 'Restaurante Demo S.A.' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Restaurante Demo S.A.',
        plan: 'free',
        settings: { timezone: 'America/Argentina/Buenos_Aires', currency: 'ARS', language: 'es-ES' },
        status: 'active',
      },
    });
    console.log('✅ Tenant demo creado');
  }
  const icons = await prisma.icon.findMany();
  return { tenant, icons };
}

async function createRestaurantWithMenu(
  tenantId: string,
  config: {
    name: string;
    slug: string;
    description: string;
    template?: string;
    sectionNames: string[];
    items: ItemRow[];
  }
) {
  const existing = await prisma.restaurant.findFirst({ where: { tenantId, slug: config.slug } });
  if (existing) {
    console.log(`⏭️  ${config.name} ya existe (slug: ${config.slug}), se omite.`);
    return { restaurant: existing, menu: null };
  }
  const restaurant = await prisma.restaurant.create({
    data: {
      tenantId,
      name: config.name,
      slug: config.slug,
      description: config.description,
      timezone: 'America/Argentina/Buenos_Aires',
      template: config.template || 'classic',
      address: 'Ejemplo de dirección',
      isActive: true,
    },
  });

  const menu = await prisma.menu.create({
    data: {
      tenantId,
      restaurantId: restaurant.id,
      name: 'Carta',
      slug: 'carta',
      description: config.description,
      status: MenuStatus.PUBLISHED,
      isActive: true,
    },
  });

  const sections = await Promise.all(
    config.sectionNames.map((name, i) =>
      prisma.menuSection.create({
        data: { tenantId, menuId: menu.id, name, sort: i + 1, isActive: true },
      })
    )
  );

  for (const item of config.items) {
    const section = sections[item.sectionIndex];
    if (!section) continue;
    const menuItem = await prisma.menuItem.create({
      data: {
        tenantId,
        menuId: menu.id,
        sectionId: section.id,
        name: item.name,
        description: item.description ?? null,
        sort: 0,
        active: true,
      },
    });
    for (const p of item.prices) {
      await prisma.itemPrice.create({
        data: {
          tenantId,
          itemId: menuItem.id,
          currency: p.currency,
          label: p.label ?? 'Porción',
          amount: p.amount,
        },
      });
    }
  }

  return { restaurant, menu };
}

const EXAMPLES = [
  {
    name: 'Pizzería Argentina',
    slug: 'pizzeria-argentina',
    description: 'Pizza a la piedra y variedades argentinas',
    template: 'classic',
    sectionNames: ['Pizzas', 'Empanadas', 'Bebidas'],
    currency: 'ARS' as const,
    items: [
      { name: 'Pizza Muzzarella', description: 'Salsa de tomate y muzzarella', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 4500 }] },
      { name: 'Pizza Napolitana', description: 'Muzzarella, tomate y jamón', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 5200 }] },
      { name: 'Pizza Fugazzeta', description: 'Cebolla y muzzarella', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 4800 }] },
      { name: 'Empanada de Carne', description: 'Por unidad', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 600 }] },
      { name: 'Empanada de Jamón y Queso', description: 'Por unidad', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 550 }] },
      { name: 'Coca-Cola 500ml', sectionIndex: 2, prices: [{ currency: 'ARS', label: '500ml', amount: 800 }] },
      { name: 'Cerveza 1L', sectionIndex: 2, prices: [{ currency: 'ARS', label: '1L', amount: 1200 }] },
    ],
  },
  {
    name: 'Pizzería Italiana',
    slug: 'pizzeria-italiana',
    description: 'Auténtica pizza napolitana y cocina italiana',
    template: 'italianFood',
    sectionNames: ['Pizze', 'Antipasti', 'Bevande'],
    currency: 'EUR' as const,
    items: [
      { name: 'Margherita', description: 'Pomodoro, mozzarella, basilico', sectionIndex: 0, prices: [{ currency: 'EUR', amount: 10 }] },
      { name: 'Quattro Formaggi', description: 'Mozzarella, gorgonzola, parmigiano, fontina', sectionIndex: 0, prices: [{ currency: 'EUR', amount: 14 }] },
      { name: 'Diavola', description: 'Pomodoro, mozzarella, salame piccante', sectionIndex: 0, prices: [{ currency: 'EUR', amount: 12 }] },
      { name: 'Bruschetta al pomodoro', sectionIndex: 1, prices: [{ currency: 'EUR', amount: 6 }] },
      { name: 'Caprese', description: 'Mozzarella, pomodoro, basilico', sectionIndex: 1, prices: [{ currency: 'EUR', amount: 8 }] },
      { name: 'Acqua naturale', sectionIndex: 2, prices: [{ currency: 'EUR', label: '500ml', amount: 2.5 }] },
      { name: 'Vino della casa', sectionIndex: 2, prices: [{ currency: 'EUR', label: 'copa', amount: 4 }] },
    ],
  },
  {
    name: 'Parrilla Argentina',
    slug: 'parrilla-argentina',
    description: 'Asado, chorizos y cortes a la parrilla',
    template: 'classic',
    sectionNames: ['Carnes', 'Acompañamientos', 'Bebidas'],
    currency: 'ARS' as const,
    items: [
      { name: 'Asado de tira', description: 'Porción 400g', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 6500 }] },
      { name: 'Vacío', description: 'Porción 350g', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 7200 }] },
      { name: 'Chorizo criollo', description: 'Unidad', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 1800 }] },
      { name: 'Ensalada mixta', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 2200 }] },
      { name: 'Papas fritas', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 1500 }] },
      { name: 'Morrón', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 1200 }] },
      { name: 'Agua mineral', sectionIndex: 2, prices: [{ currency: 'ARS', label: '500ml', amount: 600 }] },
      { name: 'Vino tinto copa', sectionIndex: 2, prices: [{ currency: 'ARS', amount: 1400 }] },
    ],
  },
  {
    name: 'Bodegón Argentino',
    slug: 'bodegon-argentino',
    description: 'Cocina de barrio y platos de siempre',
    template: 'foodie',
    sectionNames: ['Platos del día', 'Minutas', 'Postres y Bebidas'],
    currency: 'ARS' as const,
    items: [
      { name: 'Milanesa con puré', description: 'Clásica con puré de papas', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 4200 }] },
      { name: 'Tallarines con estofado', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 3800 }] },
      { name: 'Pollo al horno con ensalada', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 4000 }] },
      { name: 'Omelette con jamón y queso', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 2800 }] },
      { name: 'Ravioles con tuco', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 3500 }] },
      { name: 'Flan con dulce de leche', sectionIndex: 2, prices: [{ currency: 'ARS', amount: 1100 }] },
      { name: 'Café con leche', sectionIndex: 2, prices: [{ currency: 'ARS', amount: 900 }] },
    ],
  },
  {
    name: 'Tapas Españolas',
    slug: 'tapas-espanolas',
    description: 'Tapas, raciones y vinos españoles',
    template: 'minimalist',
    sectionNames: ['Tapas', 'Raciones', 'Bebidas'],
    currency: 'EUR' as const,
    items: [
      { name: 'Tortilla española', description: 'Porción', sectionIndex: 0, prices: [{ currency: 'EUR', amount: 4.5 }] },
      { name: 'Patatas bravas', sectionIndex: 0, prices: [{ currency: 'EUR', amount: 5 }] },
      { name: 'Jamón ibérico', description: 'Ración 80g', sectionIndex: 0, prices: [{ currency: 'EUR', amount: 12 }] },
      { name: 'Pulpo a la gallega', sectionIndex: 1, prices: [{ currency: 'EUR', amount: 14 }] },
      { name: 'Paella valenciana', description: 'Para 2 personas', sectionIndex: 1, prices: [{ currency: 'EUR', amount: 22 }] },
      { name: 'Copa de vino', sectionIndex: 2, prices: [{ currency: 'EUR', amount: 3.5 }] },
      { name: 'Sangría jarra', sectionIndex: 2, prices: [{ currency: 'EUR', label: '1L', amount: 12 }] },
    ],
  },
  {
    name: 'Casa de Pastas',
    slug: 'casa-de-pastas',
    description: 'Pastas frescas y salsas caseras',
    template: 'classic',
    sectionNames: ['Pastas', 'Salsas', 'Bebidas'],
    currency: 'ARS' as const,
    items: [
      { name: 'Ñoquis de papa', description: 'Porción 400g', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 3200 }] },
      { name: 'Ravioles de verdura', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 3500 }] },
      { name: 'Sorrentinos de jamón y queso', sectionIndex: 0, prices: [{ currency: 'ARS', amount: 3800 }] },
      { name: 'Tuco', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 800 }] },
      { name: 'Salsa blanca', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 900 }] },
      { name: 'Salsa cuatro quesos', sectionIndex: 1, prices: [{ currency: 'ARS', amount: 1100 }] },
      { name: 'Gaseosa 500ml', sectionIndex: 2, prices: [{ currency: 'ARS', amount: 700 }] },
      { name: 'Agua con gas', sectionIndex: 2, prices: [{ currency: 'ARS', label: '500ml', amount: 500 }] },
    ],
  },
];

async function main() {
  console.log('🌱 Cargando restaurantes de ejemplo...\n');

  const { tenant } = await ensureTenantAndIcons();

  for (const ex of EXAMPLES) {
    const { items, currency, ...rest } = ex;
    const normalizedItems: ItemRow[] = items.map((i) => ({
      ...i,
      prices: i.prices.map((p) => ({ ...p, currency: p.currency || currency })),
    }));
    await createRestaurantWithMenu(tenant.id, {
      ...rest,
      sectionNames: ex.sectionNames,
      items: normalizedItems,
    });
    console.log(`✅ ${ex.name} (${ex.slug}) – ${ex.currency}`);
  }

  console.log('\n🎉 6 restaurantes de ejemplo creados.');
  console.log('   ARS: Pizzería Argentina, Parrilla Argentina, Bodegón Argentino, Casa de Pastas');
  console.log('   EUR: Pizzería Italiana, Tapas Españolas');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
