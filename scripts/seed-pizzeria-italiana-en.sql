-- ========================================
-- MenuQR - Sample Menu: Italian Pizzeria (ENGLISH)
-- ========================================
-- This script creates a complete menu for an Italian pizzeria
-- with 6 sections and typical Italian products with prices in EUR
-- ALL IN ENGLISH
-- 
-- IMPORTANT: Before running this script, you need:
-- 1. Have a valid tenant_id (replace 'clx00000000000000000000001' with the real ID)
-- 2. Have a valid restaurant_id (replace 'clx1766554478071cugyok9nx' with the real ID)
-- ========================================

-- ========================================
-- CREATE MAIN MENU
-- ========================================
INSERT INTO "menus" ("id", "tenant_id", "restaurant_id", "name", "slug", "description", "status", "template", "is_active", "version", "created_at", "updated_at")
VALUES (
    'clx00000000000000000000300',
    'clx00000000000000000000001',
    'clx1766554478071cugyok9nx',
    'Italian Pizzeria Menu',
    'menu-pizzeria-italiana-en',
    'Authentic Italian cuisine with the best pizzas, pastas and house specialties',
    'PUBLISHED',
    'italianfood',
    true,
    1,
    NOW(),
    NOW()
);

-- ========================================
-- CREATE 6 MENU SECTIONS (ENGLISH)
-- ========================================
INSERT INTO "menu_sections" ("id", "tenant_id", "menu_id", "name", "sort", "is_active", "created_at", "updated_at") VALUES
-- 1. Appetizers
('clx00000000000000000000301', 'clx00000000000000000000001', 'clx00000000000000000000300', 'Appetizers', 1, true, NOW(), NOW()),

-- 2. Pizzas
('clx00000000000000000000302', 'clx00000000000000000000001', 'clx00000000000000000000300', 'Pizzas', 2, true, NOW(), NOW()),

-- 3. Pastas
('clx00000000000000000000303', 'clx00000000000000000000001', 'clx00000000000000000000300', 'Pastas', 3, true, NOW(), NOW()),

-- 4. Main Courses
('clx00000000000000000000304', 'clx00000000000000000000001', 'clx00000000000000000000300', 'Main Courses', 4, true, NOW(), NOW()),

-- 5. Desserts
('clx00000000000000000000305', 'clx00000000000000000000001', 'clx00000000000000000000300', 'Desserts', 5, true, NOW(), NOW()),

-- 6. Beverages
('clx00000000000000000000306', 'clx00000000000000000000001', 'clx00000000000000000000300', 'Beverages', 6, true, NOW(), NOW());

