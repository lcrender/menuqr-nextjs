-- ========================================
-- MenuQR - Menú de Ejemplo: Pizzería Italiana
-- ========================================
-- Este script crea un menú completo para una pizzería italiana
-- con 6 secciones y productos típicos italianos con precios en EUR
-- 
-- IMPORTANTE: Antes de ejecutar este script, necesitas:
-- 1. Tener un tenant_id válido (reemplaza 'clx00000000000000000000001' con el ID real)
-- 2. Tener un restaurant_id válido (reemplaza 'clx1766554478071cugyok9nx' con el ID real)
-- 
-- Para encontrar estos IDs, puedes ejecutar:
-- SELECT id, name FROM tenants;
-- SELECT id, name FROM restaurants;
-- ========================================

-- ========================================
-- VARIABLES (Reemplazar con IDs reales)
-- ========================================
-- Reemplaza estos valores con los IDs reales de tu sistema
-- Ejemplo: 'clx00000000000000000000001' para tenant_id
-- Ejemplo: 'clx00000000000000000000004' para restaurant_id

-- ========================================
-- CREAR MENÚ PRINCIPAL
-- ========================================
INSERT INTO "menus" ("id", "tenant_id", "restaurant_id", "name", "slug", "description", "status", "template", "is_active", "version", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000100',
    'clx00000000000000000000001',  -- ⚠️ REEMPLAZAR con el tenant_id real
    'clx1766554478071cugyok9nx',  -- ⚠️ REEMPLAZAR con el restaurant_id real
    'Menú Pizzería Italiana',
    'menu-pizzeria-italiana',
    'Auténtica cocina italiana con las mejores pizzas, pastas y especialidades de la casa',
    'PUBLISHED',
    'italianfood',
    true,
    1,
    NOW(),
    NOW()
);

-- ========================================
-- CREAR 6 SECCIONES DEL MENÚ
-- ========================================
INSERT INTO "menu_sections" ("id", "tenant_id", "menu_id", "name", "sort", "is_active", "created_at", "updated_at") VALUES
-- 1. Antipasti (Entradas)
('clx00000000000000000000101', 'clx00000000000000000000001', 'clx00000000000000000000100', 'Antipasti', 1, true, NOW(), NOW()),

-- 2. Pizze (Pizzas)
('clx00000000000000000000102', 'clx00000000000000000000001', 'clx00000000000000000000100', 'Pizze', 2, true, NOW(), NOW()),

-- 3. Primi Piatti (Primeros platos - Pastas)
('clx00000000000000000000103', 'clx00000000000000000000001', 'clx00000000000000000000100', 'Primi Piatti', 3, true, NOW(), NOW()),

-- 4. Secondi Piatti (Segundos platos)
('clx00000000000000000000104', 'clx00000000000000000000001', 'clx00000000000000000000100', 'Secondi Piatti', 4, true, NOW(), NOW()),

-- 5. Dolci (Postres)
('clx00000000000000000000105', 'clx00000000000000000000001', 'clx00000000000000000000100', 'Dolci', 5, true, NOW(), NOW()),

