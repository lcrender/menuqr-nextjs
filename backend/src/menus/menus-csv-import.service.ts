import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { PostgresService } from '../common/database/postgres.service';
import { MenusService } from './menus.service';
import { MenuSectionsService } from '../menu-sections/menu-sections.service';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';

function normHeader(k: string): string {
  return String(k || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function trimCell(v: unknown): string {
  return String(v ?? '').trim();
}

const HEADER_SYNONYMS: Record<string, string> = {
  nombre_restaurante: 'nombre_restaurante',
  restaurante: 'nombre_restaurante',
  nombre_menu: 'nombre_menu',
  menu: 'nombre_menu',
  descripcion_menu: 'descripcion_menu',
  descripcion_del_menu: 'descripcion_menu',
  nombre_seccion: 'nombre_seccion',
  seccion: 'nombre_seccion',
  orden_seccion: 'orden_seccion',
  orden_de_seccion: 'orden_seccion',
  nombre_producto: 'nombre_producto',
  producto: 'nombre_producto',
  descripcion_producto: 'descripcion_producto',
  destacado: 'destacado',
  alergenos: 'alergenos',
  alergeno: 'alergenos',
  moneda_1: 'moneda_1',
  etiqueta_1: 'etiqueta_1',
  precio_1: 'precio_1',
  moneda_2: 'moneda_2',
  etiqueta_2: 'etiqueta_2',
  precio_2: 'precio_2',
  moneda_3: 'moneda_3',
  etiqueta_3: 'etiqueta_3',
  precio_3: 'precio_3',
  moneda_4: 'moneda_4',
  etiqueta_4: 'etiqueta_4',
  precio_4: 'precio_4',
  moneda_5: 'moneda_5',
  etiqueta_5: 'etiqueta_5',
  precio_5: 'precio_5',
};

function canonRow(raw: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const nk = normHeader(k);
    const key = HEADER_SYNONYMS[nk] ?? nk;
    out[key] = trimCell(v);
  }
  return out;
}

function parseDestacado(v: string): boolean {
  const t = v.toLowerCase();
  return t === 'si' || t === 'sí' || t === 'yes' || t === 'true' || t === '1' || t === 's';
}

function parseAmount(raw: string): number {
  const t = raw.replace(/\s/g, '').replace(',', '.');
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) {
    throw new BadRequestException(`Precio inválido (debe ser > 0): "${raw}"`);
  }
  return n;
}

