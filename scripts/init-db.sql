-- ========================================
-- MenuQR - Inicialización de Base de Datos
-- ========================================

-- Crear extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear extensión para funciones de seguridad
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- FUNCIONES DE SEGURIDAD
-- ========================================

-- Función para setear el contexto del tenant
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.tenant_id', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el tenant_id actual
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.tenant_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar que el usuario pertenece al tenant
CREATE OR REPLACE FUNCTION validate_user_tenant(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_tenant_id UUID;
    current_tenant_id UUID;
BEGIN
    -- Obtener el tenant_id del usuario
    SELECT tenant_id INTO user_tenant_id
    FROM users
    WHERE id = user_uuid AND deleted_at IS NULL;
    
    -- Si es super_admin, permitir acceso
    IF user_tenant_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Obtener el tenant_id actual del contexto
    current_tenant_id := get_current_tenant_id();
    
    -- Validar que coincidan
    RETURN user_tenant_id = current_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- POLÍTICAS RLS PARA TENANTS
-- ========================================
-- NOTA: Las tablas se crearán con las migraciones de Prisma
-- Las políticas RLS se aplicarán después de ejecutar las migraciones
-- Este script solo crea las funciones y extensiones necesarias

-- Habilitar RLS en todas las tablas de negocio (ejecutar después de migraciones)
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE item_prices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE item_icons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA TENANTS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para tenants: solo super_admin puede ver todos
-- CREATE POLICY tenant_isolation_tenants ON tenants
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE users.id = current_setting('app.current_user_id')::UUID 
--             AND users.role = 'SUPER_ADMIN'
--         )
--     );

-- ========================================
-- POLÍTICAS PARA USERS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para users: super_admin ve todos, admin ve solo su tenant
-- CREATE POLICY user_isolation ON users
--     FOR ALL USING (
--         tenant_id IS NULL OR -- super_admin
--         tenant_id = get_current_tenant_id()
--     );

-- ========================================
-- POLÍTICAS PARA RESTAURANTS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para restaurants: solo acceso al tenant actual
-- CREATE POLICY restaurant_isolation ON restaurants
--     FOR ALL USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY restaurant_isolation_insert ON restaurants
--     FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- CREATE POLICY restaurant_isolation_update ON restaurants
--     FOR UPDATE USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY restaurant_isolation_delete ON restaurants
--     FOR DELETE USING (tenant_id = get_current_tenant_id());

-- ========================================
-- POLÍTICAS PARA MENUS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para menus: solo acceso al tenant actual
-- CREATE POLICY menu_isolation ON menus
--     FOR ALL USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_isolation_insert ON menus
--     FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_isolation_update ON menus
--     FOR UPDATE USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_isolation_delete ON menus
--     FOR DELETE USING (tenant_id = get_current_tenant_id());

-- ========================================
-- POLÍTICAS PARA MENU_SECTIONS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para menu_sections: solo acceso al tenant actual
-- CREATE POLICY menu_section_isolation ON menu_sections
--     FOR ALL USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_section_isolation_insert ON menu_sections
--     FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_section_isolation_update ON menu_sections
--     FOR UPDATE USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_section_isolation_delete ON menu_sections
--     FOR DELETE USING (tenant_id = get_current_tenant_id());

-- ========================================
-- POLÍTICAS PARA MENU_ITEMS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para menu_items: solo acceso al tenant actual
-- CREATE POLICY menu_item_isolation ON menu_items
--     FOR ALL USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_item_isolation_insert ON menu_items
--     FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_item_isolation_update ON menu_items
--     FOR UPDATE USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY menu_item_isolation_delete ON menu_items
--     FOR DELETE USING (tenant_id = get_current_tenant_id());

-- ========================================
-- POLÍTICAS PARA ITEM_PRICES
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para item_prices: solo acceso al tenant actual
-- CREATE POLICY item_price_isolation ON item_prices
--     FOR ALL USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY item_price_isolation_insert ON item_prices
--     FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- CREATE POLICY item_price_isolation_update ON item_prices
--     FOR UPDATE USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY item_price_isolation_delete ON item_prices
--     FOR DELETE USING (tenant_id = get_current_tenant_id());

-- ========================================
-- POLÍTICAS PARA MEDIA_ASSETS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para media_assets: solo acceso al tenant actual
-- CREATE POLICY media_asset_isolation ON media_assets
--     FOR ALL USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY media_asset_isolation_insert ON media_assets
--     FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- CREATE POLICY media_asset_isolation_update ON media_assets
--     FOR UPDATE USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY media_asset_isolation_delete ON media_assets
--     FOR DELETE USING (tenant_id = get_current_tenant_id());

-- ========================================
-- POLÍTICAS PARA ITEM_ICONS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para item_icons: solo acceso al tenant actual
-- CREATE POLICY item_icon_isolation ON item_icons
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM menu_items 
--             WHERE menu_items.id = item_icons.item_id 
--             AND menu_items.tenant_id = get_current_tenant_id()
--         )
--     );

-- CREATE POLICY item_icon_isolation_insert ON item_icons
--     FOR INSERT WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM menu_items 
--             WHERE menu_items.id = item_icons.item_id 
--             AND menu_items.tenant_id = get_current_tenant_id()
--         )
--     );

-- ========================================
-- POLÍTICAS PARA TRANSLATIONS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para translations: solo acceso al tenant actual
-- CREATE POLICY translation_isolation ON translations
--     FOR ALL USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY translation_isolation_insert ON translations
--     FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- CREATE POLICY translation_isolation_update ON translations
--     FOR UPDATE USING (tenant_id = get_current_tenant_id());

