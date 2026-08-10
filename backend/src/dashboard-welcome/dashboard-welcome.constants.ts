import { TENANT_PLAN_KEYS, TenantPlanKey } from '../common/plan-limits/plan-limits.constants';

export const DASHBOARD_WELCOME_SETTINGS_KEY = 'dashboard_welcome_messages_v1';
export const DASHBOARD_CTA_CARD_SETTINGS_KEY = 'dashboard_cta_card_v1';

export const DASHBOARD_CONTENT_LOCALES = ['es', 'en'] as const;
export type DashboardContentLocale = (typeof DASHBOARD_CONTENT_LOCALES)[number];

export const DASHBOARD_WELCOME_PLACEHOLDERS = [
  '{{firstName}}',
  '{{lastName}}',
  '{{email}}',
  '{{plan}}',
  '{{planName}}',
] as const;

export const PLAN_DISPLAY_LABELS: Record<TenantPlanKey, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  pro_team: 'Pro Team',
  premium: 'Premium',
};

export const DEFAULT_DASHBOARD_WELCOME_HTML_ES: Record<TenantPlanKey, string> = {
  free: '<p>Bienvenido, <strong>{{firstName}}</strong>.</p>',
  starter:
    '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Estás en el plan {{planName}}.</p>',
  pro: '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Plan {{planName}} activo.</p>',
  pro_team:
    '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Plan {{planName}}.</p>',
  premium:
    '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Plan {{planName}} — gracias por confiar en AppMenuQR.</p>',
};

export const DEFAULT_DASHBOARD_WELCOME_HTML_EN: Record<TenantPlanKey, string> = {
  free: '<p>Welcome, <strong>{{firstName}}</strong>.</p>',
  starter:
    '<p>Welcome, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">You are on the {{planName}} plan.</p>',
  pro: '<p>Welcome, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">{{planName}} plan active.</p>',
  pro_team:
    '<p>Welcome, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">{{planName}} plan.</p>',
  premium:
    '<p>Welcome, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">{{planName}} plan — thank you for trusting AppMenuQR.</p>',
};

/** Settings by locale → plan → HTML. */
export type DashboardWelcomeSettingsByLocale = Record<
  DashboardContentLocale,
  Record<TenantPlanKey, string>
>;

/** @deprecated flat shape (treated as Spanish). */
export type DashboardWelcomeSettings = Record<TenantPlanKey, string>;

export function normalizeDashboardLocale(raw?: string | null): DashboardContentLocale {
  return String(raw || 'es').trim().toLowerCase() === 'en' ? 'en' : 'es';
}

export function normalizeTenantPlan(raw: string | null | undefined): TenantPlanKey {
  const normalized = String(raw ?? 'free')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_');
  if (normalized === 'proteam' || normalized === 'pro_team') return 'pro_team';
  if (normalized === 'basic') return 'starter';
  if ((TENANT_PLAN_KEYS as readonly string[]).includes(normalized)) {
    return normalized as TenantPlanKey;
  }
  return 'free';
}

export function buildDefaultWelcomeSettingsForLocale(
  locale: DashboardContentLocale,
): Record<TenantPlanKey, string> {
  const src = locale === 'en' ? DEFAULT_DASHBOARD_WELCOME_HTML_EN : DEFAULT_DASHBOARD_WELCOME_HTML_ES;
  return { ...src };
}

export function buildDefaultWelcomeSettingsByLocale(): DashboardWelcomeSettingsByLocale {
  return {
    es: buildDefaultWelcomeSettingsForLocale('es'),
    en: buildDefaultWelcomeSettingsForLocale('en'),
  };
}

/** @deprecated use buildDefaultWelcomeSettingsForLocale('es') */
export function buildDefaultWelcomeSettings(): DashboardWelcomeSettings {
  return buildDefaultWelcomeSettingsForLocale('es');
}

export type DashboardCtaCardContent = {
  title: string;
  description: string;
  buttonLink: string;
  buttonText: string;
};