@Injectable()
export class MenusCsvImportService {
  private readonly logger = new Logger(MenusCsvImportService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly menus: MenusService,
    private readonly menuSections: MenuSectionsService,
    private readonly menuItems: MenuItemsService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  private async loadIconCodesLowerMap(): Promise<Map<string, string>> {
    const rows = await this.postgres.queryRaw<{ code: string }>(
      `SELECT code FROM icons WHERE is_active = true`,
    );
    const m = new Map<string, string>();
    for (const r of rows) {
      m.set(r.code.toLowerCase(), r.code);
    }
    return m;
  }

  private resolveAlergenos(raw: string, iconByLower: Map<string, string>, warnings: string[]): string[] {
    if (!raw) return [];
    const parts = raw.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
    const codes: string[] = [];
    for (const p of parts) {
      const canon = iconByLower.get(p.toLowerCase());
      if (canon) {
        codes.push(canon);
      } else {
        warnings.push(
          `Alérgeno/icono desconocido ignorado: "${p}". Usá el código exacto del sistema (mayúsculas o minúsculas).`,
        );
      }
    }
    return [...new Set(codes)];
  }

  private buildPrices(row: Record<string, string>): Array<{ currency: string; label?: string; amount: number }> {
    const prices: Array<{ currency: string; label?: string; amount: number }> = [];
    for (let i = 1; i <= 5; i++) {
      const cur = row[`moneda_${i}`];
      const label = row[`etiqueta_${i}`];
      const priceStr = row[`precio_${i}`];
      if (!priceStr) continue;
      if (!cur) {
        throw new BadRequestException(`Si completás precio_${i}, debés indicar moneda_${i}`);
      }
      prices.push({
        currency: cur.toUpperCase(),
        label: label || undefined,
        amount: parseAmount(priceStr),
      });
    }
    return prices;
  }

  private async rollbackMenuImport(menuId: string, tenantId: string) {
    await this.postgres.executeRaw(
      `UPDATE menu_items SET deleted_at = NOW(), updated_at = NOW()
       WHERE menu_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [menuId, tenantId],
    );
    await this.postgres.executeRaw(
      `UPDATE menu_sections SET deleted_at = NOW(), updated_at = NOW()
       WHERE menu_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [menuId, tenantId],
    );
    await this.postgres.executeRaw(
      `UPDATE menus SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [menuId, tenantId],
    );
  }

  async importFromCsvBuffer(
    tenantId: string,
    targetRestaurantId: string,
    buffer: Buffer,
    menuFromForm?: { menuName: string; menuDescription?: string },
  ): Promise<{ menuId: string; sectionsCreated: number; productsCreated: number; warnings: string[] }> {
    const warnings: string[] = [];
    let records: Record<string, unknown>[];
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
      }) as Record<string, unknown>[];
    } catch (e: any) {
      throw new BadRequestException(`CSV inválido: ${e?.message || e}`);
    }
    if (!records.length) {
      throw new BadRequestException('El CSV no tiene filas de datos');
    }

    const restaurant = await this.postgres.queryRaw<{ id: string; name: string }>(
      `SELECT id, name FROM restaurants WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL LIMIT 1`,
      [targetRestaurantId, tenantId],
    );
    if (!restaurant[0]) {
      throw new BadRequestException('Restaurante no encontrado o no pertenece a tu cuenta');
    }
    const targetNameNorm = restaurant[0].name.trim().toLowerCase();

    const rows = records.map((r) => canonRow(r));

    const formMenuName = menuFromForm?.menuName?.trim();
    const useFormMenu = Boolean(formMenuName);

    const requiredCols = useFormMenu
      ? (['nombre_seccion', 'nombre_producto'] as const)
      : (['nombre_restaurante', 'nombre_menu', 'nombre_seccion', 'nombre_producto'] as const);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      for (const k of requiredCols) {
        if (!row[k]) {
          throw new BadRequestException(`Fila ${i + 2}: falta la columna "${k}"`);
        }
      }
    }

    let menuName: string;
    let menuDescription: string;

    if (useFormMenu) {
      menuName = formMenuName!;
      menuDescription = (menuFromForm!.menuDescription ?? '').trim();
      for (const row of rows) {
        if (row.nombre_restaurante?.trim()) {
          if (row.nombre_restaurante.trim().toLowerCase() !== targetNameNorm) {
            throw new BadRequestException(
              `nombre_restaurante "${row.nombre_restaurante}" no coincide con el restaurante destino "${restaurant[0].name}". Quitá esa columna del CSV o elegí el restaurante correcto en la pantalla de importación.`,
            );
          }
        }
      }
    } else {
      const menuNames = new Set(rows.map((r) => r.nombre_menu));
      if (menuNames.size !== 1) {
        throw new BadRequestException(
          'El CSV debe definir un solo menú: todas las filas deben repetir el mismo "nombre_menu", o enviá menuName en el formulario de importación.',
        );
      }
      menuName = [...menuNames][0]!;
      menuDescription = rows[0]!.descripcion_menu || '';

      for (const row of rows) {
        if (row.nombre_menu !== menuName) {
          throw new BadRequestException('Todas las filas deben tener el mismo nombre_menu');
        }
        if (row.nombre_restaurante.trim().toLowerCase() !== targetNameNorm) {
          throw new BadRequestException(
            `nombre_restaurante "${row.nombre_restaurante}" no coincide con el restaurante destino "${restaurant[0].name}"`,
          );
        }
      }
    }

    const planRow = await this.postgres.queryRaw<{ plan: string }>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId],
    );
    const plan = planRow[0]?.plan || 'free';
    const menuLimit = await this.planLimits.getMenuLimit(plan);
    const productLimit = await this.planLimits.getProductLimit(plan);
    const allowHighlight = await this.planLimits.allowsProductHighlight(plan);

    const menuCount = await this.postgres.queryRaw<{ c: string }>(
      `SELECT COUNT(*)::text as c FROM menus WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId],
    );
    const currentMenus = parseInt(menuCount[0]?.c || '0', 10);
    if (menuLimit !== -1 && currentMenus >= menuLimit) {
      throw new BadRequestException(
        `Límite de menús alcanzado (${menuLimit}). No se puede importar un menú nuevo.`,
      );
    }

    const productCount = await this.postgres.queryRaw<{ c: string }>(
      `SELECT COUNT(*)::text as c FROM menu_items WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId],
    );
    const currentProducts = parseInt(productCount[0]?.c || '0', 10);
    if (productLimit !== -1 && currentProducts + rows.length > productLimit) {
      throw new BadRequestException(
        `Este import agregaría ${rows.length} productos y superaría el límite del plan (${productLimit}). Actualmente hay ${currentProducts}.`,
      );
    }

    const iconByLower = await this.loadIconCodesLowerMap();

    /** Orden de secciones = orden de primera aparición de cada nombre en el CSV (repetir nombre_seccion en cada fila del mismo bloque). */
    const normalizeSectionName = (raw: string) => String(raw ?? '').trim();
    const sectionNamesInOrder: string[] = [];
    const sectionSortByName = new Map<string, number>();
    for (const row of rows) {
      const name = normalizeSectionName(row.nombre_seccion);
      if (!name) {
        throw new BadRequestException('nombre_seccion vacío en una o más filas');
      }
      if (!sectionSortByName.has(name)) {
        sectionSortByName.set(name, sectionNamesInOrder.length + 1);
        sectionNamesInOrder.push(name);
      }
    }

    let menuId: string | null = null;
    try {
      const created = await this.menus.create(tenantId, {
        restaurantId: targetRestaurantId,
        name: menuName,
        description: menuDescription || undefined,
      });
      menuId = created.id;

      const sectionIdByName = new Map<string, string>();
      for (const name of sectionNamesInOrder) {
        const sort = sectionSortByName.get(name)!;
        const sec = await this.menuSections.create(tenantId, {
          menuId: menuId!,
          name,
          sort,
          isActive: true,
        });
        sectionIdByName.set(name, sec.id);
      }

      let productsCreated = 0;
      for (const row of rows) {
        const secName = normalizeSectionName(row.nombre_seccion);
        const sectionId = sectionIdByName.get(secName);
        if (!sectionId) {
          throw new BadRequestException(`Sección no resuelta: "${secName}"`);
        }

        const prices = this.buildPrices(row);
        if (prices.length === 0) {
          throw new BadRequestException(
            `Producto "${row.nombre_producto}": agregá al menos moneda_1 y precio_1 (> 0).`,
          );
        }

        const iconCodes = this.resolveAlergenos(row.alergenos || '', iconByLower, warnings);
        let highlighted = parseDestacado(row.destacado);
        if (highlighted && !allowHighlight) {
          warnings.push(`Producto "${row.nombre_producto}": destacado desactivado (tu plan no permite destacados).`);
          highlighted = false;
        }

        await this.menuItems.create(tenantId, {
          menuId: menuId!,
          sectionId,
          name: row.nombre_producto,
          description: row.descripcion_producto || undefined,
          active: true,
          prices,
          iconCodes: iconCodes.length ? iconCodes : undefined,
          highlighted,
        });
        productsCreated += 1;
      }

      return {
        menuId: menuId!,
        sectionsCreated: sectionNamesInOrder.length,
        productsCreated,
        warnings,
      };
    } catch (e) {
      this.logger.warn(`Import CSV falló, rollback menú ${menuId}: ${e}`);
      if (menuId) {
        try {
          await this.rollbackMenuImport(menuId, tenantId);
        } catch (rollbackErr) {
          this.logger.error(`Rollback import CSV falló: ${rollbackErr}`);
        }
      }
      throw e;
    }
  }
}
