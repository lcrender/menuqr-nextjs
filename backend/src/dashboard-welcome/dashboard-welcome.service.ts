import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { TenantPlanKey } from '../common/plan-limits/plan-limits.constants';
import { UpdateDashboardWelcomeDto } from './dto/update-dashboard-welcome.dto';
import { UpdateDashboardCtaCardsDto } from './dto/update-dashboard-cta-card.dto';
import {
  buildDefaultWelcomeSettings,
  buildDefaultCtaCardSettingsByPlan,
  DASHBOARD_CTA_CARD_SETTINGS_KEY,
  DASHBOARD_WELCOME_PLACEHOLDERS,
  DASHBOARD_WELCOME_SETTINGS_KEY,
  DashboardCtaCardContent,
  DashboardCtaCardSettingsByPlan,
  DashboardWelcomeSettings,
  normalizeTenantPlan,
  PLAN_DISPLAY_LABELS,
} from './dashboard-welcome.constants';

@Injectable()
export class DashboardWelcomeService {
  private readonly logger = new Logger(DashboardWelcomeService.name);
  private cached: { settings: DashboardWelcomeSettings; loadedAt: number } | null = null;

  constructor(private readonly postgres: PostgresService) {}

  invalidateCache() {
    this.cached = null;
  }

  private async loadRawSettings(): Promise<DashboardWelcomeSettings> {
    const now = Date.now();
    if (this.cached && now - this.cached.loadedAt < 30_000) {
      return this.cached.settings;
    }

    const defaults = buildDefaultWelcomeSettings();
    const rows = await this.postgres.queryRaw<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
      [DASHBOARD_WELCOME_SETTINGS_KEY],
    );

    let parsed: Partial<DashboardWelcomeSettings> | null = null;
    if (rows[0]?.value) {
      try {
        parsed = JSON.parse(rows[0].value) as Partial<DashboardWelcomeSettings>;
      } catch (e) {
        this.logger.warn(`No se pudo parsear ${DASHBOARD_WELCOME_SETTINGS_KEY}: ${e}`);
      }
    }

