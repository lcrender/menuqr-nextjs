-- ========================================
-- MenuQR - Menú de Ejemplo: Pizzería Italiana (ESPAÑOL)
-- ========================================
-- Este script crea un menú completo para una pizzería italiana
-- con 6 secciones y productos típicos italianos con precios en EUR
-- TODO EN ESPAÑOL
-- 
-- IMPORTANTE: Antes de ejecutar este script, necesitas:
-- 1. Tener un tenant_id válido (reemplaza 'clx00000000000000000000001' con el ID real)
-- 2. Tener un restaurant_id válido (reemplaza 'clx1766554478071cugyok9nx' con el ID real)
-- ========================================

-- ========================================
-- CREAR MENÚ PRINCIPAL
-- ========================================
INSERT INTO "menus" ("id", "tenant_id", "restaurant_id", "name", "slug", "description", "status", "template", "is_active", "version", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000200',
    'clx00000000000000000000001',
    'clx1766554478071cugyok9nx',
    'Menú Pizzería Italiana',
    'menu-pizzeria-italiana-es',
    'Auténtica cocina italiana con las mejores pizzas, pastas y especialidades de la casa',
    'PUBLISHED',
    'italianfood',
    true,
    1,
    NOW(),
    NOW()
);

-- ========================================
-- CREAR 6 SECCIONES DEL MENÚ (ESPAÑOL)
-- ========================================
INSERT INTO "menu_sections" ("id", "tenant_id", "menu_id", "name", "sort", "is_active", "created_at", "updated_at") VALUES
-- 1. Entradas
('clx00000000000000000000201', 'clx00000000000000000000001', 'clx00000000000000000000200', 'Entradas', 1, true, NOW(), NOW()),

-- 2. Pizzas
('clx00000000000000000000202', 'clx00000000000000000000001', 'clx00000000000000000000200', 'Pizzas', 2, true, NOW(), NOW()),

-- 3. Pastas
('clx00000000000000000000203', 'clx00000000000000000000001', 'clx00000000000000000000200', 'Pastas', 3, true, NOW(), NOW()),

-- 4. Platos Principales
('clx00000000000000000000204', 'clx00000000000000000000001', 'clx00000000000000000000200', 'Platos Principales', 4, true, NOW(), NOW()),

-- 5. Postres
('clx00000000000000000000205', 'clx00000000000000000000001', 'clx00000000000000000000200', 'Postres', 5, true, NOW(), NOW()),

