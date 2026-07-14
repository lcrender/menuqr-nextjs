import type { AxiosInstance } from 'axios';
import {
  type TemplateSelectionIntent,
  readTemplateIntent,
  clearTemplateIntent,
  setTemplateAppliedBanner,
} from './template-selection-intent';

export type ConsumeTemplateResult =
  | { action: 'skipped' }
  | { action: 'needs_upgrade'; upgradeHref: string }
  | { action: 'needs_restaurant'; wizardHref: string }
  | { action: 'needs_pick_restaurant'; pickerHref: string; displayName: string }
  | { action: 'applied'; displayName: string; restaurantId: string };

export const TEMPLATE_PICKER_PATH = '/admin/apply-template';

function normalizePlanKey(plan: string | null | undefined): string {
  return String(plan || 'free')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_');
}

/** Acceso a plantillas PRO (Gourmet, etc.): mismo criterio que /admin/templates. */
export function tenantPlanAllowsProTemplates(plan: string | null | undefined): boolean {
  const k = normalizePlanKey(plan);
  const key = k === 'proteam' ? 'pro_team' : k;
  return key === 'pro' || key === 'pro_team' || key === 'premium';
}

function buildRestaurantPayload(templateId: string): Record<string, unknown> {
  const payload: Record<string, unknown> = { template: templateId };
  if (templateId === 'italianFood') {
    return payload;
  }
  return payload;
}

/**
 * Tras login/registro: deriva a wizard, selector de restaurante o upgrade según el intent pendiente.
 * No limpia el intent si hace falta upgrade, wizard o elección de restaurante.
 */
export async function consumeTemplateAfterAuth(
  api: AxiosInstance,
  options: { isSuperAdmin?: boolean },
): Promise<ConsumeTemplateResult> {
  const intent = readTemplateIntent();
  if (!intent) return { action: 'skipped' };

  let plan: string | null = null;
  try {
    const stats = await api.get('/restaurants/dashboard-stats');
    plan = typeof stats.data?.plan === 'string' ? stats.data.plan : null;
  } catch {
    plan = null;
  }

  if (!options.isSuperAdmin && intent.requiredPlan === 'pro' && !tenantPlanAllowsProTemplates(plan)) {
    return {
      action: 'needs_upgrade',
      upgradeHref: '/precios?reason=pro_template',
    };
  }

  let restaurants: { id: string }[] = [];
  try {
    const res = await api.get('/restaurants');
    const data = res.data?.data && res.data?.total !== undefined ? res.data.data : res.data;
    restaurants = Array.isArray(data) ? data : [];
  } catch {
    clearTemplateIntent();
    return { action: 'skipped' };
  }

  if (restaurants.length === 0) {
    const q = new URLSearchParams();
    q.set('wizard', 'true');
    q.set('intentTemplate', intent.apiTemplateId);
    return {
      action: 'needs_restaurant',
      wizardHref: `/admin/restaurants?${q.toString()}`,
    };
  }

  return {
    action: 'needs_pick_restaurant',
    pickerHref: TEMPLATE_PICKER_PATH,
    displayName: intent.displayName,
  };
}

export function getNavigationForConsumeResult(result: ConsumeTemplateResult): string {
  switch (result.action) {
    case 'needs_upgrade':
      return result.upgradeHref;
    case 'needs_restaurant':
      return result.wizardHref;
    case 'needs_pick_restaurant':
      return result.pickerHref;
    case 'applied':
      return '/admin';
    default:
      return '/admin';
  }
}

export async function applyTemplateIntentToRestaurant(
  api: AxiosInstance,
  restaurantId: string,
  intent?: TemplateSelectionIntent | null,
): Promise<{ ok: true; displayName: string } | { ok: false }> {
  const resolved = intent ?? readTemplateIntent();
  if (!resolved?.apiTemplateId || !restaurantId) return { ok: false };
  try {
    await api.put(`/restaurants/${restaurantId}`, buildRestaurantPayload(resolved.apiTemplateId));
    const name = resolved.displayName;
    clearTemplateIntent();
    setTemplateAppliedBanner(name, restaurantId);
    return { ok: true, displayName: name };
  } catch {
    return { ok: false };
  }
}

export function peekIntent(): TemplateSelectionIntent | null {
  return readTemplateIntent();
}
