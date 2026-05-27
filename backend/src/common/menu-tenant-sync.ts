import { NotFoundException } from '@nestjs/common';
import { PostgresService } from './database/postgres.service';

/**
 * Tras transferir un restaurante, menú/secciones/productos deben compartir el tenant del restaurante.
 * Estas utilidades permiten acceso por restaurant.tenant_id y reparan desincronización residual.
 */
export async function syncMenuHierarchyTenant(
  postgres: PostgresService,
  menuId: string,
  tenantId: string,
): Promise<void> {
  await postgres.executeRaw(
    `UPDATE menus SET tenant_id = $1, updated_at = NOW()
     WHERE id = $2 AND deleted_at IS NULL`,
    [tenantId, menuId],
  );
  await postgres.executeRaw(
    `UPDATE menu_sections SET tenant_id = $1, updated_at = NOW()
     WHERE menu_id = $2 AND deleted_at IS NULL`,
    [tenantId, menuId],
  );
  await postgres.executeRaw(
    `UPDATE menu_items SET tenant_id = $1, updated_at = NOW()
     WHERE menu_id = $2 AND deleted_at IS NULL`,
    [tenantId, menuId],
  );
  await postgres.executeRaw(
    `UPDATE item_prices ip SET tenant_id = $1, updated_at = NOW()
     FROM menu_items mi
     WHERE ip.item_id = mi.id AND mi.menu_id = $2 AND ip.deleted_at IS NULL`,
    [tenantId, menuId],
  );
  await postgres.executeRaw(
    `UPDATE media_assets ma SET tenant_id = $1, updated_at = NOW()
     FROM menu_items mi
     WHERE ma.item_id = mi.id AND mi.menu_id = $2 AND ma.deleted_at IS NULL`,
    [tenantId, menuId],
  );
}

export async function assertMenuAccessible(
  postgres: PostgresService,
  menuId: string,
  tenantId: string,
): Promise<void> {
  const rows = await postgres.queryRaw<{
    menu_tenant: string;
    restaurant_tenant: string | null;
  }>(
    `SELECT m.tenant_id as menu_tenant, r.tenant_id as restaurant_tenant
     FROM menus m
     LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
     WHERE m.id = $1 AND m.deleted_at IS NULL
     LIMIT 1`,
    [menuId],
  );
  const row = rows[0];
  if (!row) {
    throw new NotFoundException('Menú no encontrado o no pertenece al tenant');
  }
  const allowed =
    row.menu_tenant === tenantId ||
    (row.restaurant_tenant != null && row.restaurant_tenant === tenantId);
  if (!allowed) {
    throw new NotFoundException('Menú no encontrado o no pertenece al tenant');
  }
  if (row.menu_tenant !== tenantId) {
    await syncMenuHierarchyTenant(postgres, menuId, tenantId);
  }
}

export async function assertSectionAccessible(
  postgres: PostgresService,
  sectionId: string,
  menuId: string,
  tenantId: string,
): Promise<void> {
  await assertMenuAccessible(postgres, menuId, tenantId);

  const rows = await postgres.queryRaw<{ section_tenant: string }>(
    `SELECT ms.tenant_id as section_tenant
     FROM menu_sections ms
     WHERE ms.id = $1 AND ms.menu_id = $2 AND ms.deleted_at IS NULL
     LIMIT 1`,
    [sectionId, menuId],
  );
  if (!rows[0]) {
    throw new NotFoundException('Sección no encontrada o no pertenece al menú');
  }
  if (rows[0].section_tenant !== tenantId) {
    await postgres.executeRaw(
      `UPDATE menu_sections SET tenant_id = $1, updated_at = NOW()
       WHERE id = $2 AND menu_id = $3 AND deleted_at IS NULL`,
      [tenantId, sectionId, menuId],
    );
  }
}

export async function syncRestaurantMenuHierarchyTenant(
  postgres: PostgresService,
  restaurantId: string,
  tenantId: string,
): Promise<void> {
  const menuRows = await postgres.queryRaw<{ id: string }>(
    `SELECT id FROM menus WHERE restaurant_id = $1 AND deleted_at IS NULL`,
    [restaurantId],
  );
  for (const { id } of menuRows) {
    await syncMenuHierarchyTenant(postgres, id, tenantId);
  }
}