export type DashboardCtaCardSettingsByPlan = Record<TenantPlanKey, DashboardCtaCardContent>;
export type DashboardCtaCardSettingsByLocale = Record<
  DashboardContentLocale,
  DashboardCtaCardSettingsByPlan
>;

const BASE_CTA_CARD_ES: DashboardCtaCardContent = {
  title: '¿Necesitás crear más productos?',
  description: 'Probá por 30 días cualquiera de nuestros planes.',
  buttonLink: '/admin/profile/subscription',
  buttonText: 'Gestionar suscripción',
};

const BASE_CTA_CARD_EN: DashboardCtaCardContent = {
  title: 'Need to create more products?',
  description: 'Try any of our plans free for 30 days.',
  buttonLink: '/admin/profile/subscription',
  buttonText: 'Manage subscription',
};

export const DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN_ES: DashboardCtaCardSettingsByPlan = {
  free: { ...BASE_CTA_CARD_ES },
  starter: {
    ...BASE_CTA_CARD_ES,
    description: 'Upgradeá a Starter y desbloqueá más menús y productos.',
  },
  pro: {
    ...BASE_CTA_CARD_ES,
    title: '¿Querés más funciones?',
    description: 'Pasá a Pro y accedé a plantillas premium y más capacidad.',
  },
  pro_team: {
    ...BASE_CTA_CARD_ES,
    title: 'Plan Pro Team',
    description: 'Gestioná tu equipo con las herramientas incluidas en tu plan.',
    buttonText: 'Ver mi plan',
  },
  premium: {
    ...BASE_CTA_CARD_ES,
    title: '¿Necesitás soporte dedicado?',
    description: 'Con Premium tenés límites ampliados y soporte prioritario.',
    buttonText: 'Ver Premium',
  },
};

export const DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN_EN: DashboardCtaCardSettingsByPlan = {
  free: { ...BASE_CTA_CARD_EN },
  starter: {
    ...BASE_CTA_CARD_EN,
    description: 'Upgrade to Starter and unlock more menus and products.',
  },
  pro: {
    ...BASE_CTA_CARD_EN,
    title: 'Want more features?',
    description: 'Move to Pro for premium templates and more capacity.',
  },
  pro_team: {
    ...BASE_CTA_CARD_EN,
    title: 'Pro Team plan',
    description: 'Manage your team with the tools included in your plan.',
    buttonText: 'View my plan',
  },
  premium: {
    ...BASE_CTA_CARD_EN,
    title: 'Need dedicated support?',
    description: 'Premium includes higher limits and priority support.',
    buttonText: 'View Premium',
  },
};

/** @deprecated Spanish defaults */
export const DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN = DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN_ES;

export function buildDefaultCtaCardSettingsForLocale(
  locale: DashboardContentLocale,
): DashboardCtaCardSettingsByPlan {
  const src = locale === 'en' ? DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN_EN : DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN_ES;
  return Object.fromEntries(
    (Object.keys(src) as TenantPlanKey[]).map((k) => [k, { ...src[k] }]),
  ) as DashboardCtaCardSettingsByPlan;
}

export function buildDefaultCtaCardSettingsByLocale(): DashboardCtaCardSettingsByLocale {
  return {
    es: buildDefaultCtaCardSettingsForLocale('es'),
    en: buildDefaultCtaCardSettingsForLocale('en'),
  };
}

export function buildDefaultCtaCardSettingsByPlan(): DashboardCtaCardSettingsByPlan {
  return buildDefaultCtaCardSettingsForLocale('es');
}

export function isPlanKeyedWelcomeObject(parsed: unknown): parsed is Record<string, string> {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  const o = parsed as Record<string, unknown>;
  if ('es' in o || 'en' in o) return false;
  return typeof o.free === 'string' || typeof o.starter === 'string' || typeof o.pro === 'string';
}

export function isLocaleKeyedWelcomeObject(
  parsed: unknown,
): parsed is Partial<Record<DashboardContentLocale, Record<string, string>>> {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  const o = parsed as Record<string, unknown>;
  return 'es' in o || 'en' in o;
}
