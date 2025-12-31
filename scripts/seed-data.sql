-- ========================================
-- MenuQR - Seed de Datos Iniciales
-- ========================================

-- Importar bcrypt para hashear passwords (usaremos valores pre-hasheados)
-- Password: SuperAdmin123! -> hash con bcrypt rounds 12
-- Password: Admin123! -> hash con bcrypt rounds 12

-- ========================================
-- CREAR TENANT DEMO
-- ========================================
INSERT INTO "tenants" ("id", "name", "plan", "settings", "status", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000001',
    'Restaurante Demo S.A.',
    'free',
    '{"timezone": "America/Argentina/Buenos_Aires", "currency": "ARS", "language": "es-ES"}'::jsonb,
    'active',
    NOW(),
    NOW()
);

-- ========================================
-- CREAR SUPER ADMIN
-- ========================================
-- Password: SuperAdmin123! (bcrypt hash)
INSERT INTO "users" ("id", "tenant_id", "email", "password_hash", "role", "first_name", "last_name", "is_active", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000002',
    NULL,
    'superadmin@menuqr.com',
    '$2b$12$KcyZjVW/UlPE8DC8Ovj7j.V4Pmc0rYzKM4gwqJygMfYV5gChOh1fm', -- SuperAdmin123!
    'SUPER_ADMIN',
    'Super',
    'Administrador',
    true,
    NOW(),
    NOW()
);

-- ========================================
-- CREAR ADMIN DEL TENANT
-- ========================================
-- Password: Admin123! (bcrypt hash)
INSERT INTO "users" ("id", "tenant_id", "email", "password_hash", "role", "first_name", "last_name", "is_active", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000003',
    'clx00000000000000000000001',
    'admin@demo.com',
    '$2b$12$zHHaIMeroScWo0Vzago/zu2cC5UcjY4IYNflaHGY40aRVydyGd.iC', -- Admin123!
    'ADMIN',
    'Juan',
    'Pérez',
    true,
    NOW(),
    NOW()
);

-- ========================================
-- CREAR RESTAURANTE DEMO
-- ========================================
INSERT INTO "restaurants" ("id", "tenant_id", "name", "slug", "description", "timezone", "address", "phone", "email", "website", "is_active", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000004',
    'clx00000000000000000000001',
    'La Parrilla del Sur',
    'la-parrilla-del-sur',
    'El mejor asado argentino en la ciudad',
    'America/Argentina/Buenos_Aires',
    'Av. Corrientes 1234, Buenos Aires',
    '+54 11 1234-5678',
    'info@laparrilla.com',
    'https://laparrilla.com',
    true,
    NOW(),
    NOW()
);

-- ========================================
-- CREAR MENÚ DEMO
-- ========================================
INSERT INTO "menus" ("id", "tenant_id", "restaurant_id", "name", "description", "status", "template", "is_active", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000005',
    'clx00000000000000000000001',
    'clx00000000000000000000004',
    'Carta Principal',
    'Nuestra selección de platos tradicionales argentinos',
    'PUBLISHED',
    'classic',
    true,
    NOW(),
    NOW()
);

-- ========================================
-- CREAR SECCIONES DEL MENÚ
-- ========================================
INSERT INTO "menu_sections" ("id", "tenant_id", "menu_id", "name", "sort", "is_active", "created_at", "updated_at") VALUES
('clx00000000000000000000006', 'clx00000000000000000000001', 'clx00000000000000000000005', 'Entradas', 1, true, NOW(), NOW()),
('clx00000000000000000000007', 'clx00000000000000000000001', 'clx00000000000000000000005', 'Platos Principales', 2, true, NOW(), NOW()),
('clx00000000000000000000008', 'clx00000000000000000000001', 'clx00000000000000000000005', 'Postres', 3, true, NOW(), NOW()),
('clx00000000000000000000009', 'clx00000000000000000000001', 'clx00000000000000000000005', 'Bebidas', 4, true, NOW(), NOW());

