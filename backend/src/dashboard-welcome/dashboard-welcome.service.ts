import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { TenantPlanKey } from '../common/plan-limits/plan-limits.constants';
import { UpdateDashboardWelcomeDto } from './dto/update-dashboard-welcome.dto';
import { UpdateDashboardCtaCardsDto } from './dto/update-dashboard-cta-card.dto';
import {
  buildDefaultCtaCardSettingsByLocale,
  buildDefaultCtaCardSettingsForLocale,
  buildDefaultWelcomeSettingsByLocale,
  buildDefaultWelcomeSettingsForLocale,
  DASHBOARD_CONTENT_LOCALES,
  DASHBOARD_CTA_CARD_SETTINGS_KEY,
  DASHBOARD_WELCOME_PLACEHOLDERS,
  DASHBOARD_WELCOME_SETTINGS_KEY,
  DashboardContentLocale,
  DashboardCtaCardContent,
  DashboardCtaCardSettingsByLocale,
  DashboardCtaCardSettingsByPlan,
  DashboardWelcomeSettingsByLocale,
  isLocaleKeyedWelcomeObject,
  isPlanKeyedWelcomeObject,
  normalizeDashboardLocale,
  normalizeTenantPlan,
  PLAN_DISPLAY_LABELS,
} from './dashboard-welcome.constants';

@Injectable()
export class DashboardWelcomeService {
  private readonly logger = new Logger(DashboardWelcomeService.name);
  private cached: { settings: DashboardWelcomeSettingsByLocale; loadedAt: number } | null = null;
  private ctaCardCached: { settings: DashboardCtaCardSettingsByLocale; loadedAt: number } | null = null;

  constructor(private readonly postgres: PostgresService) {}

  invalidateCache() {
    this.cached = null;
    this.ctaCardCached = null;
  }

  private async loadRawSettingsByLocale(): Promise<DashboardWelcomeSettingsByLocale> {
    const now = Date.now();
    if (this.cached && now - this.cached.loadedAt < 30_000) {
      return this.cached.settings;
    }

    const defaults = buildDefaultWelcomeSettingsByLocale();
    const rows = await this.postgres.queryRaw<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
      [DASHBOARD_WELCOME_SETTINGS_KEY],
    );

    let parsed: unknown = null;
    if (rows[0]?.value) {
      try {
        parsed = JSON.parse(rows[0].value);
      } catch (e) {
        this.logger.warn(`No se pudo parsear ${DASHBOARD_WELCOME_SETTINGS_KEY}: ${e}`);
      }
    }

    const settings: DashboardWelcomeSettingsByLocale = {
      es: { ...defaults.es },
      en: { ...defaults.en },
    };

    if (isLocaleKeyedWelcomeObject(parsed)) {
      for (const locale of DASHBOARD_CONTENT_LOCALES) {
        const byPlan = parsed[locale];
        if (!byPlan || typeof byPlan !== 'object') continue;
        for (const planKey of Object.keys(defaults.es) as TenantPlanKey[]) {
          const html = (byPlan as Record<string, string>)[planKey];
          if (typeof html === 'string') settings[locale][planKey] = html;
        }
      }
    } else if (isPlanKeyedWelcomeObject(parsed)) {
      // Legacy flat-by-plan → español
      for (const planKey of Object.keys(defaults.es) as TenantPlanKey[]) {
        if (typeof parsed[planKey] === 'string') settings.es[planKey] = parsed[planKey];
      }
    }

