import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { I18nService } from '../common/i18n/i18n.service';
import { AddMenuLocaleDto } from './dto/add-menu-locale.dto';
import { RenameMenuLocaleDto } from './dto/rename-menu-locale.dto';
import { SaveMenuLocaleWorkbenchDto } from './dto/save-menu-locale-workbench.dto';
import { PatchMenuTranslationSettingsDto } from './dto/patch-menu-translation-settings.dto';

export type ManifestEntry = { locale: string; label?: string; flagCode?: string; enabledPublic?: boolean };

@Injectable()
export class MenuTranslationsService {
  /** Cache: si la columna `menus.translation_manifest` existe en la BD (evita 500 si falta la migración). */
  private translationManifestColumn: boolean | null = null;

  constructor(
    private readonly postgres: PostgresService,
    private readonly i18n: I18nService,
  ) {}

  private async menusHaveTranslationManifestColumn(): Promise<boolean> {
    if (this.translationManifestColumn === true) return true;
    try {
      const rows = await this.postgres.queryRaw<{ n: string }>(
        `SELECT COUNT(*)::text AS n
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'menus'
           AND column_name = 'translation_manifest'`,
      );
      const ok = parseInt(rows[0]?.n || '0', 10) > 0;
      if (ok) this.translationManifestColumn = true;
      return ok;
    } catch {
      return false;
    }
  }

  private manifestMissingMessage() {
    return new BadRequestException(
      'Falta la columna menus.translation_manifest. En el directorio backend ejecutá: npx prisma migrate deploy (o prisma migrate dev).',
    );
  }

  normalizePlan(plan: string | null | undefined): string {
    const raw = (plan || 'free').toString().toLowerCase().trim();
    if (raw === 'proteam' || raw === 'pro__team') return 'pro_team';
    return raw.replace(/\s+/g, '_');
  }

  planAllowsTranslations(plan: string | null | undefined): boolean {
    const p = this.normalizePlan(plan);
    return p === 'pro' || p === 'pro_team' || p === 'premium';
  }