-- ========================================
-- CREAR ÍCONOS
-- ========================================
INSERT INTO "icons" ("id", "code", "label_i18n_key", "is_active", "created_at", "updated_at") VALUES
('clx00000000000000000000010', 'celiaco', 'icons.celiac', true, NOW(), NOW()),
('clx00000000000000000000011', 'picante', 'icons.spicy', true, NOW(), NOW()),
('clx00000000000000000000012', 'vegano', 'icons.vegan', true, NOW(), NOW()),
('clx00000000000000000000013', 'vegetariano', 'icons.vegetarian', true, NOW(), NOW()),
('clx00000000000000000000014', 'sin-gluten', 'icons.gluten-free', true, NOW(), NOW()),
('clx00000000000000000000015', 'sin-lactosa', 'icons.lactose-free', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS DEL MENÚ
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000016', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000006', 'Empanadas de Carne', 'Tres empanadas de carne vacuna con cebolla y especias', true, NOW(), NOW()),
('clx00000000000000000000017', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000006', 'Provoleta', 'Queso provolone gratinado con hierbas y aceite de oliva', true, NOW(), NOW()),
('clx00000000000000000000018', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000007', 'Asado de Tira', 'Asado de tira con chimichurri y papas fritas', true, NOW(), NOW()),
('clx00000000000000000000019', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000007', 'Milanesa a la Napolitana', 'Milanesa de ternera con salsa de tomate, jamón y queso gratinado', true, NOW(), NOW()),
('clx00000000000000000000020', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000007', 'Pollo al Disco', 'Pollo cocinado al disco con verduras y hierbas', true, NOW(), NOW()),
('clx00000000000000000000021', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000008', 'Flan Casero', 'Flan casero con dulce de leche y crema', true, NOW(), NOW()),
('clx00000000000000000000022', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000008', 'Helado Artesanal', 'Helado artesanal de vainilla con frutos rojos', true, NOW(), NOW()),
('clx00000000000000000000023', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000009', 'Agua Mineral', 'Agua mineral con o sin gas', true, NOW(), NOW()),
('clx00000000000000000000024', 'clx00000000000000000000001', 'clx00000000000000000000005', 'clx00000000000000000000009', 'Cerveza Artesanal', 'Cerveza artesanal de la casa', true, NOW(), NOW());

-- ========================================
-- CREAR PRECIOS
-- ========================================
INSERT INTO "item_prices" ("id", "tenant_id", "item_id", "currency", "label", "amount", "created_at", "updated_at") VALUES
('clx00000000000000000000025', 'clx00000000000000000000001', 'clx00000000000000000000016', 'ARS', 'Porción', 1200.00, NOW(), NOW()),
('clx00000000000000000000026', 'clx00000000000000000000001', 'clx00000000000000000000017', 'ARS', 'Porción', 1500.00, NOW(), NOW()),
('clx00000000000000000000027', 'clx00000000000000000000001', 'clx00000000000000000000018', 'ARS', 'Porción', 3500.00, NOW(), NOW()),
('clx00000000000000000000028', 'clx00000000000000000000001', 'clx00000000000000000000019', 'ARS', 'Porción', 2800.00, NOW(), NOW()),
('clx00000000000000000000029', 'clx00000000000000000000001', 'clx00000000000000000000020', 'ARS', 'Porción', 3200.00, NOW(), NOW()),
('clx00000000000000000000030', 'clx00000000000000000000001', 'clx00000000000000000000021', 'ARS', 'Porción', 800.00, NOW(), NOW()),
('clx00000000000000000000031', 'clx00000000000000000000001', 'clx00000000000000000000022', 'ARS', 'Porción', 600.00, NOW(), NOW()),
('clx00000000000000000000032', 'clx00000000000000000000001', 'clx00000000000000000000023', 'ARS', '500ml', 300.00, NOW(), NOW()),
('clx00000000000000000000033', 'clx00000000000000000000001', 'clx00000000000000000000024', 'ARS', '500ml', 800.00, NOW(), NOW());

-- ========================================
-- ASIGNAR ÍCONOS A PRODUCTOS
-- ========================================
INSERT INTO "item_icons" ("id", "item_id", "icon_id", "created_at") VALUES
('clx00000000000000000000034', 'clx00000000000000000000016', 'clx00000000000000000000010', NOW()), -- Empanadas: celiaco
('clx00000000000000000000035', 'clx00000000000000000000017', 'clx00000000000000000000013', NOW()), -- Provoleta: vegetariano
('clx00000000000000000000036', 'clx00000000000000000000018', 'clx00000000000000000000010', NOW()), -- Asado: celiaco
('clx00000000000000000000037', 'clx00000000000000000000019', 'clx00000000000000000000010', NOW()), -- Milanesa: celiaco
('clx00000000000000000000038', 'clx00000000000000000000020', 'clx00000000000000000000010', NOW()), -- Pollo: celiaco
('clx00000000000000000000039', 'clx00000000000000000000021', 'clx00000000000000000000013', NOW()), -- Flan: vegetariano
('clx00000000000000000000040', 'clx00000000000000000000022', 'clx00000000000000000000013', NOW()), -- Helado: vegetariano
('clx00000000000000000000041', 'clx00000000000000000000023', 'clx00000000000000000000012', NOW()), -- Agua: vegano
('clx00000000000000000000042', 'clx00000000000000000000023', 'clx00000000000000000000010', NOW()), -- Agua: celiaco
('clx00000000000000000000043', 'clx00000000000000000000024', 'clx00000000000000000000012', NOW()), -- Cerveza: vegano
('clx00000000000000000000044', 'clx00000000000000000000024', 'clx00000000000000000000010', NOW()); -- Cerveza: celiaco

-- ========================================
-- CREAR QR CODE (sin imagen por ahora)
-- ========================================
INSERT INTO "qr_codes" ("id", "menu_id", "url", "is_active", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000045',
    'clx00000000000000000000005',
    'http://localhost:3000/r/la-parrilla-del-sur',
    true,
    NOW(),
    NOW()
);

-- ========================================
-- CREAR TRADUCCIONES
-- ========================================
INSERT INTO "translations" ("id", "tenant_id", "entity_type", "entity_id", "locale", "key", "value", "created_at", "updated_at") VALUES
('clx00000000000000000000046', 'clx00000000000000000000001', 'restaurant', 'clx00000000000000000000004', 'es-ES', 'welcome_message', '¡Bienvenidos a La Parrilla del Sur!', NOW(), NOW()),
('clx00000000000000000000047', 'clx00000000000000000000001', 'restaurant', 'clx00000000000000000000004', 'es-ES', 'about_us', 'Somos especialistas en asado argentino desde 1995', NOW(), NOW()),
('clx00000000000000000000048', 'clx00000000000000000000001', 'menu', 'clx00000000000000000000005', 'es-ES', 'special_offers', 'Ofertas especiales todos los martes', NOW(), NOW());

-- ========================================
-- CREAR LOGS DE AUDITORÍA
-- ========================================
INSERT INTO "audit_logs" ("id", "tenant_id", "actor_user_id", "action", "entity", "entity_id", "payload", "created_at") VALUES
('clx00000000000000000000049', 'clx00000000000000000000001', 'clx00000000000000000000003', 'CREATE', 'restaurant', 'clx00000000000000000000004', '{"name": "La Parrilla del Sur", "slug": "la-parrilla-del-sur"}'::jsonb, NOW()),
('clx00000000000000000000050', 'clx00000000000000000000001', 'clx00000000000000000000003', 'CREATE', 'menu', 'clx00000000000000000000005', '{"name": "Carta Principal", "status": "PUBLISHED"}'::jsonb, NOW());