-- 6. Bevande (Bebidas)
('clx00000000000000000000106', 'clx00000000000000000000001', 'clx00000000000000000000100', 'Bevande', 6, true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - ANTIPASTI (Entradas)
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000110', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000101', 'Bruschetta al Pomodoro', 'Pan tostado con tomate fresco, ajo, albahaca y aceite de oliva extra virgen', true, NOW(), NOW()),
('clx00000000000000000000111', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000101', 'Caprese', 'Mozzarella di bufala, tomates cherry, albahaca fresca y aceite de oliva', true, NOW(), NOW()),
('clx00000000000000000000112', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000101', 'Prosciutto e Melone', 'Jamón de Parma con melón cantalupo', true, NOW(), NOW()),
('clx00000000000000000000113', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000101', 'Antipasto Misto', 'Selección de embutidos italianos, quesos y verduras encurtidas', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - PIZZE (Pizzas)
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000120', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000102', 'Margherita', 'Salsa de tomate, mozzarella fresca y albahaca', true, NOW(), NOW()),
('clx00000000000000000000121', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000102', 'Marinara', 'Salsa de tomate, ajo, orégano y aceite de oliva', true, NOW(), NOW()),
('clx00000000000000000000122', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000102', 'Napoli', 'Salsa de tomate, mozzarella, anchoas, alcaparras y aceitunas', true, NOW(), NOW()),
('clx00000000000000000000123', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000102', 'Quattro Stagioni', 'Salsa de tomate, mozzarella, jamón, champiñones, alcachofas y aceitunas', true, NOW(), NOW()),
('clx00000000000000000000124', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000102', 'Prosciutto e Funghi', 'Salsa de tomate, mozzarella, jamón de Parma y champiñones', true, NOW(), NOW()),
('clx00000000000000000000125', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000102', 'Diavola', 'Salsa de tomate, mozzarella, salami picante y aceitunas', true, NOW(), NOW()),
('clx00000000000000000000126', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000102', 'Quattro Formaggi', 'Mozzarella, gorgonzola, parmesano y fontina', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - PRIMI PIATTI (Pastas)
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000130', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000103', 'Spaghetti Carbonara', 'Spaghetti con pancetta, huevo, parmesano y pimienta negra', true, NOW(), NOW()),
('clx00000000000000000000131', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000103', 'Penne all''Arrabbiata', 'Penne con salsa de tomate picante, ajo y perejil', true, NOW(), NOW()),
('clx00000000000000000000132', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000103', 'Fettuccine Alfredo', 'Fettuccine con mantequilla, crema y parmesano', true, NOW(), NOW()),
('clx00000000000000000000133', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000103', 'Lasagne alla Bolognese', 'Láminas de pasta con carne, bechamel y parmesano gratinado', true, NOW(), NOW()),
('clx00000000000000000000134', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000103', 'Risotto ai Funghi Porcini', 'Arroz cremoso con hongos porcini y parmesano', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - SECONDI PIATTI (Segundos platos)
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000140', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000104', 'Pollo alla Parmigiana', 'Pechuga de pollo empanada con salsa de tomate y mozzarella gratinada', true, NOW(), NOW()),
('clx00000000000000000000141', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000104', 'Osso Buco alla Milanese', 'Rodajas de ternera estofadas con verduras y gremolata', true, NOW(), NOW()),
('clx00000000000000000000142', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000104', 'Salmone alla Griglia', 'Salmón a la parrilla con limón y hierbas', true, NOW(), NOW()),
('clx00000000000000000000143', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000104', 'Bistecca alla Fiorentina', 'Chuleta de ternera a la parrilla (por kg)', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - DOLCI (Postres)
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000150', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000105', 'Tiramisù', 'Postre tradicional con café, mascarpone y cacao', true, NOW(), NOW()),
('clx00000000000000000000151', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000105', 'Panna Cotta', 'Crema de vainilla con salsa de frutos rojos', true, NOW(), NOW()),
('clx00000000000000000000152', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000105', 'Cannoli Siciliani', 'Tubos de masa frita rellenos de ricotta y chocolate', true, NOW(), NOW()),
('clx00000000000000000000153', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000105', 'Gelato Artigianale', 'Helado artesanal - Elige entre: Vainilla, Chocolate, Fresa, Pistacho', true, NOW(), NOW());

-- ========================================
-- CREAR PRODUCTOS - BEVANDE (Bebidas)
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000160', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000106', 'Acqua Naturale / Frizzante', 'Agua mineral natural o con gas', true, NOW(), NOW()),
('clx00000000000000000000161', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000106', 'Vino Rosso della Casa', 'Vino tinto de la casa (copa / botella)', true, NOW(), NOW()),
('clx00000000000000000000162', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000106', 'Vino Bianco della Casa', 'Vino blanco de la casa (copa / botella)', true, NOW(), NOW()),
('clx00000000000000000000163', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000106', 'Espresso', 'Café espresso italiano', true, NOW(), NOW()),
('clx00000000000000000000164', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000106', 'Cappuccino', 'Café con leche espumada', true, NOW(), NOW()),
('clx00000000000000000000165', 'clx00000000000000000000001', 'clx00000000000000000000100', 'clx00000000000000000000106', 'Limonata', 'Limonada italiana casera', true, NOW(), NOW());

-- ========================================
-- CREAR PRECIOS EN EUROS (EUR)
-- ========================================
-- ANTIPASTI
INSERT INTO "item_prices" ("id", "tenant_id", "item_id", "currency", "label", "amount", "created_at", "updated_at") VALUES
('clx00000000000000000000170', 'clx00000000000000000000001', 'clx00000000000000000000110', 'EUR', 'Porción', 8.50, NOW(), NOW()),
('clx00000000000000000000171', 'clx00000000000000000000001', 'clx00000000000000000000111', 'EUR', 'Porción', 12.00, NOW(), NOW()),
('clx00000000000000000000172', 'clx00000000000000000000001', 'clx00000000000000000000112', 'EUR', 'Porción', 10.00, NOW(), NOW()),
('clx00000000000000000000173', 'clx00000000000000000000001', 'clx00000000000000000000113', 'EUR', 'Porción', 15.00, NOW(), NOW()),

-- PIZZE
('clx00000000000000000000174', 'clx00000000000000000000001', 'clx00000000000000000000120', 'EUR', 'Margherita', 9.00, NOW(), NOW()),
('clx00000000000000000000175', 'clx00000000000000000000001', 'clx00000000000000000000121', 'EUR', 'Marinara', 7.50, NOW(), NOW()),
('clx00000000000000000000176', 'clx00000000000000000000001', 'clx00000000000000000000122', 'EUR', 'Napoli', 11.00, NOW(), NOW()),
('clx00000000000000000000177', 'clx00000000000000000000001', 'clx00000000000000000000123', 'EUR', 'Quattro Stagioni', 13.50, NOW(), NOW()),
('clx00000000000000000000178', 'clx00000000000000000000001', 'clx00000000000000000000124', 'EUR', 'Prosciutto e Funghi', 12.00, NOW(), NOW()),
('clx00000000000000000000179', 'clx00000000000000000000001', 'clx00000000000000000000125', 'EUR', 'Diavola', 11.50, NOW(), NOW()),
('clx00000000000000000000180', 'clx00000000000000000000001', 'clx00000000000000000000126', 'EUR', 'Quattro Formaggi', 13.00, NOW(), NOW()),

-- PRIMI PIATTI
('clx00000000000000000000181', 'clx00000000000000000000001', 'clx00000000000000000000130', 'EUR', 'Porción', 14.00, NOW(), NOW()),
('clx00000000000000000000182', 'clx00000000000000000000001', 'clx00000000000000000000131', 'EUR', 'Porción', 12.50, NOW(), NOW()),
('clx00000000000000000000183', 'clx00000000000000000000001', 'clx00000000000000000000132', 'EUR', 'Porción', 13.00, NOW(), NOW()),
('clx00000000000000000000184', 'clx00000000000000000000001', 'clx00000000000000000000133', 'EUR', 'Porción', 15.50, NOW(), NOW()),
('clx00000000000000000000185', 'clx00000000000000000000001', 'clx00000000000000000000134', 'EUR', 'Porción', 16.00, NOW(), NOW()),

-- SECONDI PIATTI
('clx00000000000000000000186', 'clx00000000000000000000001', 'clx00000000000000000000140', 'EUR', 'Porción', 18.00, NOW(), NOW()),
('clx00000000000000000000187', 'clx00000000000000000000001', 'clx00000000000000000000141', 'EUR', 'Porción', 22.00, NOW(), NOW()),
('clx00000000000000000000188', 'clx00000000000000000000001', 'clx00000000000000000000142', 'EUR', 'Porción', 20.00, NOW(), NOW()),
('clx00000000000000000000189', 'clx00000000000000000000001', 'clx00000000000000000000143', 'EUR', 'Por kg', 45.00, NOW(), NOW()),

-- DOLCI
('clx00000000000000000000190', 'clx00000000000000000000001', 'clx00000000000000000000150', 'EUR', 'Porción', 7.00, NOW(), NOW()),
('clx00000000000000000000191', 'clx00000000000000000000001', 'clx00000000000000000000151', 'EUR', 'Porción', 6.50, NOW(), NOW()),
('clx00000000000000000000192', 'clx00000000000000000000001', 'clx00000000000000000000152', 'EUR', '2 unidades', 8.00, NOW(), NOW()),
('clx00000000000000000000193', 'clx00000000000000000000001', 'clx00000000000000000000153', 'EUR', '1 bola', 4.50, NOW(), NOW()),
('clx00000000000000000000194', 'clx00000000000000000000001', 'clx00000000000000000000153', 'EUR', '2 bolas', 7.50, NOW(), NOW()),
('clx00000000000000000000195', 'clx00000000000000000000001', 'clx00000000000000000000153', 'EUR', '3 bolas', 10.00, NOW(), NOW()),

-- BEVANDE
('clx00000000000000000000196', 'clx00000000000000000000001', 'clx00000000000000000000160', 'EUR', '500ml', 2.50, NOW(), NOW()),
('clx00000000000000000000197', 'clx00000000000000000000001', 'clx00000000000000000000161', 'EUR', 'Copa', 5.00, NOW(), NOW()),
('clx00000000000000000000198', 'clx00000000000000000000001', 'clx00000000000000000000161', 'EUR', 'Botella', 18.00, NOW(), NOW()),
('clx00000000000000000000199', 'clx00000000000000000000001', 'clx00000000000000000000162', 'EUR', 'Copa', 5.00, NOW(), NOW()),
('clx00000000000000000000200', 'clx00000000000000000000001', 'clx00000000000000000000162', 'EUR', 'Botella', 18.00, NOW(), NOW()),
('clx00000000000000000000201', 'clx00000000000000000000001', 'clx00000000000000000000163', 'EUR', 'Taza', 1.50, NOW(), NOW()),
('clx00000000000000000000202', 'clx00000000000000000000001', 'clx00000000000000000000164', 'EUR', 'Taza', 2.50, NOW(), NOW()),
('clx00000000000000000000203', 'clx00000000000000000000001', 'clx00000000000000000000165', 'EUR', 'Vaso', 4.00, NOW(), NOW());

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- Para verificar que todo se creó correctamente, ejecuta:
-- 
-- SELECT m.name as menu, ms.name as seccion, COUNT(mi.id) as productos
-- FROM menus m
-- JOIN menu_sections ms ON ms.menu_id = m.id
-- LEFT JOIN menu_items mi ON mi.section_id = ms.id
-- WHERE m.id = 'clx00000000000000000000100'
-- GROUP BY m.name, ms.name, ms.sort
-- ORDER BY ms.sort;
--
-- SELECT mi.name, ip.currency, ip.label, ip.amount
-- FROM menu_items mi
-- JOIN item_prices ip ON ip.item_id = mi.id
-- WHERE mi.menu_id = 'clx00000000000000000000100'
-- ORDER BY mi.section_id, mi.name;