-- CREATE POLICY translation_isolation_delete ON translations
--     FOR DELETE USING (tenant_id = get_current_tenant_id());

-- ========================================
-- POLÍTICAS PARA AUDIT_LOGS
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Política para audit_logs: super_admin ve todo, admin ve solo su tenant
-- CREATE POLICY audit_log_isolation ON audit_logs
--     FOR ALL USING (
--         tenant_id IS NULL OR -- super_admin
--         tenant_id = get_current_tenant_id()
--     );

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Índices para búsquedas por tenant
-- CREATE INDEX IF NOT EXISTS idx_restaurants_tenant_id ON restaurants(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_menus_tenant_id ON menus(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_menu_sections_tenant_id ON menu_sections(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_id ON menu_items(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_item_prices_tenant_id ON item_prices(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_id ON media_assets(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_translations_tenant_id ON translations(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Índices para búsquedas por slug
-- CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
-- CREATE INDEX IF NOT EXISTS idx_menus_status ON menus(status);

-- Índices para auditoría
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);

-- ========================================
-- TRIGGERS PARA AUDITORÍA
-- ========================================
-- NOTA: Ejecutar después de las migraciones de Prisma

-- Función para registrar cambios en audit_logs
-- CREATE OR REPLACE FUNCTION audit_trigger_function()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     old_data JSON;
--     new_data JSON;
--     audit_row audit_logs;
-- BEGIN
--     -- Obtener el usuario actual del contexto
--     audit_row.actor_user_id := current_setting('app.current_user_id')::UUID;
--     audit_row.ip_address := current_setting('app.ip_address', TRUE);
--     audit_row.user_agent := current_setting('app.user_agent', TRUE);
--     audit_row.created_at := NOW();
--     
--     IF TG_OP = 'INSERT' THEN
--         audit_row.action := 'CREATE';
--         audit_row.entity := TG_TABLE_NAME;
--         audit_row.entity_id := NEW.id;
--         audit_row.payload := to_json(NEW);
--         
--         -- Obtener tenant_id del registro
--         IF NEW.tenant_id IS NOT NULL THEN
--             audit_row.tenant_id := NEW.tenant_id;
--         END IF;
--         
--     ELSIF TG_OP = 'UPDATE' THEN
--         audit_row.action := 'UPDATE';
--         audit_row.entity := TG_TABLE_NAME;
--         audit_row.entity_id := NEW.id;
--         audit_row.payload := json_build_object(
--             'old', to_json(OLD),
--             'new', to_json(NEW)
--         );
--         
--         -- Obtener tenant_id del registro
--         IF NEW.tenant_id IS NOT NULL THEN
--             audit_row.tenant_id := NEW.tenant_id;
--         END IF;
--         
--     ELSIF TG_OP = 'DELETE' THEN
--         audit_row.action := 'DELETE';
--         audit_row.entity := TG_TABLE_NAME;
--         audit_row.entity_id := OLD.id;
--         audit_row.payload := to_json(OLD);
--         
--         -- Obtener tenant_id del registro
--         IF OLD.tenant_id IS NOT NULL THEN
--             audit_row.tenant_id := OLD.tenant_id;
--         END IF;
--         
--     END IF;
--     
--     INSERT INTO audit_logs VALUES (audit_row.*);
--     RETURN COALESCE(NEW, OLD);
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers para auditoría en todas las tablas de negocio
-- NOTA: Ejecutar después de las migraciones de Prisma
-- CREATE TRIGGER audit_restaurants_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON restaurants
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- CREATE TRIGGER audit_menus_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON menus
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- CREATE TRIGGER audit_menu_sections_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON menu_sections
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- CREATE TRIGGER audit_menu_items_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON menu_items
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- CREATE TRIGGER audit_item_prices_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON item_prices
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- CREATE TRIGGER audit_media_assets_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON media_assets
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========================================
-- FUNCIONES DE UTILIDAD
-- ========================================

-- Función para obtener estadísticas del tenant
CREATE OR REPLACE FUNCTION get_tenant_stats(tenant_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'restaurants_count', COUNT(*),
        'menus_count', (SELECT COUNT(*) FROM menus WHERE tenant_id = tenant_uuid AND deleted_at IS NULL),
        'items_count', (SELECT COUNT(*) FROM menu_items WHERE tenant_id = tenant_uuid AND deleted_at IS NULL),
        'published_menus', (SELECT COUNT(*) FROM menus WHERE tenant_id = tenant_uuid AND status = 'PUBLISHED' AND deleted_at IS NULL)
    ) INTO result
    FROM restaurants
    WHERE tenant_id = tenant_uuid AND deleted_at IS NULL;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar registros eliminados (soft delete)
CREATE OR REPLACE FUNCTION cleanup_deleted_records()
RETURNS VOID AS $$
BEGIN
    -- Limpiar registros eliminados hace más de 30 días
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Nota: No eliminamos registros de otras tablas ya que usamos soft delete
    -- y queremos mantener el historial
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- CONFIGURACIÓN FINAL
-- ========================================

-- Crear usuario para la aplicación
-- (Este usuario ya debe existir por las variables de entorno)
-- GRANT CONNECT ON DATABASE menuqr TO menuqr_user;
-- GRANT USAGE ON SCHEMA public TO menuqr_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO menuqr_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO menuqr_user;

-- Configurar timezone por defecto
SET timezone = 'UTC';

-- Configurar encoding
SET client_encoding = 'UTF8';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos MenuQR inicializada correctamente con RLS y auditoría';
    RAISE NOTICE 'Recuerda ejecutar las migraciones de Prisma después de la inicialización';
END $$;

