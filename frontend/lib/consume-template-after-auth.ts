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
  | { action: 'applied'; displayName: string };

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
 * Tras login/registro: aplica la plantilla pendiente al primer restaurante o indica wizard / upgrade.
 * No limpia el intent si hace falta upgrade (sigue pendiente) o si derivamos a wizard (sigue pendiente).
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

  const first = restaurants[0];
  if (!first?.id) {
    clearTemplateIntent();
    return { action: 'skipped' };
  }
  const targetId = first.id;
  try {
    await api.put(`/restaurants/${targetId}`, buildRestaurantPayload(intent.apiTemplateId));
    const name = intent.displayName;
    clearTemplateIntent();
    setTemplateAppliedBanner(name);
    return { action: 'applied', displayName: name };
  } catch {
    return { action: 'skipped' };
  }
}

export function peekIntent(): TemplateSelectionIntent | null {
  return readTemplateIntent();
}