-- 6. Bebidas
('clx00000000000000000000206', 'clx00000000000000000000001', 'clx00000000000000000000200', 'Bebidas', 6, true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - ENTRADAS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000210', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000201', 'Bruschetta de Tomate', 'Pan tostado con tomate fresco, ajo, albahaca y aceite de oliva extra virgen', true, NOW(), NOW()),
('clx00000000000000000000211', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000201', 'Caprese', 'Mozzarella de búfala, tomates cherry, albahaca fresca y aceite de oliva', true, NOW(), NOW()),
('clx00000000000000000000212', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000201', 'Jamón y Melón', 'Jamón de Parma con melón cantalupo', true, NOW(), NOW()),
('clx00000000000000000000213', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000201', 'Antipasto Mixto', 'Selección de embutidos italianos, quesos y verduras encurtidas', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - PIZZAS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000220', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000202', 'Margherita', 'Salsa de tomate, mozzarella fresca y albahaca', true, NOW(), NOW()),
('clx00000000000000000000221', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000202', 'Marinara', 'Salsa de tomate, ajo, orégano y aceite de oliva', true, NOW(), NOW()),
('clx00000000000000000000222', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000202', 'Napolitana', 'Salsa de tomate, mozzarella, anchoas, alcaparras y aceitunas', true, NOW(), NOW()),
('clx00000000000000000000223', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000202', 'Cuatro Estaciones', 'Salsa de tomate, mozzarella, jamón, champiñones, alcachofas y aceitunas', true, NOW(), NOW()),
('clx00000000000000000000224', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000202', 'Jamón y Champiñones', 'Salsa de tomate, mozzarella, jamón de Parma y champiñones', true, NOW(), NOW()),
('clx00000000000000000000225', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000202', 'Diavola', 'Salsa de tomate, mozzarella, salami picante y aceitunas', true, NOW(), NOW()),
('clx00000000000000000000226', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000202', 'Cuatro Quesos', 'Mozzarella, gorgonzola, parmesano y fontina', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - PASTAS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000230', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000203', 'Spaghetti Carbonara', 'Spaghetti con panceta, huevo, parmesano y pimienta negra', true, NOW(), NOW()),
('clx00000000000000000000231', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000203', 'Penne Arrabbiata', 'Penne con salsa de tomate picante, ajo y perejil', true, NOW(), NOW()),
('clx00000000000000000000232', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000203', 'Fettuccine Alfredo', 'Fettuccine con mantequilla, crema y parmesano', true, NOW(), NOW()),
('clx00000000000000000000233', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000203', 'Lasaña a la Boloñesa', 'Láminas de pasta con carne, bechamel y parmesano gratinado', true, NOW(), NOW()),
('clx00000000000000000000234', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000203', 'Risotto de Hongos Porcini', 'Arroz cremoso con hongos porcini y parmesano', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - PLATOS PRINCIPALES
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000240', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000204', 'Pollo a la Parmesana', 'Pechuga de pollo empanada con salsa de tomate y mozzarella gratinada', true, NOW(), NOW()),
('clx00000000000000000000241', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000204', 'Osso Buco a la Milanesa', 'Rodajas de ternera estofadas con verduras y gremolata', true, NOW(), NOW()),
('clx00000000000000000000242', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000204', 'Salmón a la Parrilla', 'Salmón a la parrilla con limón y hierbas', true, NOW(), NOW()),
('clx00000000000000000000243', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000204', 'Bistec a la Florentina', 'Chuleta de ternera a la parrilla (por kg)', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - POSTRES
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000250', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000205', 'Tiramisú', 'Postre tradicional con café, mascarpone y cacao', true, NOW(), NOW()),
('clx00000000000000000000251', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000205', 'Panna Cotta', 'Crema de vainilla con salsa de frutos rojos', true, NOW(), NOW()),
('clx00000000000000000000252', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000205', 'Cannoli Sicilianos', 'Tubos de masa frita rellenos de ricotta y chocolate', true, NOW(), NOW()),
('clx00000000000000000000253', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000205', 'Helado Artesanal', 'Helado artesanal - Elige entre: Vainilla, Chocolate, Fresa, Pistacho', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - BEBIDAS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000260', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000206', 'Agua Natural / Con Gas', 'Agua mineral natural o con gas', true, NOW(), NOW()),
('clx00000000000000000000261', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000206', 'Vino Tinto de la Casa', 'Vino tinto de la casa (copa / botella)', true, NOW(), NOW()),
('clx00000000000000000000262', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000206', 'Vino Blanco de la Casa', 'Vino blanco de la casa (copa / botella)', true, NOW(), NOW()),
('clx00000000000000000000263', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000206', 'Espresso', 'Café espresso italiano', true, NOW(), NOW()),
('clx00000000000000000000264', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000206', 'Cappuccino', 'Café con leche espumada', true, NOW(), NOW()),
('clx00000000000000000000265', 'clx00000000000000000000001', 'clx00000000000000000000200', 'clx00000000000000000000206', 'Limonada', 'Limonada italiana casera', true, NOW(), NOW());

-- ========================================
-- CREAR PRECIOS EN EUROS (EUR)
-- ========================================
-- ENTRADAS
INSERT INTO "item_prices" ("id", "tenant_id", "item_id", "currency", "label", "amount", "created_at", "updated_at") VALUES
('clx00000000000000000000270', 'clx00000000000000000000001', 'clx00000000000000000000210', 'EUR', 'Porción', 8.50, NOW(), NOW()),
('clx00000000000000000000271', 'clx00000000000000000000001', 'clx00000000000000000000211', 'EUR', 'Porción', 12.00, NOW(), NOW()),
('clx00000000000000000000272', 'clx00000000000000000000001', 'clx00000000000000000000212', 'EUR', 'Porción', 10.00, NOW(), NOW()),
('clx00000000000000000000273', 'clx00000000000000000000001', 'clx00000000000000000000213', 'EUR', 'Porción', 15.00, NOW(), NOW()),

-- PIZZAS
('clx00000000000000000000274', 'clx00000000000000000000001', 'clx00000000000000000000220', 'EUR', 'Margherita', 9.00, NOW(), NOW()),
('clx00000000000000000000275', 'clx00000000000000000000001', 'clx00000000000000000000221', 'EUR', 'Marinara', 7.50, NOW(), NOW()),
('clx00000000000000000000276', 'clx00000000000000000000001', 'clx00000000000000000000222', 'EUR', 'Napolitana', 11.00, NOW(), NOW()),
('clx00000000000000000000277', 'clx00000000000000000000001', 'clx00000000000000000000223', 'EUR', 'Cuatro Estaciones', 13.50, NOW(), NOW()),
('clx00000000000000000000278', 'clx00000000000000000000001', 'clx00000000000000000000224', 'EUR', 'Jamón y Champiñones', 12.00, NOW(), NOW()),
('clx00000000000000000000279', 'clx00000000000000000000001', 'clx00000000000000000000225', 'EUR', 'Diavola', 11.50, NOW(), NOW()),
('clx00000000000000000000280', 'clx00000000000000000000001', 'clx00000000000000000000226', 'EUR', 'Cuatro Quesos', 13.00, NOW(), NOW()),

-- PASTAS
('clx00000000000000000000281', 'clx00000000000000000000001', 'clx00000000000000000000230', 'EUR', 'Porción', 14.00, NOW(), NOW()),
('clx00000000000000000000282', 'clx00000000000000000000001', 'clx00000000000000000000231', 'EUR', 'Porción', 12.50, NOW(), NOW()),
('clx00000000000000000000283', 'clx00000000000000000000001', 'clx00000000000000000000232', 'EUR', 'Porción', 13.00, NOW(), NOW()),
('clx00000000000000000000284', 'clx00000000000000000000001', 'clx00000000000000000000233', 'EUR', 'Porción', 15.50, NOW(), NOW()),
('clx00000000000000000000285', 'clx00000000000000000000001', 'clx00000000000000000000234', 'EUR', 'Porción', 16.00, NOW(), NOW()),

-- PLATOS PRINCIPALES
('clx00000000000000000000286', 'clx00000000000000000000001', 'clx00000000000000000000240', 'EUR', 'Porción', 18.00, NOW(), NOW()),
('clx00000000000000000000287', 'clx00000000000000000000001', 'clx00000000000000000000241', 'EUR', 'Porción', 22.00, NOW(), NOW()),
('clx00000000000000000000288', 'clx00000000000000000000001', 'clx00000000000000000000242', 'EUR', 'Porción', 20.00, NOW(), NOW()),
('clx00000000000000000000289', 'clx00000000000000000000001', 'clx00000000000000000000243', 'EUR', 'Por kg', 45.00, NOW(), NOW()),

-- POSTRES
('clx00000000000000000000290', 'clx00000000000000000000001', 'clx00000000000000000000250', 'EUR', 'Porción', 7.00, NOW(), NOW()),
('clx00000000000000000000291', 'clx00000000000000000000001', 'clx00000000000000000000251', 'EUR', 'Porción', 6.50, NOW(), NOW()),
('clx00000000000000000000292', 'clx00000000000000000000001', 'clx00000000000000000000252', 'EUR', '2 unidades', 8.00, NOW(), NOW()),
('clx00000000000000000000293', 'clx00000000000000000000001', 'clx00000000000000000000253', 'EUR', '1 bola', 4.50, NOW(), NOW()),
('clx00000000000000000000294', 'clx00000000000000000000001', 'clx00000000000000000000253', 'EUR', '2 bolas', 7.50, NOW(), NOW()),
('clx00000000000000000000295', 'clx00000000000000000000001', 'clx00000000000000000000253', 'EUR', '3 bolas', 10.00, NOW(), NOW()),

-- BEBIDAS
('clx00000000000000000000296', 'clx00000000000000000000001', 'clx00000000000000000000260', 'EUR', '500ml', 2.50, NOW(), NOW()),
('clx00000000000000000000297', 'clx00000000000000000000001', 'clx00000000000000000000261', 'EUR', 'Copa', 5.00, NOW(), NOW()),
('clx00000000000000000000298', 'clx00000000000000000000001', 'clx00000000000000000000261', 'EUR', 'Botella', 18.00, NOW(), NOW()),
('clx00000000000000000000299', 'clx00000000000000000000001', 'clx00000000000000000000262', 'EUR', 'Copa', 5.00, NOW(), NOW()),
('clx00000000000000000000300', 'clx00000000000000000000001', 'clx00000000000000000000262', 'EUR', 'Botella', 18.00, NOW(), NOW()),
('clx00000000000000000000301', 'clx00000000000000000000001', 'clx00000000000000000000263', 'EUR', 'Taza', 1.50, NOW(), NOW()),
('clx00000000000000000000302', 'clx00000000000000000000001', 'clx00000000000000000000264', 'EUR', 'Taza', 2.50, NOW(), NOW()),
('clx00000000000000000000303', 'clx00000000000000000000001', 'clx00000000000000000000265', 'EUR', 'Vaso', 4.00, NOW(), NOW());