    this.cached = { settings, loadedAt: now };
    return settings;
  }

  async getAdminView(localeRaw?: string) {
    const locale = normalizeDashboardLocale(localeRaw);
    const settings = await this.loadRawSettingsByLocale();
    const byPlan = settings[locale] ?? buildDefaultWelcomeSettingsForLocale(locale);
    return {
      locale,
      locales: [...DASHBOARD_CONTENT_LOCALES],
      placeholders: [...DASHBOARD_WELCOME_PLACEHOLDERS],
      plans: (Object.keys(PLAN_DISPLAY_LABELS) as TenantPlanKey[]).map((planKey) => ({
        planKey,
        label: PLAN_DISPLAY_LABELS[planKey],
        html: byPlan[planKey] ?? buildDefaultWelcomeSettingsForLocale(locale)[planKey],
      })),
    };
  }

  async updateSettings(dto: UpdateDashboardWelcomeDto) {
    const locale = normalizeDashboardLocale(dto.locale);
    const current = await this.loadRawSettingsByLocale();
    const nextLocalePlans = { ...current[locale] };
    for (const row of dto.plans) {
      nextLocalePlans[row.planKey as TenantPlanKey] = row.html;
    }
    const next: DashboardWelcomeSettingsByLocale = {
      ...current,
      [locale]: nextLocalePlans,
    };

    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [DASHBOARD_WELCOME_SETTINGS_KEY, JSON.stringify(next)],
    );

    this.invalidateCache();
    return this.getAdminView(locale);
  }

  private replacePlaceholders(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
  }

  async resolveForUser(userId: string, planOverride?: string) {
    const userRows = await this.postgres.queryRaw<{
      email: string;
      firstName: string | null;
      lastName: string | null;
      tenantPlan: string | null;
      preferredLanguage: string | null;
    }>(
      `SELECT u.email, u.first_name as "firstName", u.last_name as "lastName",
              t.plan as "tenantPlan", u.preferred_language as "preferredLanguage"
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
       WHERE u.id = $1 AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );

    const user = userRows[0];
    const locale = normalizeDashboardLocale(user?.preferredLanguage);
    const plan = normalizeTenantPlan(planOverride ?? user?.tenantPlan ?? 'free');
    const settings = await this.loadRawSettingsByLocale();
    const byPlan = settings[locale] ?? buildDefaultWelcomeSettingsForLocale(locale);
    const fallbackEs = settings.es ?? buildDefaultWelcomeSettingsForLocale('es');
    const template =
      (byPlan[plan] && byPlan[plan].trim()) ||
      fallbackEs[plan] ||
      buildDefaultWelcomeSettingsForLocale(locale)[plan];

    const defaultName = locale === 'en' ? 'User' : 'Usuario';
    const vars = {
      firstName: user?.firstName?.trim() || defaultName,
      lastName: user?.lastName?.trim() || '',
      email: user?.email ?? '',
      plan,
      planName: PLAN_DISPLAY_LABELS[plan] ?? plan,
    };

    return {
      plan,
      locale,
      html: this.replacePlaceholders(template, vars),
    };
  }

  async getCtaCardAdmin(localeRaw?: string) {
    const locale = normalizeDashboardLocale(localeRaw);
    const settings = await this.loadCtaCardSettingsByLocale();
    const byPlan = settings[locale] ?? buildDefaultCtaCardSettingsForLocale(locale);
    return {
      locale,
      locales: [...DASHBOARD_CONTENT_LOCALES],
      plans: (Object.keys(PLAN_DISPLAY_LABELS) as TenantPlanKey[]).map((planKey) => ({
        planKey,
        label: PLAN_DISPLAY_LABELS[planKey],
        ...byPlan[planKey],
      })),
    };
  }

  async updateCtaCards(dto: UpdateDashboardCtaCardsDto) {
    const locale = normalizeDashboardLocale(dto.locale);
    const current = await this.loadCtaCardSettingsByLocale();
    const nextLocalePlans: DashboardCtaCardSettingsByPlan = { ...current[locale] };
    for (const row of dto.plans) {
      nextLocalePlans[row.planKey as TenantPlanKey] = {
        title: row.title.trim(),
        description: row.description.trim(),
        buttonLink: row.buttonLink.trim(),
        buttonText: row.buttonText.trim(),
      };
    }
    const next: DashboardCtaCardSettingsByLocale = {
      ...current,
      [locale]: nextLocalePlans,
    };

    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [DASHBOARD_CTA_CARD_SETTINGS_KEY, JSON.stringify(next)],
    );

    this.ctaCardCached = null;
    return this.getCtaCardAdmin(locale);
  }

  async getCtaCardForUser(
    userId: string,
    planOverride?: string,
  ): Promise<DashboardCtaCardContent & { plan: TenantPlanKey; locale: DashboardContentLocale }> {
    const userRows = await this.postgres.queryRaw<{
      tenantPlan: string | null;
      preferredLanguage: string | null;
    }>(
      `SELECT t.plan as "tenantPlan", u.preferred_language as "preferredLanguage"
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
       WHERE u.id = $1 AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );
    const locale = normalizeDashboardLocale(userRows[0]?.preferredLanguage);
    const plan = normalizeTenantPlan(planOverride ?? userRows[0]?.tenantPlan ?? 'free');
    const settings = await this.loadCtaCardSettingsByLocale();
    const byPlan = settings[locale] ?? buildDefaultCtaCardSettingsForLocale(locale);
    const fallbackEs = settings.es ?? buildDefaultCtaCardSettingsForLocale('es');
    const card = byPlan[plan] ?? fallbackEs[plan] ?? buildDefaultCtaCardSettingsForLocale(locale)[plan];
    return { plan, locale, ...card };
  }

  private normalizeCtaContent(
    raw: Partial<DashboardCtaCardContent>,
    fallback: DashboardCtaCardContent,
  ): DashboardCtaCardContent {
    return {
      title: raw.title?.trim() || fallback.title,
      description: raw.description?.trim() || fallback.description,
      buttonLink: raw.buttonLink?.trim() || fallback.buttonLink,
      buttonText: raw.buttonText?.trim() || fallback.buttonText,
    };
  }

  private isLegacySingleCtaCard(parsed: unknown): parsed is DashboardCtaCardContent {
    return (
      !!parsed &&
      typeof parsed === 'object' &&
      'title' in parsed &&
      !('free' in parsed) &&
      !('starter' in parsed) &&
      !('es' in parsed) &&
      !('en' in parsed)
    );
  }

  private isPlanKeyedCta(parsed: unknown): parsed is Partial<DashboardCtaCardSettingsByPlan> {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    const o = parsed as Record<string, unknown>;
    if ('es' in o || 'en' in o) return false;
    return 'free' in o || 'starter' in o || 'pro' in o;
  }

  private isLocaleKeyedCta(
    parsed: unknown,
  ): parsed is Partial<Record<DashboardContentLocale, Partial<DashboardCtaCardSettingsByPlan>>> {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    const o = parsed as Record<string, unknown>;
    return 'es' in o || 'en' in o;
  }

  private async loadCtaCardSettingsByLocale(): Promise<DashboardCtaCardSettingsByLocale> {
    const now = Date.now();
    if (this.ctaCardCached && now - this.ctaCardCached.loadedAt < 30_000) {
      return this.ctaCardCached.settings;
    }

    const defaults = buildDefaultCtaCardSettingsByLocale();
    const rows = await this.postgres.queryRaw<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
      [DASHBOARD_CTA_CARD_SETTINGS_KEY],
    );

    let parsed: unknown = null;
    if (rows[0]?.value) {
      try {
        parsed = JSON.parse(rows[0].value);
      } catch (e) {
        this.logger.warn(`No se pudo parsear ${DASHBOARD_CTA_CARD_SETTINGS_KEY}: ${e}`);
      }
    }

    const settings: DashboardCtaCardSettingsByLocale = {
      es: buildDefaultCtaCardSettingsForLocale('es'),
      en: buildDefaultCtaCardSettingsForLocale('en'),
    };

    if (this.isLocaleKeyedCta(parsed)) {
      for (const locale of DASHBOARD_CONTENT_LOCALES) {
        const byPlan = parsed[locale];
        if (!byPlan || typeof byPlan !== 'object') continue;
        for (const planKey of Object.keys(defaults.es) as TenantPlanKey[]) {
          settings[locale][planKey] = this.normalizeCtaContent(
            (byPlan as Partial<DashboardCtaCardSettingsByPlan>)[planKey] ?? {},
            defaults[locale][planKey],
          );
        }
      }
    } else if (this.isLegacySingleCtaCard(parsed)) {
      const legacy = this.normalizeCtaContent(parsed, defaults.es.free);
      for (const planKey of Object.keys(defaults.es) as TenantPlanKey[]) {
        settings.es[planKey] = { ...legacy };
      }
    } else if (this.isPlanKeyedCta(parsed)) {
      for (const planKey of Object.keys(defaults.es) as TenantPlanKey[]) {
        settings.es[planKey] = this.normalizeCtaContent(parsed[planKey] ?? {}, defaults.es[planKey]);
      }
    }

    this.ctaCardCached = { settings, loadedAt: now };
    return settings;
  }
}
