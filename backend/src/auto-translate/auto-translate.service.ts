import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { PostgresService } from '../common/database/postgres.service';
import { I18nService } from '../common/i18n/i18n.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';

const GLOBAL_SETTING_KEY = 'auto_translate_global_enabled';

/**
 * Google Cloud Translation sigue implementado pero no se usa como proveedor activo
 * hasta activar explícitamente esta constante (p. ej. tras revisión legal/técnica).
 */
const GOOGLE_TRANSLATE_AS_ACTIVE_PROVIDER = false;

const DEFAULT_MICROSOFT_TRANSLATOR_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';

export type AutoTranslateStatusDto = {
  canRun: boolean;
  reason?: string;
  reasonCode?: string;
  monthlyUsed: number;
  monthlyLimit: number;
  menuAutoTranslated: boolean;
  globalEnabled: boolean;
  userEnabled: boolean;
  /** Clave de Google presente en el servidor (informativo; puede estar inactiva). */
  googleConfigured: boolean;
  /** Microsoft Translator (Azure) listo para usarse como backend activo. */
  microsoftTranslatorConfigured: boolean;
  /** Proveedor que usará el backend para traducir (`none` si falta configuración). */
  activeProvider: 'microsoft' | 'google' | 'none';
  planAllows: boolean;
};

export type AutoTranslateAdminSettingsDto = {
  globalEnabled: boolean;
  googleConfigured: boolean;
  microsoftTranslatorConfigured: boolean;
  activeProvider: 'microsoft' | 'google' | 'none';
  googleTranslateProvider: {
    /** Existe integración en el código (siempre true). */
    available: boolean;
    /** Si se usa realmente para traducir (hoy reservado / desactivado). */
    active: boolean;
    /** Hay `GOOGLE_TRANSLATE_API_KEY` definida. */
    configured: boolean;
    disabledReason?: string;
  };
  microsoftTranslator: {
    active: boolean;
    configured: boolean;
  };
};

type TextSegment = {
  entityType: 'menu' | 'menu_section' | 'menu_item';
  entityId: string;
  field: 'name' | 'description';
  text: string;
};