  async getTenantPlan(tenantId: string): Promise<string> {
    const rows = await this.postgres.queryRaw<{ plan: string }>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId],
    );
    return rows[0]?.plan || 'free';
  }

  async resolveTenantIdForRequest(req: any, bodyTenantId?: string): Promise<string> {
    if (req.user?.role === 'SUPER_ADMIN') {
      const tid = (req.query?.tenantId as string) || bodyTenantId;
      if (!tid) {
        throw new BadRequestException('Indicá tenantId (query o body) para operar como super admin.');
      }
      return tid;
    }
    const tid = req.user?.tenantId;
    if (!tid) throw new ForbiddenException();
    return tid;
  }

  async assertTranslationsFeature(req: any, bodyTenantId?: string): Promise<string> {
    const tenantId = await this.resolveTenantIdForRequest(req, bodyTenantId);
    if (req.user?.role === 'SUPER_ADMIN') {
      return tenantId;
    }
    const rows = await this.postgres.queryRaw<{ plan: string }>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId],
    );
    const plan = rows[0]?.plan;
    if (!this.planAllowsTranslations(plan)) {
      throw new ForbiddenException(
        'Las traducciones de menú están disponibles solo en planes Pro, Pro Team y Premium.',
      );
    }
    return tenantId;
  }

  private async assertMenuBelongs(tenantId: string, menuId: string): Promise<any> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT m.*, r.id as "restaurantIdRef"
       FROM menus m
       LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
       WHERE m.id = $1 AND m.tenant_id = $2 AND m.deleted_at IS NULL
       LIMIT 1`,
      [menuId, tenantId],
    );
    if (!rows[0]) throw new NotFoundException('Menú no encontrado');
    return rows[0];
  }

  async listMenusForRestaurant(tenantId: string, restaurantId: string) {
    const hasManifestCol = await this.menusHaveTranslationManifestColumn();
    const menus = await this.postgres.queryRaw<any>(
      hasManifestCol
        ? `SELECT id, name, slug, translation_manifest, restaurant_id, status,
                  COALESCE(auto_translated, false) AS auto_translated
           FROM menus
           WHERE tenant_id = $1 AND restaurant_id = $2 AND deleted_at IS NULL
           ORDER BY sort ASC, created_at DESC`
        : `SELECT id, name, slug, restaurant_id, status,
                  COALESCE(auto_translated, false) AS auto_translated
           FROM menus
           WHERE tenant_id = $1 AND restaurant_id = $2 AND deleted_at IS NULL
           ORDER BY sort ASC, created_at DESC`,
      [tenantId, restaurantId],
    );
    const out = [];
    for (const m of menus) {
      const locales = await this.distinctLocalesForMenu(tenantId, m.id);
      out.push({
        id: m.id,
        name: m.name,
        slug: m.slug,
        status: m.status,
        translationManifest: hasManifestCol ? (m.translation_manifest ?? null) : null,
        autoTranslated: !!m.auto_translated,
        locales,
      });
    }
    return out;
  }

  private async distinctLocalesForMenu(tenantId: string, menuId: string): Promise<string[]> {
    const rows = await this.postgres.queryRaw<{ locale: string }>(
      `SELECT DISTINCT t.locale
       FROM translations t
       WHERE t.tenant_id = $1
         AND (
           (t.entity_type = 'menu' AND t.entity_id = $2)
           OR (t.entity_type = 'menu_section' AND t.entity_id IN (
                SELECT id FROM menu_sections WHERE menu_id = $2 AND deleted_at IS NULL
           ))
           OR (t.entity_type = 'menu_item' AND t.entity_id IN (
                SELECT id FROM menu_items WHERE menu_id = $2 AND deleted_at IS NULL
           ))
         )
       ORDER BY t.locale ASC`,
      [tenantId, menuId],
    );
    const set = new Set(
      rows
        .map((r) => r.locale)
        .filter((l): l is string => typeof l === 'string' && l.trim().length > 0),
    );
    if (!set.has('es-ES')) set.add('es-ES');
    return Array.from(set).sort((a, b) => {
      if (a === 'es-ES') return -1;
      if (b === 'es-ES') return 1;
      return a.localeCompare(b);
    });
  }

  async getWorkbench(tenantId: string, menuId: string, locale: string) {
    await this.assertMenuBelongs(tenantId, menuId);
    const hasManifestCol = await this.menusHaveTranslationManifestColumn();
    const menuRow = await this.postgres.queryRaw<any>(
      hasManifestCol
        ? `SELECT id, name, description, slug, translation_manifest FROM menus WHERE id = $1 LIMIT 1`
        : `SELECT id, name, description, slug FROM menus WHERE id = $1 LIMIT 1`,
      [menuId],
    );
    const m0 = menuRow[0];
    const baseMenu = await this.i18n.getTranslations(tenantId, 'menu', menuId, 'es-ES');
    const curMenu = await this.i18n.getTranslations(tenantId, 'menu', menuId, locale);
    const menuStale = await this.i18n.getStaleKeyMap(tenantId, 'menu', menuId, locale);

    const sections = await this.postgres.queryRaw<any>(
      `SELECT id, name FROM menu_sections WHERE menu_id = $1 AND deleted_at IS NULL ORDER BY sort ASC, created_at ASC`,
      [menuId],
    );
    const sectionRows = await Promise.all(
      sections.map(async (s: any) => {
        const base = await this.i18n.getTranslations(tenantId, 'menu_section', s.id, 'es-ES');
        const cur = await this.i18n.getTranslations(tenantId, 'menu_section', s.id, locale);
        const st = await this.i18n.getStaleKeyMap(tenantId, 'menu_section', s.id, locale);
        return {
          id: s.id,
          baseName: (base.name as string) || s.name,
          name: (cur.name as string) || s.name,
          nameStale: !!st.name,
        };
      }),
    );

    const items = await this.postgres.queryRaw<any>(
      `SELECT id, name, description, section_id FROM menu_items WHERE menu_id = $1 AND deleted_at IS NULL ORDER BY section_id, sort ASC, created_at ASC`,
      [menuId],
    );
    const itemRows = await Promise.all(
      items.map(async (it: any) => {
        const base = await this.i18n.getTranslations(tenantId, 'menu_item', it.id, 'es-ES');
        const cur = await this.i18n.getTranslations(tenantId, 'menu_item', it.id, locale);
        const st = await this.i18n.getStaleKeyMap(tenantId, 'menu_item', it.id, locale);
        return {
          id: it.id,
          sectionId: it.section_id,
          baseName: (base.name as string) || it.name,
          baseDescription: (base.description as string) || it.description || '',
          name: (cur.name as string) || it.name,
          description: (cur.description as string) || it.description || '',
          nameStale: !!st.name,
          descriptionStale: !!st.description,
        };
      }),
    );

    return {
      menu: {
        id: m0.id,
        slug: m0.slug,
        translationManifest: hasManifestCol ? (m0.translation_manifest ?? null) : null,
        baseName: (baseMenu.name as string) || m0.name,
        baseDescription: (baseMenu.description as string) || m0.description || '',
        name: (curMenu.name as string) || m0.name,
        description: (curMenu.description as string) || m0.description || '',
        nameStale: !!menuStale.name,
        descriptionStale: !!menuStale.description,
      },
      sections: sectionRows,
      items: itemRows,
    };
  }

  async saveWorkbench(tenantId: string, menuId: string, locale: string, dto: SaveMenuLocaleWorkbenchDto) {
    if (locale === 'es-ES') {
      throw new BadRequestException('Usá la pantalla de menús para editar el idioma por defecto (es-ES).');
    }
    await this.assertMenuBelongs(tenantId, menuId);

    await this.i18n.saveTranslations(
      tenantId,
      'menu',
      menuId,
      {
        name: dto.menu.name,
        description: dto.menu.description ?? '',
      },
      locale,
    );

    const sectionIds = new Set(
      (
        await this.postgres.queryRaw<{ id: string }>(
          `SELECT id FROM menu_sections WHERE menu_id = $1 AND deleted_at IS NULL`,
          [menuId],
        )
      ).map((r) => r.id),
    );
    for (const s of dto.sections) {
      if (!sectionIds.has(s.id)) {
        throw new BadRequestException(`Sección inválida para este menú: ${s.id}`);
      }
      await this.i18n.saveTranslations(tenantId, 'menu_section', s.id, { name: s.name }, locale);
    }

    const itemIds = new Set(
      (
        await this.postgres.queryRaw<{ id: string }>(
          `SELECT id FROM menu_items WHERE menu_id = $1 AND deleted_at IS NULL`,
          [menuId],
        )
      ).map((r) => r.id),
    );
    for (const it of dto.items) {
      if (!itemIds.has(it.id)) {
        throw new BadRequestException(`Producto inválido para este menú: ${it.id}`);
      }
      await this.i18n.saveTranslations(
        tenantId,
        'menu_item',
        it.id,
        {
          name: it.name,
          description: it.description ?? '',
        },
        locale,
      );
    }

    this.i18n.clearCache(tenantId);
    return { ok: true };
  }

  private parseManifest(raw: unknown): ManifestEntry[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .filter((x) => x && typeof x === 'object' && typeof (x as any).locale === 'string')
        .map((x) => {
          const o = x as Record<string, unknown>;
          const ep = o.enabledPublic;
          const enabledPublic =
            ep === false || ep === 'false' ? false : ep === true || ep === 'true' ? true : undefined;
          return {
            locale: String(o.locale),
            label: typeof o.label === 'string' ? o.label : undefined,
            flagCode: typeof o.flagCode === 'string' ? o.flagCode : undefined,
            ...(enabledPublic !== undefined ? { enabledPublic } : {}),
          } as ManifestEntry;
        });
    }
    return [];
  }

  private async writeManifest(menuId: string, tenantId: string, entries: ManifestEntry[]) {
    if (!(await this.menusHaveTranslationManifestColumn())) {
      throw this.manifestMissingMessage();
    }
    await this.postgres.executeRaw(
      `UPDATE menus SET translation_manifest = $1::jsonb, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL`,
      [JSON.stringify(entries), menuId, tenantId],
    );
  }

  async patchMenuSettings(tenantId: string, menuId: string, dto: PatchMenuTranslationSettingsDto) {
    const menu = await this.assertMenuBelongs(tenantId, menuId);
    if (dto.name !== undefined && dto.name !== null) {
      await this.postgres.executeRaw(
        `UPDATE menus SET name = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`,
        [dto.name, menuId, tenantId],
      );
      await this.i18n.saveTranslations(
        tenantId,
        'menu',
        menuId,
        { name: dto.name, description: (menu.description as string) || '' },
        'es-ES',
      );
    }
    if (dto.translationManifest !== undefined) {
      if (!(await this.menusHaveTranslationManifestColumn())) {
        throw this.manifestMissingMessage();
      }
      const seen = new Set<string>();
      const cleaned = dto.translationManifest
        .filter((e) => e.locale && String(e.locale).trim().length > 0)
        .map((e) => ({ ...e, locale: String(e.locale).trim() }))
        .filter((e) => {
          if (seen.has(e.locale)) return false;
          seen.add(e.locale);
          return true;
        });
      await this.writeManifest(menuId, tenantId, cleaned);
    }
    this.i18n.clearCache(tenantId);
    return { ok: true };
  }

  async addLocale(tenantId: string, menuId: string, dto: AddMenuLocaleDto) {
    if (dto.locale === 'es-ES') {
      throw new BadRequestException('es-ES es el idioma por defecto del menú.');
    }
    await this.assertMenuBelongs(tenantId, menuId);
    const existing = await this.distinctLocalesForMenu(tenantId, menuId);
    if (existing.includes(dto.locale)) {
      throw new BadRequestException('Ese idioma ya está configurado para este menú.');
    }

    const menu = await this.postgres.queryRaw<any>(
      `SELECT id, name, description FROM menus WHERE id = $1 LIMIT 1`,
      [menuId],
    );
    const m = menu[0];
    const esMenu = await this.i18n.getTranslations(tenantId, 'menu', menuId, 'es-ES');
    await this.i18n.saveTranslations(
      tenantId,
      'menu',
      menuId,
      {
        name: (esMenu.name as string) || m.name,
        description: (esMenu.description as string) || m.description || '',
      },
      dto.locale,
    );

    const sections = await this.postgres.queryRaw<any>(
      `SELECT id, name FROM menu_sections WHERE menu_id = $1 AND deleted_at IS NULL`,
      [menuId],
    );
    for (const s of sections) {
      const es = await this.i18n.getTranslations(tenantId, 'menu_section', s.id, 'es-ES');
      await this.i18n.saveTranslations(
        tenantId,
        'menu_section',
        s.id,
        { name: (es.name as string) || s.name },
        dto.locale,
      );
    }

    const items = await this.postgres.queryRaw<any>(
      `SELECT id, name, description FROM menu_items WHERE menu_id = $1 AND deleted_at IS NULL`,
      [menuId],
    );
    for (const it of items) {
      const es = await this.i18n.getTranslations(tenantId, 'menu_item', it.id, 'es-ES');
      await this.i18n.saveTranslations(
        tenantId,
        'menu_item',
        it.id,
        {
          name: (es.name as string) || it.name,
          description: (es.description as string) || it.description || '',
        },
        dto.locale,
      );
    }

    if (await this.menusHaveTranslationManifestColumn()) {
      const manifest = this.parseManifest(
        (await this.postgres.queryRaw<any>(
          `SELECT translation_manifest FROM menus WHERE id = $1 LIMIT 1`,
          [menuId],
        ))[0]?.translation_manifest,
      );
      const next = manifest.filter((e) => e.locale !== dto.locale);
      next.push({
        locale: dto.locale,
        label: dto.label,
        flagCode: dto.flagCode,
        ...(dto.enabledPublic === false ? { enabledPublic: false } : {}),
      });
      await this.writeManifest(menuId, tenantId, next);
    }
    this.i18n.clearCache(tenantId);
    return { ok: true, locales: await this.distinctLocalesForMenu(tenantId, menuId) };
  }

  async renameLocale(tenantId: string, menuId: string, dto: RenameMenuLocaleDto) {
    if (dto.fromLocale === 'es-ES' || dto.toLocale === 'es-ES') {
      throw new BadRequestException('No se puede renombrar hacia o desde es-ES.');
    }
    if (dto.fromLocale === dto.toLocale) {
      throw new BadRequestException('Los locales origen y destino deben ser distintos.');
    }
    await this.assertMenuBelongs(tenantId, menuId);

    const entityIds = await this.collectEntityIdsForMenu(menuId);
    const placeholdersDel = entityIds.map((_, i) => `$${i + 3}`).join(', ');
    await this.postgres.executeRaw(
      `DELETE FROM translations
       WHERE tenant_id = $1 AND locale = $2 AND entity_id IN (${placeholdersDel})`,
      [tenantId, dto.toLocale, ...entityIds],
    );

    const placeholdersUp = entityIds.map((_, i) => `$${i + 4}`).join(', ');
    await this.postgres.executeRaw(
      `UPDATE translations
       SET locale = $1, updated_at = NOW()
       WHERE tenant_id = $2 AND locale = $3 AND entity_id IN (${placeholdersUp})`,
      [dto.toLocale, tenantId, dto.fromLocale, ...entityIds],
    );

    if (await this.menusHaveTranslationManifestColumn()) {
      const manifest = this.parseManifest(
        (await this.postgres.queryRaw<any>(
          `SELECT translation_manifest FROM menus WHERE id = $1 LIMIT 1`,
          [menuId],
        ))[0]?.translation_manifest,
      );
      const next = manifest
        .filter((e) => e.locale !== dto.fromLocale && e.locale !== dto.toLocale)
        .concat([
          {
            locale: dto.toLocale,
            label: dto.label,
            flagCode: dto.flagCode,
            ...(dto.enabledPublic === false ? { enabledPublic: false } : {}),
          },
        ]);
      await this.writeManifest(menuId, tenantId, next);
    }
    this.i18n.clearCache(tenantId);
    return { ok: true, locales: await this.distinctLocalesForMenu(tenantId, menuId) };
  }

  private async collectEntityIdsForMenu(menuId: string): Promise<string[]> {
    const ids: string[] = [menuId];
    const secs = await this.postgres.queryRaw<{ id: string }>(
      `SELECT id FROM menu_sections WHERE menu_id = $1 AND deleted_at IS NULL`,
      [menuId],
    );
    ids.push(...secs.map((s) => s.id));
    const its = await this.postgres.queryRaw<{ id: string }>(
      `SELECT id FROM menu_items WHERE menu_id = $1 AND deleted_at IS NULL`,
      [menuId],
    );
    ids.push(...its.map((i) => i.id));
    return ids;
  }
}
