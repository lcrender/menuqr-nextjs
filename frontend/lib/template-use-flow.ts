import type { NextRouter } from 'next/router';
import api from './axios';
import {
  consumeTemplateAfterAuth,
  getNavigationForConsumeResult,
  tenantPlanAllowsProTemplates,
} from './consume-template-after-auth';
import { buildIntentFromCatalogSlug, readTemplateIntent, saveTemplateIntent } from './template-selection-intent';

export const PRO_TEMPLATE_UPGRADE_HREF = '/precios?reason=pro_template';

export function isAuthenticatedUser(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('accessToken'));
}

export function readStoredAuthUser(): { role?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as { role?: string };
  } catch {
    return null;
  }
}

export async function navigateUseTemplateByCatalogSlug(
  router: NextRouter,
  catalogSlug: string,
): Promise<void> {
  const intent = buildIntentFromCatalogSlug(catalogSlug);
  if (!intent) return;
  saveTemplateIntent(intent);

  if (!isAuthenticatedUser()) {
    const qs = new URLSearchParams();
    qs.set('action', 'register');
    qs.set('template', intent.apiTemplateId);
    qs.set('plan', intent.requiredPlan);
    await router.push(`/login?${qs.toString()}`);
    return;
  }

  const user = readStoredAuthUser();
  const result = await consumeTemplateAfterAuth(api, {
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  });
  await router.push(getNavigationForConsumeResult(result));
}

export async function navigateUpgradeToProForTemplate(
  router: NextRouter,
  catalogSlug: string,
): Promise<void> {
  const intent = buildIntentFromCatalogSlug(catalogSlug);
  if (intent) saveTemplateIntent(intent);
  await router.push(PRO_TEMPLATE_UPGRADE_HREF);
}

function syncStoredUserPlan(plan: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    const user = JSON.parse(raw) as { tenant?: { plan?: string } | null };
    if (user?.tenant) {
      user.tenant.plan = plan;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch {
    /* ignore */
  }
}

async function waitForProPlanAccess(maxAttempts = 12, delayMs = 1500): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const stats = await api.get('/restaurants/dashboard-stats');
      const plan = typeof stats.data?.plan === 'string' ? stats.data.plan : null;
      if (tenantPlanAllowsProTemplates(plan)) return plan;
    } catch {
      /* retry */
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

/** Tras confirmar pago Pro: si hay plantilla pendiente, deriva al selector de restaurantes. */
export async function tryContinueTemplateIntentAfterProUpgrade(router: NextRouter): Promise<boolean> {
  const intent = readTemplateIntent();
  if (!intent || intent.requiredPlan !== 'pro') return false;

  const plan = await waitForProPlanAccess();
  if (!plan) return false;

  syncStoredUserPlan(plan);

  const user = readStoredAuthUser();
  const result = await consumeTemplateAfterAuth(api, {
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  });
  if (result.action === 'skipped') return false;

  await router.replace(getNavigationForConsumeResult(result));
  return true;
}