@Injectable()
export class AutoTranslateService {
  private readonly logger = new Logger(AutoTranslateService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  private googleApiKey(): string | undefined {
    const k = this.config.get<string>('GOOGLE_TRANSLATE_API_KEY');
    return k && String(k).trim().length > 0 ? String(k).trim() : undefined;
  }

  isGoogleConfigured(): boolean {
    return !!this.googleApiKey();
  }

  private microsoftTranslatorKey(): string | undefined {
    const k = this.config.get<string>('MICROSOFT_TRANSLATOR_KEY');
    return k && String(k).trim().length > 0 ? String(k).trim() : undefined;
  }

  private microsoftTranslatorRegion(): string | undefined {
    const r = this.config.get<string>('MICROSOFT_TRANSLATOR_REGION');
    return r && String(r).trim().length > 0 ? String(r).trim() : undefined;
  }

  private microsoftTranslatorEndpointBase(): string {
    const e = this.config.get<string>('MICROSOFT_TRANSLATOR_ENDPOINT');
    const raw = e && String(e).trim().length > 0 ? String(e).trim() : DEFAULT_MICROSOFT_TRANSLATOR_ENDPOINT;
    return raw.replace(/\/+$/, '');
  }

  isMicrosoftTranslatorConfigured(): boolean {
    return !!this.microsoftTranslatorKey() && !!this.microsoftTranslatorRegion();
  }

  /** Proveedor efectivo para llamadas a API (Microsoft por defecto; Google solo si se habilita explícitamente). */
  private effectiveTranslateProvider(): 'microsoft' | 'google' | 'none' {
    if (GOOGLE_TRANSLATE_AS_ACTIVE_PROVIDER && this.googleApiKey()) return 'google';
    if (this.isMicrosoftTranslatorConfigured()) return 'microsoft';
    return 'none';
  }

  isTranslateBackendConfigured(): boolean {
    return this.effectiveTranslateProvider() !== 'none';
  }

  getAdminSettingsSnapshot(globalEnabled: boolean): AutoTranslateAdminSettingsDto {
    const googleConfigured = this.isGoogleConfigured();
    const microsoftConfigured = this.isMicrosoftTranslatorConfigured();
    const active = this.effectiveTranslateProvider();
    return {
      globalEnabled,
      googleConfigured,
      microsoftTranslatorConfigured: microsoftConfigured,
      activeProvider: active,
      googleTranslateProvider: {
        available: true,
        active: active === 'google',
        configured: googleConfigured,
        ...(!GOOGLE_TRANSLATE_AS_ACTIVE_PROVIDER
          ? {
              disabledReason:
                'Google Translate está deshabilitado como proveedor. El sistema usa Microsoft Translator (Azure).',
            }
          : {}),
      },
      microsoftTranslator: {
        active: active === 'microsoft',
        configured: microsoftConfigured,
      },
    };
  }

  private toGoogleLang(bcp47: string): string {
    const head = (bcp47 || '').split('-')[0] || 'es';
    return head.toLowerCase();
  }

  /** Códigos de idioma para Microsoft Translator Text API v3.0 (BCP-47 con guiones). */
  private toMicrosoftTranslatorLang(bcp47: string): string {
    const raw = (bcp47 || 'es-ES').trim().replace(/_/g, '-');
    if (!raw) return 'es';
    return raw.toLowerCase();
  }

  private hashText(sourceLocale: string, text: string): string {
    return createHash('sha256').update(`${sourceLocale}\n${text}`, 'utf8').digest('hex');
  }

  async getAppSettingGlobalEnabled(): Promise<boolean> {
    try {
      const rows = await this.postgres.queryRaw<{ value: string }>(
        `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
        [GLOBAL_SETTING_KEY],
      );
      const v = (rows[0]?.value || 'true').toString().trim().toLowerCase();
      return v !== 'false' && v !== '0';
    } catch {
      return true;
    }
  }

  async setAppSettingGlobalEnabled(enabled: boolean): Promise<void> {
    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [GLOBAL_SETTING_KEY, enabled ? 'true' : 'false'],
    );
  }

  /** null = heredar (activo si global); false = bloqueado; true = forzar activo */
  async getUserAutoTranslateEnabled(userId: string): Promise<boolean | null> {
    const rows = await this.postgres.queryRaw<{ auto_translate_enabled: boolean | null }>(
      `SELECT auto_translate_enabled FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [userId],
    );
    if (!rows[0]) return null;
    return rows[0].auto_translate_enabled;
  }

  async setUserAutoTranslateEnabled(userId: string, enabled: boolean | null): Promise<void> {
    await this.postgres.executeRaw(
      `UPDATE users SET auto_translate_enabled = $2, updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [userId, enabled],
    );
  }

  planAllowsAutoTranslateForTenantPlan(plan: string | null | undefined): boolean {
    const p = (plan || 'free').toString().toLowerCase().trim().replace(/\s+/g, '_');
    const n = p === 'proteam' ? 'pro_team' : p;
    return n === 'pro' || n === 'pro_team' || n === 'premium';
  }

  async countMonthlyUsageUtc(userId: string): Promise<number> {
    const rows = await this.postgres.queryRaw<{ n: string }>(
      `SELECT COUNT(*)::text AS n
       FROM auto_translate_usage
       WHERE user_id = $1
         AND created_at >= date_trunc('month', timezone('UTC', now()))
         AND created_at < date_trunc('month', timezone('UTC', now())) + interval '1 month'`,
      [userId],
    );
    return parseInt(rows[0]?.n || '0', 10) || 0;
  }

  private async assertMenuBelongs(tenantId: string, menuId: string): Promise<{ id: string; auto_translated: boolean }> {
    const rows = await this.postgres.queryRaw<{ id: string; auto_translated: boolean }>(
      `SELECT id, COALESCE(auto_translated, false) AS auto_translated
       FROM menus WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL LIMIT 1`,
      [menuId, tenantId],
    );
    if (!rows[0]) throw new NotFoundException('Menú no encontrado');
    return rows[0];
  }

  async getStatus(
    tenantId: string,
    menuId: string,
    userId: string,
    targetLocale: string,
    tenantPlan: string | null | undefined,
  ): Promise<AutoTranslateStatusDto> {
    const googleConfigured = this.isGoogleConfigured();
    const microsoftTranslatorConfigured = this.isMicrosoftTranslatorConfigured();
    const activeProvider = this.effectiveTranslateProvider();
    const globalEnabled = await this.getAppSettingGlobalEnabled();
    const userFlag = await this.getUserAutoTranslateEnabled(userId);
    const userEnabled = userFlag !== false;
    const planAllows = this.planAllowsAutoTranslateForTenantPlan(tenantPlan);
    const monthlyLimit = await this.planLimits.getAutoTranslateMonthlyPerUser(tenantPlan || 'free');
    const monthlyUsed = await this.countMonthlyUsageUtc(userId);
    let menuAutoTranslated = false;
    try {
      const m = await this.assertMenuBelongs(tenantId, menuId);
      menuAutoTranslated = !!m.auto_translated;
    } catch {
      /* not found handled elsewhere */
    }

    let canRun = true;
    let reason: string | undefined;
    let reasonCode: string | undefined;

    if (!this.isTranslateBackendConfigured()) {
      canRun = false;
      reason =
        'Falta configurar Microsoft Translator en el servidor (MICROSOFT_TRANSLATOR_KEY y MICROSOFT_TRANSLATOR_REGION).';
      reasonCode = 'translator_not_configured';
    } else if (!globalEnabled) {
      canRun = false;
      reason = 'La traducción automática está desactivada globalmente.';
      reasonCode = 'global_disabled';
    } else if (!userEnabled) {
      canRun = false;
      reason = 'Tu cuenta no tiene habilitada la traducción automática.';
      reasonCode = 'user_disabled';
    } else if (!planAllows) {
      canRun = false;
      reason = 'Disponible solo en planes Pro, Pro Team o Premium.';
      reasonCode = 'plan_not_allowed';
    } else if (monthlyLimit === 0) {
      canRun = false;
      reason = 'Tu plan no incluye traducción automática (límite 0).';
      reasonCode = 'plan_limit_zero';
    } else if (monthlyLimit > 0 && monthlyUsed >= monthlyLimit) {
      canRun = false;
      reason = `Alcanzaste el límite mensual (${monthlyLimit} usos).`;
      reasonCode = 'monthly_limit';
    } else if (targetLocale === 'es-ES') {
      canRun = false;
      reason = 'Elegí un idioma distinto de es-ES.';
      reasonCode = 'invalid_locale';
    }

    return {
      canRun,
      reason,
      reasonCode,
      monthlyUsed,
      monthlyLimit,
      menuAutoTranslated,
      globalEnabled,
      userEnabled,
      googleConfigured,
      microsoftTranslatorConfigured,
      activeProvider,
      planAllows,
    };
  }

  async assertPreconditionsAndGetMenu(
    tenantId: string,
    menuId: string,
    userId: string,
    targetLocale: string,
    tenantPlan: string | null | undefined,
    force: boolean,
  ) {
    if (!this.isTranslateBackendConfigured()) {
      throw new ServiceUnavailableException(
        'Traducción automática no configurada en el servidor (Microsoft Translator: MICROSOFT_TRANSLATOR_KEY y MICROSOFT_TRANSLATOR_REGION).',
      );
    }
    if (!(await this.getAppSettingGlobalEnabled())) {
      throw new ForbiddenException('La traducción automática está desactivada en el sistema.');
    }
    const uf = await this.getUserAutoTranslateEnabled(userId);
    if (uf === false) {
      throw new ForbiddenException('La traducción automática está desactivada para tu usuario.');
    }
    if (!this.planAllowsAutoTranslateForTenantPlan(tenantPlan)) {
      throw new ForbiddenException('Disponible solo en planes Pro, Pro Team o Premium.');
    }
    const monthlyLimit = await this.planLimits.getAutoTranslateMonthlyPerUser(tenantPlan || 'free');
    if (monthlyLimit === 0) {
      throw new ForbiddenException('Tu plan no incluye traducción automática.');
    }
    const used = await this.countMonthlyUsageUtc(userId);
    if (monthlyLimit > 0 && used >= monthlyLimit) {
      throw new ForbiddenException(`Límite mensual alcanzado (${monthlyLimit} traducciones automáticas).`);
    }
    if (targetLocale === 'es-ES') {
      throw new BadRequestException('No se puede traducir al idioma base.');
    }
    const menu = await this.assertMenuBelongs(tenantId, menuId);
    if (menu.auto_translated && !force) {
      throw new BadRequestException(
        'Este menú ya fue traducido automáticamente. Marcá “Forzar retraducción” para volver a ejecutar (consume un uso).',
      );
    }
    const locales = await this.distinctLocalesForMenu(tenantId, menuId);
    if (!locales.includes(targetLocale)) {
      throw new BadRequestException(
        `El idioma ${targetLocale} no está agregado al menú. Agregalo primero en Traducciones.`,
      );
    }
    return menu;
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
    const set = new Set(rows.map((r) => r.locale).filter(Boolean));
    if (!set.has('es-ES')) set.add('es-ES');
    return Array.from(set);
  }

  private async collectSegments(tenantId: string, menuId: string): Promise<TextSegment[]> {
    const menuRows = await this.postgres.queryRaw<{ id: string; name: string; description: string | null }>(
      `SELECT id, name, description FROM menus WHERE id = $1 LIMIT 1`,
      [menuId],
    );
    const m0 = menuRows[0];
    if (!m0) return [];
    const baseMenu = await this.i18n.getTranslations(tenantId, 'menu', menuId, 'es-ES');
    const name = ((baseMenu.name as string) || m0.name || '').trim();
    const desc = ((baseMenu.description as string) || m0.description || '').trim();
    const out: TextSegment[] = [];
    if (name) out.push({ entityType: 'menu', entityId: menuId, field: 'name', text: name });
    if (desc) out.push({ entityType: 'menu', entityId: menuId, field: 'description', text: desc });

    const sections = await this.postgres.queryRaw<{ id: string; name: string }>(
      `SELECT id, name FROM menu_sections WHERE menu_id = $1 AND deleted_at IS NULL ORDER BY sort ASC, created_at ASC`,
      [menuId],
    );
    for (const s of sections) {
      const base = await this.i18n.getTranslations(tenantId, 'menu_section', s.id, 'es-ES');
      const sn = ((base.name as string) || s.name || '').trim();
      if (sn) out.push({ entityType: 'menu_section', entityId: s.id, field: 'name', text: sn });
    }

    const items = await this.postgres.queryRaw<{ id: string; name: string; description: string | null }>(
      `SELECT id, name, description FROM menu_items WHERE menu_id = $1 AND deleted_at IS NULL ORDER BY section_id, sort ASC`,
      [menuId],
    );
    for (const it of items) {
      const base = await this.i18n.getTranslations(tenantId, 'menu_item', it.id, 'es-ES');
      const nm = ((base.name as string) || it.name || '').trim();
      const d = ((base.description as string) || it.description || '').trim();
      if (nm) out.push({ entityType: 'menu_item', entityId: it.id, field: 'name', text: nm });
      if (d) out.push({ entityType: 'menu_item', entityId: it.id, field: 'description', text: d });
    }
    return out;
  }

  private async lookupCache(
    sourceLocale: string,
    targetLocale: string,
    hashes: string[],
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (hashes.length === 0) return map;
    const rows = await this.postgres.queryRaw<{ source_hash: string; translated_text: string }>(
      `SELECT source_hash, translated_text FROM translation_text_cache
       WHERE source_locale = $1 AND target_locale = $2 AND source_hash = ANY($3::text[])`,
      [sourceLocale, targetLocale, hashes],
    );
    for (const r of rows) {
      map.set(r.source_hash, r.translated_text);
    }
    return map;
  }

  private async insertCache(
    sourceLocale: string,
    targetLocale: string,
    sourceHash: string,
    translatedText: string,
  ): Promise<void> {
    await this.postgres.executeRaw(
      `INSERT INTO translation_text_cache (id, source_locale, target_locale, source_hash, translated_text, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (source_locale, target_locale, source_hash) DO NOTHING`,
      [randomUUID(), sourceLocale, targetLocale, sourceHash, translatedText],
    );
  }

  /** Google Cloud Translation v2 REST */
  private async googleTranslateBatch(
    texts: string[],
    sourceBcp47: string,
    targetBcp47: string,
  ): Promise<string[]> {
    const key = this.googleApiKey();
    if (!key) throw new ServiceUnavailableException('GOOGLE_TRANSLATE_API_KEY no configurada.');
    const source = this.toGoogleLang(sourceBcp47);
    const target = this.toGoogleLang(targetBcp47);
    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source, target, format: 'text' }),
    });
    const json = (await res.json()) as {
      data?: { translations?: { translatedText: string }[] };
      error?: { message?: string };
    };
    if (!res.ok) {
      this.logger.warn(`Google Translate HTTP ${res.status}: ${JSON.stringify(json)}`);
      throw new BadGatewayException(json?.error?.message || `Google Translate error HTTP ${res.status}`);
    }
    const tr = json.data?.translations || [];
    if (tr.length !== texts.length) {
      throw new BadGatewayException('Respuesta inesperada de Google Translate.');
    }
    return tr.map((t) => t.translatedText);
  }

  /** Microsoft Translator Text REST API v3.0 */
  private async microsoftTranslateBatch(
    texts: string[],
    sourceBcp47: string,
    targetBcp47: string,
  ): Promise<string[]> {
    const key = this.microsoftTranslatorKey();
    const region = this.microsoftTranslatorRegion();
    if (!key || !region) {
      throw new ServiceUnavailableException(
        'Microsoft Translator no configurado (MICROSOFT_TRANSLATOR_KEY y MICROSOFT_TRANSLATOR_REGION).',
      );
    }
    const from = this.toMicrosoftTranslatorLang(sourceBcp47);
    const to = this.toMicrosoftTranslatorLang(targetBcp47);
    const base = this.microsoftTranslatorEndpointBase();
    const url = `${base}/translate?api-version=3.0&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(texts.map((t) => ({ Text: t }))),
    });
    const json = (await res.json()) as
      | { error?: { message?: string; code?: string } }
      | Array<{ translations?: { text: string; to: string }[] }>;
    if (!res.ok) {
      const errMsg =
        !Array.isArray(json) && json?.error?.message
          ? json.error.message
          : `Microsoft Translator error HTTP ${res.status}`;
      this.logger.warn(`Microsoft Translator HTTP ${res.status}: ${JSON.stringify(json)}`);
      throw new BadGatewayException(errMsg);
    }
    if (!Array.isArray(json) || json.length !== texts.length) {
      throw new BadGatewayException('Respuesta inesperada de Microsoft Translator.');
    }
    return json.map((item, idx) => {
      const t0 = item.translations?.[0]?.text;
      if (t0 === undefined) {
        this.logger.warn(`Microsoft Translator: falta traducción en índice ${idx}`);
        throw new BadGatewayException('Respuesta incompleta de Microsoft Translator.');
      }
      return t0;
    });
  }

  private async translateBatchActive(
    texts: string[],
    sourceBcp47: string,
    targetBcp47: string,
  ): Promise<string[]> {
    const p = this.effectiveTranslateProvider();
    if (p === 'google') return this.googleTranslateBatch(texts, sourceBcp47, targetBcp47);
    if (p === 'microsoft') return this.microsoftTranslateBatch(texts, sourceBcp47, targetBcp47);
    throw new ServiceUnavailableException('No hay proveedor de traducción automática configurado.');
  }

  async runForMenu(params: {
    tenantId: string;
    menuId: string;
    userId: string;
    targetLocale: string;
    force: boolean;
    tenantPlan: string | null | undefined;
  }): Promise<{ segmentCount: number; apiUnits: number; cacheHits: number }> {
    const { tenantId, menuId, userId, targetLocale, force, tenantPlan } = params;
    await this.assertPreconditionsAndGetMenu(tenantId, menuId, userId, targetLocale, tenantPlan, force);

    const sourceLocale = 'es-ES';
    const segments = await this.collectSegments(tenantId, menuId);
    if (segments.length === 0) {
      throw new BadRequestException('No hay textos en español para traducir en este menú.');
    }

    const uniqueTexts: string[] = [];
    const seen = new Set<string>();
    for (const s of segments) {
      if (!seen.has(s.text)) {
        seen.add(s.text);
        uniqueTexts.push(s.text);
      }
    }

    const hashes = uniqueTexts.map((t) => this.hashText(sourceLocale, t));
    const cacheMap = await this.lookupCache(sourceLocale, targetLocale, hashes);
    const toRequest: string[] = [];
    const toRequestHashes: string[] = [];
    let cacheHits = 0;
    for (let i = 0; i < uniqueTexts.length; i++) {
      const h = hashes[i]!;
      const t = uniqueTexts[i]!;
      if (cacheMap.has(h)) {
        cacheHits++;
        continue;
      }
      toRequest.push(t);
      toRequestHashes.push(h);
    }

    let apiUnits = 0;
    const BATCH = 50;
    const translatedByHash = new Map<string, string>(cacheMap);
    for (let i = 0; i < toRequest.length; i += BATCH) {
      const chunk = toRequest.slice(i, i + BATCH);
      const chunkHashes = toRequestHashes.slice(i, i + BATCH);
      if (chunk.length === 0) continue;
      const outs = await this.translateBatchActive(chunk, sourceLocale, targetLocale);
      apiUnits += chunk.length;
      for (let j = 0; j < chunk.length; j++) {
        const h = chunkHashes[j]!;
        const translated = outs[j] ?? '';
        translatedByHash.set(h, translated);
        await this.insertCache(sourceLocale, targetLocale, h, translated);
      }
    }

    const textToTranslation = new Map<string, string>();
    for (let i = 0; i < uniqueTexts.length; i++) {
      const h = hashes[i]!;
      const t = uniqueTexts[i]!;
      const tr = translatedByHash.get(h);
      if (tr !== undefined) textToTranslation.set(t, tr);
    }

    const byEntity = new Map<string, Record<string, string>>();
    for (const seg of segments) {
      const tr = textToTranslation.get(seg.text);
      if (!tr) continue;
      const k = `${seg.entityType}:${seg.entityId}`;
      if (!byEntity.has(k)) byEntity.set(k, {});
      byEntity.get(k)![seg.field] = tr;
    }

    for (const [compound, payload] of byEntity.entries()) {
      const [entityType, entityId] = compound.split(':') as [typeof segments[0]['entityType'], string];
      await this.i18n.saveTranslations(tenantId, entityType, entityId, payload, targetLocale);
    }

    await this.postgres.executeRaw(
      `UPDATE menus SET auto_translated = true, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [menuId, tenantId],
    );

    await this.postgres.executeRaw(
      `INSERT INTO auto_translate_usage (id, user_id, tenant_id, menu_id, target_locale, forced, segment_count, api_units, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [randomUUID(), userId, tenantId, menuId, targetLocale, force, segments.length, apiUnits],
    );

    this.i18n.clearCache(tenantId);

    return { segmentCount: segments.length, apiUnits, cacheHits };
  }

  async listUsageForAdmin(opts: {
    userId?: string;
    tenantId?: string;
    from?: string;
    to?: string;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
    const params: unknown[] = [];
    let where = 'WHERE 1=1';
    if (opts.userId) {
      params.push(opts.userId);
      where += ` AND u.user_id = $${params.length}`;
    }
    if (opts.tenantId) {
      params.push(opts.tenantId);
      where += ` AND u.tenant_id = $${params.length}`;
    }
    if (opts.from) {
      params.push(opts.from);
      where += ` AND u.created_at >= $${params.length}::timestamptz`;
    }
    if (opts.to) {
      params.push(opts.to);
      where += ` AND u.created_at < $${params.length}::timestamptz`;
    }
    params.push(limit);
    const limIdx = params.length;
    const rows = await this.postgres.queryRaw<any>(
      `SELECT u.id, u.user_id, u.tenant_id, u.menu_id, u.target_locale, u.forced, u.segment_count, u.api_units, u.created_at,
              us.email AS user_email
       FROM auto_translate_usage u
       LEFT JOIN users us ON us.id = u.user_id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${limIdx}`,
      params,
    );

    const agg = await this.postgres.queryRaw<{ user_id: string; email: string | null; month_uses: string }>(
      `SELECT u.user_id, MIN(us.email) AS email,
              COUNT(*)::text AS month_uses
       FROM auto_translate_usage u
       LEFT JOIN users us ON us.id = u.user_id
       WHERE u.created_at >= date_trunc('month', timezone('UTC', now()))
         AND u.created_at < date_trunc('month', timezone('UTC', now())) + interval '1 month'
       GROUP BY u.user_id
       ORDER BY month_uses DESC NULLS LAST
       LIMIT 200`,
    );

    return { rows, monthlyByUser: agg };
  }
}
