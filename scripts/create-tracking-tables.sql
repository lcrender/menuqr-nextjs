-- Tabla para tracking de vistas de menús
CREATE TABLE IF NOT EXISTS "menu_views" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "restaurant_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referer" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "menu_views_pkey" PRIMARY KEY ("id")
);

-- Tabla para tracking de escaneos de QR
CREATE TABLE IF NOT EXISTS "qr_scans" (
    "id" TEXT NOT NULL,
    "qr_code_id" TEXT,
    "menu_id" TEXT NOT NULL,
    "restaurant_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "qr_scans_pkey" PRIMARY KEY ("id")
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS "menu_views_menu_id_idx" ON "menu_views"("menu_id");
CREATE INDEX IF NOT EXISTS "menu_views_restaurant_id_idx" ON "menu_views"("restaurant_id");
CREATE INDEX IF NOT EXISTS "menu_views_tenant_id_idx" ON "menu_views"("tenant_id");
CREATE INDEX IF NOT EXISTS "menu_views_viewed_at_idx" ON "menu_views"("viewed_at");

CREATE INDEX IF NOT EXISTS "qr_scans_qr_code_id_idx" ON "qr_scans"("qr_code_id");
CREATE INDEX IF NOT EXISTS "qr_scans_menu_id_idx" ON "qr_scans"("menu_id");
CREATE INDEX IF NOT EXISTS "qr_scans_restaurant_id_idx" ON "qr_scans"("restaurant_id");
CREATE INDEX IF NOT EXISTS "qr_scans_tenant_id_idx" ON "qr_scans"("tenant_id");
CREATE INDEX IF NOT EXISTS "qr_scans_scanned_at_idx" ON "qr_scans"("scanned_at");

-- Foreign keys
ALTER TABLE "menu_views" ADD CONSTRAINT "menu_views_menu_id_fkey" 
    FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_views" ADD CONSTRAINT "menu_views_restaurant_id_fkey" 
    FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "menu_views" ADD CONSTRAINT "menu_views_tenant_id_fkey" 
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_qr_code_id_fkey" 
    FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_menu_id_fkey" 
    FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_restaurant_id_fkey" 
    FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_tenant_id_fkey" 
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;



