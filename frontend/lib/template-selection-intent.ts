/**
 * Intención de usar una plantilla desde preview → login → aplicar al primer restaurante (o wizard).
 */
import { previewTemplateIdToCatalogSlug } from './menu-template-preview-route';
import { getTemplateBySlug } from './menu-templates-catalog';

export const TEMPLATE_INTENT_STORAGE_KEY = 'menuqr:templateIntent';

export type TemplatePlanTier = 'free' | 'pro';

export interface TemplateSelectionIntent {
  /** ID de plantilla en API (`classic`, `minimalist`, `italianFood`, `gourmet`, …). */
  apiTemplateId: string;
  /** Plan mínimo del catálogo público para usar esta plantilla. */
  requiredPlan: TemplatePlanTier;
  displayName: string;
  catalogSlug: string;
}

export const VALID_API_TEMPLATE_IDS = [
  'classic',
  'minimalist',
  'foodie',
  'burgers',
  'italianFood',
  'gourmet',
] as const;

const VALID_API_IDS = new Set<string>(VALID_API_TEMPLATE_IDS);

export function isValidApiTemplateId(id: string): boolean {
  return VALID_API_IDS.has(id);
}

/** Slug de catálogo → id API (inverso parcial). */
export function catalogSlugToApiTemplateId(catalogSlug: string): string {
  if (catalogSlug === 'minimalista') return 'minimalist';
  if (catalogSlug === 'italian-food') return 'italianFood';
  return catalogSlug;
}

export function buildIntentFromPreviewTemplateId(previewId: string): TemplateSelectionIntent | null {
  const catalogSlug = previewTemplateIdToCatalogSlug(previewId);
  const apiTemplateId = catalogSlugToApiTemplateId(catalogSlug);
  if (!VALID_API_IDS.has(apiTemplateId)) return null;
  const row = getTemplateBySlug(catalogSlug);
  const requiredPlan: TemplatePlanTier = row?.plan === 'pro' ? 'pro' : 'free';
  return {
    apiTemplateId,
    requiredPlan,
    displayName: row?.nombre ?? apiTemplateId,
    catalogSlug,
  };
}

export function parseTemplateQueryParam(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const id = raw.trim();
  if (VALID_API_IDS.has(id)) return id;
  const fromPreview = buildIntentFromPreviewTemplateId(id);
  return fromPreview?.apiTemplateId ?? null;
}

export function saveTemplateIntent(intent: TemplateSelectionIntent): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEMPLATE_INTENT_STORAGE_KEY, JSON.stringify(intent));
  } catch {
    /* ignore */
  }
}

export function readTemplateIntent(): TemplateSelectionIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TEMPLATE_INTENT_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<TemplateSelectionIntent>;
    if (
      typeof o.apiTemplateId === 'string' &&
      VALID_API_IDS.has(o.apiTemplateId) &&
      typeof o.catalogSlug === 'string' &&
      (o.requiredPlan === 'free' || o.requiredPlan === 'pro') &&
      typeof o.displayName === 'string'
    ) {
      return o as TemplateSelectionIntent;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearTemplateIntent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TEMPLATE_INTENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Banner one-shot tras aplicar plantilla (lee el dashboard). */
export const TEMPLATE_APPLIED_BANNER_KEY = 'menuqr:templateAppliedBanner';

export function setTemplateAppliedBanner(displayName: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TEMPLATE_APPLIED_BANNER_KEY, displayName);
  } catch {
    /* ignore */
  }
}

export function takeTemplateAppliedBanner(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = sessionStorage.getItem(TEMPLATE_APPLIED_BANNER_KEY);
    if (v) sessionStorage.removeItem(TEMPLATE_APPLIED_BANNER_KEY);
    return v;
  } catch {
    return null;
  }
}