    const settings: DashboardWelcomeSettings = { ...defaults, ...(parsed ?? {}) };
    this.cached = { settings, loadedAt: now };
    return settings;
  }

  async getAdminView() {
    const settings = await this.loadRawSettings();
    return {
      placeholders: [...DASHBOARD_WELCOME_PLACEHOLDERS],
      plans: (Object.keys(PLAN_DISPLAY_LABELS) as TenantPlanKey[]).map((planKey) => ({
        planKey,
        label: PLAN_DISPLAY_LABELS[planKey],
        html: settings[planKey] ?? buildDefaultWelcomeSettings()[planKey],
      })),
    };
  }

  async updateSettings(dto: UpdateDashboardWelcomeDto) {
    const current = await this.loadRawSettings();
    const next: DashboardWelcomeSettings = { ...current };
    for (const row of dto.plans) {
      next[row.planKey as TenantPlanKey] = row.html;
    }

    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [DASHBOARD_WELCOME_SETTINGS_KEY, JSON.stringify(next)],
    );

    this.invalidateCache();
    return this.getAdminView();
  }

  private replacePlaceholders(
    template: string,
    vars: Record<string, string>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
  }

  async resolveForUser(userId: string, planOverride?: string) {
    const userRows = await this.postgres.queryRaw<{
      email: string;
      firstName: string | null;
      lastName: string | null;
      tenantPlan: string | null;
    }>(
      `SELECT u.email, u.first_name as "firstName", u.last_name as "lastName", t.plan as "tenantPlan"
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
       WHERE u.id = $1 AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );

    const user = userRows[0];
    const plan = normalizeTenantPlan(planOverride ?? user?.tenantPlan ?? 'free');
    const settings = await this.loadRawSettings();
    const template = settings[plan] ?? buildDefaultWelcomeSettings()[plan];

    const vars = {
      firstName: user?.firstName?.trim() || 'Usuario',
      lastName: user?.lastName?.trim() || '',
      email: user?.email ?? '',
      plan,
      planName: PLAN_DISPLAY_LABELS[plan] ?? plan,
    };

    return {
      plan,
      html: this.replacePlaceholders(template, vars),
    };
  }

  async getCtaCardAdmin() {
    const settings = await this.loadCtaCardSettingsByPlan();
    return {
      plans: (Object.keys(PLAN_DISPLAY_LABELS) as TenantPlanKey[]).map((planKey) => ({
        planKey,
        label: PLAN_DISPLAY_LABELS[planKey],
        ...settings[planKey],
      })),
    };
  }

  async updateCtaCards(dto: UpdateDashboardCtaCardsDto) {
    const current = await this.loadCtaCardSettingsByPlan();
    const next: DashboardCtaCardSettingsByPlan = { ...current };
    for (const row of dto.plans) {
      next[row.planKey as TenantPlanKey] = {
        title: row.title.trim(),
        description: row.description.trim(),
        buttonLink: row.buttonLink.trim(),
        buttonText: row.buttonText.trim(),
      };
    }

    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [DASHBOARD_CTA_CARD_SETTINGS_KEY, JSON.stringify(next)],
    );

    this.ctaCardCached = null;
    return this.getCtaCardAdmin();
  }

  async getCtaCardForUser(userId: string, planOverride?: string): Promise<DashboardCtaCardContent & { plan: TenantPlanKey }> {
    const userRows = await this.postgres.queryRaw<{ tenantPlan: string | null }>(
      `SELECT t.plan as "tenantPlan"
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
       WHERE u.id = $1 AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );
    const plan = normalizeTenantPlan(planOverride ?? userRows[0]?.tenantPlan ?? 'free');
    const settings = await this.loadCtaCardSettingsByPlan();
    const card = settings[plan] ?? buildDefaultCtaCardSettingsByPlan()[plan];
    return { plan, ...card };
  }

  private ctaCardCached: { settings: DashboardCtaCardSettingsByPlan; loadedAt: number } | null = null;

  private normalizeCtaContent(raw: Partial<DashboardCtaCardContent>, fallback: DashboardCtaCardContent): DashboardCtaCardContent {
    return {
      title: raw.title?.trim() || fallback.title,
      description: raw.description?.trim() || fallback.description,
      buttonLink: raw.buttonLink?.trim() || fallback.buttonLink,
      buttonText: raw.buttonText?.trim() || fallback.buttonText,
    };
  }

  private isLegacyCtaCardFormat(parsed: unknown): parsed is DashboardCtaCardContent {
    return (
      !!parsed &&
      typeof parsed === 'object' &&
      'title' in parsed &&
      !('free' in parsed) &&
      !('starter' in parsed)
    );
  }

  private async loadCtaCardSettingsByPlan(): Promise<DashboardCtaCardSettingsByPlan> {
    const now = Date.now();
    if (this.ctaCardCached && now - this.ctaCardCached.loadedAt < 30_000) {
      return this.ctaCardCached.settings;
    }

    const defaults = buildDefaultCtaCardSettingsByPlan();
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

    let settings: DashboardCtaCardSettingsByPlan = { ...defaults };

    if (this.isLegacyCtaCardFormat(parsed)) {
      const legacy = this.normalizeCtaContent(parsed, defaults.free);
      for (const planKey of Object.keys(defaults) as TenantPlanKey[]) {
        settings[planKey] = { ...legacy };
      }
    } else if (parsed && typeof parsed === 'object') {
      const byPlan = parsed as Partial<DashboardCtaCardSettingsByPlan>;
      for (const planKey of Object.keys(defaults) as TenantPlanKey[]) {
        settings[planKey] = this.normalizeCtaContent(byPlan[planKey] ?? {}, defaults[planKey]);
      }
    }

    this.ctaCardCached = { settings, loadedAt: now };
    return settings;
  }
}
