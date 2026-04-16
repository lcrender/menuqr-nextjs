import { PrismaClient, UserRole, MenuStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de AppMenuQR...');

  // ========================================
  // CREAR TENANT DEMO
  // ========================================
  console.log('📋 Creando tenant demo...');
  
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Restaurante Demo S.A.',
      plan: 'free',
      settings: {
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es-ES'
      },
      status: 'active'
    }
  });

  console.log(`✅ Tenant creado: ${demoTenant.name} (ID: ${demoTenant.id})`);

  // ========================================
  // CREAR SUPER ADMIN
  // ========================================
  console.log('👑 Creando super admin...');
  
  const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 12);
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@menuqr.com',
      passwordHash: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
      firstName: 'Super',
      lastName: 'Administrador',
      isActive: true,
    }
  });
  await prisma.$executeRaw`UPDATE users SET email_verified = true WHERE id = ${superAdmin.id}`;

  console.log(`✅ Super Admin creado: ${superAdmin.email}`);

  // ========================================
  // CREAR ADMIN DEL TENANT
  // ========================================
  console.log('👨‍💼 Creando admin del tenant...');
  
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'admin@demo.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      firstName: 'Juan',
      lastName: 'Pérez',
      isActive: true,
    }
  });
  await prisma.$executeRaw`UPDATE users SET email_verified = true WHERE id = ${admin.id}`;

  console.log(`✅ Admin creado: ${admin.email}`);

  // ========================================
  // CREAR RESTAURANTE DEMO
  // ========================================
  console.log('🍽️ Creando restaurante demo...');
  
  const restaurant = await prisma.restaurant.create({
    data: {
      tenantId: demoTenant.id,
      name: 'La Parrilla del Sur',
      slug: 'la-parrilla-del-sur',
      description: 'El mejor asado argentino en la ciudad',
      timezone: 'America/Argentina/Buenos_Aires',
      address: 'Av. Corrientes 1234, Buenos Aires',
      phone: '+54 11 1234-5678',
      email: 'info@laparrilla.com',
      website: 'https://laparrilla.com',
      isActive: true
    }
  });

  console.log(`✅ Restaurante creado: ${restaurant.name}`);

  // ========================================
  // CREAR MENÚ DEMO
  // ========================================
  console.log('📖 Creando menú demo...');
  
  const menu = await prisma.menu.create({
    data: {
      tenant: { connect: { id: demoTenant.id } },
      restaurant: { connect: { id: restaurant.id } },
      name: 'Carta Principal',
      slug: 'carta-principal',
      description: 'Nuestra selección de platos tradicionales argentinos',
      status: MenuStatus.PUBLISHED,
      isActive: true
    }
  });

  console.log(`✅ Menú creado: ${menu.name}`);

  // ========================================
  // CREAR SECCIONES DEL MENÚ
  // ========================================
  console.log('📑 Creando secciones del menú...');
  
  const sections = [
    { name: 'Entradas', sort: 1 },
    { name: 'Platos Principales', sort: 2 },
    { name: 'Postres', sort: 3 },
    { name: 'Bebidas', sort: 4 }
  ];

  const createdSections = [];
  for (const sectionData of sections) {
    const section = await prisma.menuSection.create({
      data: {
        tenantId: demoTenant.id,
        menuId: menu.id,
        ...sectionData,
        isActive: true
      }
    });
    createdSections.push(section);
    console.log(`✅ Sección creada: ${section.name}`);
  }

  // ========================================
  // CREAR ÍCONOS
  // ========================================
  console.log('🏷️ Creando íconos...');
  
  const icons = [
    { code: 'celiaco', labelI18nKey: 'icons.celiac' },
    { code: 'picante', labelI18nKey: 'icons.spicy' },
    { code: 'vegano', labelI18nKey: 'icons.vegan' },
    { code: 'vegetariano', labelI18nKey: 'icons.vegetarian' },
    { code: 'sin-gluten', labelI18nKey: 'icons.gluten-free' },
    { code: 'sin-lactosa', labelI18nKey: 'icons.lactose-free' }
  ];

  const createdIcons = [];
  for (const iconData of icons) {
    const icon = await prisma.icon.create({
      data: iconData
    });
    createdIcons.push(icon);
    console.log(`✅ Ícono creado: ${icon.code}`);
  }

  // ========================================
  // CREAR PRODUCTOS DEL MENÚ
  // ========================================
  console.log('🍖 Creando productos del menú...');
  
  const menuItems = [
    {
      name: 'Empanadas de Carne',
      description: 'Tres empanadas de carne vacuna con cebolla y especias',
      sectionId: createdSections[0].id, // Entradas
      icons: ['celiaco'],
      prices: [
        { currency: 'ARS', label: 'Porción', amount: 1200 }
      ]
    },
    {
      name: 'Provoleta',
      description: 'Queso provolone gratinado con hierbas y aceite de oliva',
      sectionId: createdSections[0].id, // Entradas
      icons: ['vegetariano'],
      prices: [
        { currency: 'ARS', label: 'Porción', amount: 1500 }
      ]
    },
    {
      name: 'Asado de Tira',
      description: 'Asado de tira con chimichurri y papas fritas',
      sectionId: createdSections[1].id, // Platos Principales
      icons: ['celiaco'],
      prices: [
        { currency: 'ARS', label: 'Porción', amount: 3500 }
      ]
    },
    {
      name: 'Milanesa a la Napolitana',
      description: 'Milanesa de ternera con salsa de tomate, jamón y queso gratinado',
      sectionId: createdSections[1].id, // Platos Principales
      icons: ['celiaco'],
      prices: [
        { currency: 'ARS', label: 'Porción', amount: 2800 }
      ]
    },
    {
      name: 'Pollo al Disco',
      description: 'Pollo cocinado al disco con verduras y hierbas',
      sectionId: createdSections[1].id, // Platos Principales
      icons: ['celiaco'],
      prices: [
        { currency: 'ARS', label: 'Porción', amount: 3200 }
      ]
    },
    {
      name: 'Flan Casero',
      description: 'Flan casero con dulce de leche y crema',
      sectionId: createdSections[2].id, // Postres
      icons: ['vegetariano'],
      prices: [
        { currency: 'ARS', label: 'Porción', amount: 800 }
      ]
    },
    {
      name: 'Helado Artesanal',
      description: 'Helado artesanal de vainilla con frutos rojos',
      sectionId: createdSections[2].id, // Postres
      icons: ['vegetariano'],
      prices: [
        { currency: 'ARS', label: 'Porción', amount: 600 }
      ]
    },
    {
      name: 'Agua Mineral',
      description: 'Agua mineral con o sin gas',
      sectionId: createdSections[3].id, // Bebidas
      icons: ['vegano', 'celiaco'],
      prices: [
        { currency: 'ARS', label: '500ml', amount: 300 }
      ]
    },
    {
      name: 'Cerveza Artesanal',
      description: 'Cerveza artesanal de la casa',
      sectionId: createdSections[3].id, // Bebidas
      icons: ['vegano', 'celiaco'],
      prices: [
        { currency: 'ARS', label: '500ml', amount: 800 }
      ]
    }
  ];

  for (const itemData of menuItems) {
    const { icons: iconCodes, prices, ...itemFields } = itemData;
    
    // Crear el ítem
    const menuItem = await prisma.menuItem.create({
      data: {
        tenantId: demoTenant.id,
        menuId: menu.id,
        ...itemFields,
        active: true
      }
    });

    console.log(`✅ Producto creado: ${menuItem.name}`);

    // Crear precios
    for (const priceData of prices) {
      await prisma.itemPrice.create({
        data: {
          tenantId: demoTenant.id,
          itemId: menuItem.id,
          ...priceData
        }
      });
    }

    // Asignar íconos
    for (const iconCode of iconCodes) {
      const icon = createdIcons.find(i => i.code === iconCode);
      if (icon) {
        await prisma.itemIcon.create({
          data: {
            itemId: menuItem.id,
            iconId: icon.id
          }
        });
      }
    }
  }

  // ========================================
  // GENERAR QR PARA EL MENÚ
  // ========================================
  console.log('🔲 Generando QR para el menú...');
  
  const menuUrl = `http://localhost:3000/r/${restaurant.slug}`;
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Guardar el QR en la base de datos
    await prisma.qRCode.create({
      data: {
        menuId: menu.id,
        url: menuUrl,
        qrImageUrl: qrCodeDataUrl,
        isActive: true
      }
    });

    console.log(`✅ QR generado para: ${menuUrl}`);
  } catch (error) {
    console.error('❌ Error generando QR:', error);
  }

  // ========================================
  // CREAR TRADUCCIONES DE EJEMPLO
  // ========================================
  console.log('🌍 Creando traducciones de ejemplo...');
  
  const translations = [
    { entityType: 'restaurant', entityId: restaurant.id, key: 'welcome_message', value: '¡Bienvenidos a La Parrilla del Sur!' },
    { entityType: 'restaurant', entityId: restaurant.id, key: 'about_us', value: 'Somos especialistas en asado argentino desde 1995' },
    { entityType: 'menu', entityId: menu.id, key: 'special_offers', value: 'Ofertas especiales todos los martes' }
  ];

  for (const translationData of translations) {
    await prisma.translation.create({
      data: {
        tenantId: demoTenant.id,
        locale: 'es-ES',
        ...translationData
      }
    });
  }

  console.log(`✅ ${translations.length} traducciones creadas`);

  // ========================================
  // CREAR LOGS DE AUDITORÍA
  // ========================================
  console.log('📝 Creando logs de auditoría...');
  
  const auditLogs = [
    {
      tenantId: demoTenant.id,
      actorUserId: admin.id,
      action: 'CREATE',
      entity: 'restaurant',
      entityId: restaurant.id,
      payload: { name: restaurant.name, slug: restaurant.slug }
    },
    {
      tenantId: demoTenant.id,
      actorUserId: admin.id,
      action: 'CREATE',
      entity: 'menu',
      entityId: menu.id,
      payload: { name: menu.name, status: menu.status }
    }
  ];

  for (const logData of auditLogs) {
    await prisma.auditLog.create({
      data: logData
    });
  }

  console.log(`✅ ${auditLogs.length} logs de auditoría creados`);

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`   • 1 Tenant: ${demoTenant.name}`);
  console.log(`   • 2 Usuarios: Super Admin y Admin`);
  console.log(`   • 1 Restaurante: ${restaurant.name}`);
  console.log(`   • 1 Menú: ${menu.name} (${menu.status})`);
  console.log(`   • ${createdSections.length} Secciones del menú`);
  console.log(`   • ${menuItems.length} Productos del menú`);
  console.log(`   • ${createdIcons.length} Íconos disponibles`);
  console.log(`   • 1 QR Code generado`);
  console.log(`   • ${translations.length} Traducciones`);
  console.log(`   • ${auditLogs.length} Logs de auditoría`);
  
  console.log('\n🔐 Credenciales de acceso:');
  console.log('   Super Admin: superadmin@menuqr.com / SuperAdmin123!');
  console.log('   Admin: admin@demo.com / Admin123!');
  
  console.log('\n🔗 URLs importantes:');
  console.log(`   • Menú público: ${menuUrl}`);
  console.log(`   • Panel admin: http://localhost:3000/admin`);
  console.log(`   • Panel super admin: http://localhost:3000/super-admin`);
  
  console.log('\n✨ ¡Tu MVP de AppMenuQR está listo para usar!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

