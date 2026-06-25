import { TENANT_PLAN_KEYS, TenantPlanKey } from '../common/plan-limits/plan-limits.constants';

export const DASHBOARD_WELCOME_SETTINGS_KEY = 'dashboard_welcome_messages_v1';

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

export const DEFAULT_DASHBOARD_WELCOME_HTML: Record<TenantPlanKey, string> = {
  free: '<p>Bienvenido, <strong>{{firstName}}</strong>.</p>',
  starter:
    '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Estás en el plan {{planName}}.</p>',
  pro: '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Plan {{planName}} activo.</p>',
  pro_team:
    '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Plan {{planName}}.</p>',
  premium:
    '<p>Bienvenido, <strong>{{firstName}}</strong>.</p><p class="text-muted small mb-0">Plan {{planName}} — gracias por confiar en AppMenuQR.</p>',
};

export type DashboardWelcomeSettings = Record<TenantPlanKey, string>;

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

export function buildDefaultWelcomeSettings(): DashboardWelcomeSettings {
  return { ...DEFAULT_DASHBOARD_WELCOME_HTML };
}

export const DASHBOARD_CTA_CARD_SETTINGS_KEY = 'dashboard_cta_card_v1';

export type DashboardCtaCardContent = {
  title: string;
  description: string;
  buttonLink: string;
  buttonText: string;
};

export type DashboardCtaCardSettingsByPlan = Record<TenantPlanKey, DashboardCtaCardContent>;

const BASE_CTA_CARD: DashboardCtaCardContent = {
  title: '¿Necesitás crear más productos?',
  description: 'Probá por 30 días cualquiera de nuestros planes.',
  buttonLink: '/admin/profile/subscription',
  buttonText: 'Gestionar suscripción',
};

export const DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN: DashboardCtaCardSettingsByPlan = {
  free: { ...BASE_CTA_CARD },
  starter: {
    ...BASE_CTA_CARD,
    description: 'Upgradeá a Starter y desbloqueá más menús y productos.',
  },
  pro: {
    ...BASE_CTA_CARD,
    title: '¿Querés más funciones?',
    description: 'Pasá a Pro y accedé a plantillas premium y más capacidad.',
  },
  pro_team: {
    ...BASE_CTA_CARD,
    title: 'Plan Pro Team',
    description: 'Gestioná tu equipo con las herramientas incluidas en tu plan.',
    buttonText: 'Ver mi plan',
  },
  premium: {
    ...BASE_CTA_CARD,
    title: '¿Necesitás soporte dedicado?',
    description: 'Con Premium tenés límites ampliados y soporte prioritario.',
    buttonText: 'Ver Premium',
  },
};

export function buildDefaultCtaCardSettingsByPlan(): DashboardCtaCardSettingsByPlan {
  return Object.fromEntries(
    (Object.keys(DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN) as TenantPlanKey[]).map((k) => [
      k,
      { ...DEFAULT_DASHBOARD_CTA_CARD_BY_PLAN[k] },
    ]),
  ) as DashboardCtaCardSettingsByPlan;
}