-- ========================================
-- CREATE PRODUCTS - APPETIZERS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000310', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000301', 'Tomato Bruschetta', 'Toasted bread with fresh tomato, garlic, basil and extra virgin olive oil', true, NOW(), NOW()),
('clx00000000000000000000311', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000301', 'Caprese', 'Buffalo mozzarella, cherry tomatoes, fresh basil and olive oil', true, NOW(), NOW()),
('clx00000000000000000000312', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000301', 'Prosciutto and Melon', 'Parma ham with cantaloupe melon', true, NOW(), NOW()),
('clx00000000000000000000313', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000301', 'Mixed Antipasto', 'Selection of Italian cured meats, cheeses and pickled vegetables', true, NOW(), NOW());

-- ========================================
-- CREATE PRODUCTS - PIZZAS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000320', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000302', 'Margherita', 'Tomato sauce, fresh mozzarella and basil', true, NOW(), NOW()),
('clx00000000000000000000321', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000302', 'Marinara', 'Tomato sauce, garlic, oregano and olive oil', true, NOW(), NOW()),
('clx00000000000000000000322', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000302', 'Napoli', 'Tomato sauce, mozzarella, anchovies, capers and olives', true, NOW(), NOW()),
('clx00000000000000000000323', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000302', 'Four Seasons', 'Tomato sauce, mozzarella, ham, mushrooms, artichokes and olives', true, NOW(), NOW()),
('clx00000000000000000000324', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000302', 'Prosciutto and Mushrooms', 'Tomato sauce, mozzarella, Parma ham and mushrooms', true, NOW(), NOW()),
('clx00000000000000000000325', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000302', 'Diavola', 'Tomato sauce, mozzarella, spicy salami and olives', true, NOW(), NOW()),
('clx00000000000000000000326', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000302', 'Four Cheeses', 'Mozzarella, gorgonzola, parmesan and fontina', true, NOW(), NOW());

-- ========================================
-- CREATE PRODUCTS - PASTAS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000330', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000303', 'Spaghetti Carbonara', 'Spaghetti with pancetta, egg, parmesan and black pepper', true, NOW(), NOW()),
('clx00000000000000000000331', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000303', 'Penne Arrabbiata', 'Penne with spicy tomato sauce, garlic and parsley', true, NOW(), NOW()),
('clx00000000000000000000332', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000303', 'Fettuccine Alfredo', 'Fettuccine with butter, cream and parmesan', true, NOW(), NOW()),
('clx00000000000000000000333', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000303', 'Lasagna Bolognese', 'Pasta sheets with meat, béchamel and grated parmesan', true, NOW(), NOW()),
('clx00000000000000000000334', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000303', 'Porcini Mushroom Risotto', 'Creamy rice with porcini mushrooms and parmesan', true, NOW(), NOW());

-- ========================================
-- CREATE PRODUCTS - MAIN COURSES
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000340', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000304', 'Chicken Parmesan', 'Breaded chicken breast with tomato sauce and melted mozzarella', true, NOW(), NOW()),
('clx00000000000000000000341', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000304', 'Osso Buco Milanese', 'Braised veal shanks with vegetables and gremolata', true, NOW(), NOW()),
('clx00000000000000000000342', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000304', 'Grilled Salmon', 'Grilled salmon with lemon and herbs', true, NOW(), NOW()),
('clx00000000000000000000343', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000304', 'Florentine Steak', 'Grilled T-bone steak (per kg)', true, NOW(), NOW());

-- ========================================
-- CREATE PRODUCTS - DESSERTS
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000350', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000305', 'Tiramisu', 'Traditional dessert with coffee, mascarpone and cocoa', true, NOW(), NOW()),
('clx00000000000000000000351', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000305', 'Panna Cotta', 'Vanilla cream with berry sauce', true, NOW(), NOW()),
('clx00000000000000000000352', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000305', 'Sicilian Cannoli', 'Fried pastry tubes filled with ricotta and chocolate', true, NOW(), NOW()),
('clx00000000000000000000353', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000305', 'Artisanal Gelato', 'Artisanal ice cream - Choose from: Vanilla, Chocolate, Strawberry, Pistachio', true, NOW(), NOW());

-- ========================================
-- CREATE PRODUCTS - BEVERAGES
-- ========================================
INSERT INTO "menu_items" ("id", "tenant_id", "menu_id", "section_id", "name", "description", "active", "created_at", "updated_at") VALUES
('clx00000000000000000000360', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000306', 'Still / Sparkling Water', 'Mineral water still or sparkling', true, NOW(), NOW()),
('clx00000000000000000000361', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000306', 'House Red Wine', 'House red wine (glass / bottle)', true, NOW(), NOW()),
('clx00000000000000000000362', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000306', 'House White Wine', 'House white wine (glass / bottle)', true, NOW(), NOW()),
('clx00000000000000000000363', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000306', 'Espresso', 'Italian espresso coffee', true, NOW(), NOW()),
('clx00000000000000000000364', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000306', 'Cappuccino', 'Coffee with frothed milk', true, NOW(), NOW()),
('clx00000000000000000000365', 'clx00000000000000000000001', 'clx00000000000000000000300', 'clx00000000000000000000306', 'Lemonade', 'Homemade Italian lemonade', true, NOW(), NOW());

-- ========================================
-- CREATE PRICES IN EUROS (EUR)
-- ========================================
-- APPETIZERS
INSERT INTO "item_prices" ("id", "tenant_id", "item_id", "currency", "label", "amount", "created_at", "updated_at") VALUES
('clx00000000000000000000370', 'clx00000000000000000000001', 'clx00000000000000000000310', 'EUR', 'Portion', 8.50, NOW(), NOW()),
('clx00000000000000000000371', 'clx00000000000000000000001', 'clx00000000000000000000311', 'EUR', 'Portion', 12.00, NOW(), NOW()),
('clx00000000000000000000372', 'clx00000000000000000000001', 'clx00000000000000000000312', 'EUR', 'Portion', 10.00, NOW(), NOW()),
('clx00000000000000000000373', 'clx00000000000000000000001', 'clx00000000000000000000313', 'EUR', 'Portion', 15.00, NOW(), NOW()),

-- PIZZAS
('clx00000000000000000000374', 'clx00000000000000000000001', 'clx00000000000000000000320', 'EUR', 'Margherita', 9.00, NOW(), NOW()),
('clx00000000000000000000375', 'clx00000000000000000000001', 'clx00000000000000000000321', 'EUR', 'Marinara', 7.50, NOW(), NOW()),
('clx00000000000000000000376', 'clx00000000000000000000001', 'clx00000000000000000000322', 'EUR', 'Napoli', 11.00, NOW(), NOW()),
('clx00000000000000000000377', 'clx00000000000000000000001', 'clx00000000000000000000323', 'EUR', 'Four Seasons', 13.50, NOW(), NOW()),
('clx00000000000000000000378', 'clx00000000000000000000001', 'clx00000000000000000000324', 'EUR', 'Prosciutto and Mushrooms', 12.00, NOW(), NOW()),
('clx00000000000000000000379', 'clx00000000000000000000001', 'clx00000000000000000000325', 'EUR', 'Diavola', 11.50, NOW(), NOW()),
('clx00000000000000000000380', 'clx00000000000000000000001', 'clx00000000000000000000326', 'EUR', 'Four Cheeses', 13.00, NOW(), NOW()),

-- PASTAS
('clx00000000000000000000381', 'clx00000000000000000000001', 'clx00000000000000000000330', 'EUR', 'Portion', 14.00, NOW(), NOW()),
('clx00000000000000000000382', 'clx00000000000000000000001', 'clx00000000000000000000331', 'EUR', 'Portion', 12.50, NOW(), NOW()),
('clx00000000000000000000383', 'clx00000000000000000000001', 'clx00000000000000000000332', 'EUR', 'Portion', 13.00, NOW(), NOW()),
('clx00000000000000000000384', 'clx00000000000000000000001', 'clx00000000000000000000333', 'EUR', 'Portion', 15.50, NOW(), NOW()),
('clx00000000000000000000385', 'clx00000000000000000000001', 'clx00000000000000000000334', 'EUR', 'Portion', 16.00, NOW(), NOW()),

-- MAIN COURSES
('clx00000000000000000000386', 'clx00000000000000000000001', 'clx00000000000000000000340', 'EUR', 'Portion', 18.00, NOW(), NOW()),
('clx00000000000000000000387', 'clx00000000000000000000001', 'clx00000000000000000000341', 'EUR', 'Portion', 22.00, NOW(), NOW()),
('clx00000000000000000000388', 'clx00000000000000000000001', 'clx00000000000000000000342', 'EUR', 'Portion', 20.00, NOW(), NOW()),
('clx00000000000000000000389', 'clx00000000000000000000001', 'clx00000000000000000000343', 'EUR', 'Per kg', 45.00, NOW(), NOW()),

-- DESSERTS
('clx00000000000000000000390', 'clx00000000000000000000001', 'clx00000000000000000000350', 'EUR', 'Portion', 7.00, NOW(), NOW()),
('clx00000000000000000000391', 'clx00000000000000000000001', 'clx00000000000000000000351', 'EUR', 'Portion', 6.50, NOW(), NOW()),
('clx00000000000000000000392', 'clx00000000000000000000001', 'clx00000000000000000000352', 'EUR', '2 pieces', 8.00, NOW(), NOW()),
('clx00000000000000000000393', 'clx00000000000000000000001', 'clx00000000000000000000353', 'EUR', '1 scoop', 4.50, NOW(), NOW()),
('clx00000000000000000000394', 'clx00000000000000000000001', 'clx00000000000000000000353', 'EUR', '2 scoops', 7.50, NOW(), NOW()),
('clx00000000000000000000395', 'clx00000000000000000000001', 'clx00000000000000000000353', 'EUR', '3 scoops', 10.00, NOW(), NOW()),

-- BEVERAGES
('clx00000000000000000000396', 'clx00000000000000000000001', 'clx00000000000000000000360', 'EUR', '500ml', 2.50, NOW(), NOW()),
('clx00000000000000000000397', 'clx00000000000000000000001', 'clx00000000000000000000361', 'EUR', 'Glass', 5.00, NOW(), NOW()),
('clx00000000000000000000398', 'clx00000000000000000000001', 'clx00000000000000000000361', 'EUR', 'Bottle', 18.00, NOW(), NOW()),
('clx00000000000000000000399', 'clx00000000000000000000001', 'clx00000000000000000000362', 'EUR', 'Glass', 5.00, NOW(), NOW()),
('clx00000000000000000000400', 'clx00000000000000000000001', 'clx00000000000000000000362', 'EUR', 'Bottle', 18.00, NOW(), NOW()),
('clx00000000000000000000401', 'clx00000000000000000000001', 'clx00000000000000000000363', 'EUR', 'Cup', 1.50, NOW(), NOW()),
('clx00000000000000000000402', 'clx00000000000000000000001', 'clx00000000000000000000364', 'EUR', 'Cup', 2.50, NOW(), NOW()),
('clx00000000000000000000403', 'clx00000000000000000000001', 'clx00000000000000000000365', 'EUR', 'Glass', 4.00, NOW(), NOW());

