import { getApiBaseUrl } from './config';

export type PublicPlanLimitRow = {
  key: 'free' | 'starter' | 'pro' | 'pro_team' | 'premium';
  label: string;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  productPhotosAllowed: boolean;
  gourmetTemplate: boolean;
  productHighlightAllowed: boolean;
};

export type PublicPlanLimitsResponse = {
  plans: PublicPlanLimitRow[];
};

/** Valores por defecto (alineados con plan-limits.constants en backend) si falla el fetch. */
export const DEFAULT_PUBLIC_PLAN_LIMITS: Record<
  'free' | 'starter' | 'pro' | 'pro_team' | 'premium',
  PublicPlanLimitRow
> = {
  free: {
    key: 'free',
    label: 'Free',
    restaurantLimit: 1,
    menuLimit: 3,
    productLimit: 30,
    productPhotosAllowed: false,
    gourmetTemplate: false,
    productHighlightAllowed: false,
  },
  starter: {
    key: 'starter',
    label: 'Starter',
    restaurantLimit: 1,
    menuLimit: 6,
    productLimit: 60,
    productPhotosAllowed: false,
    gourmetTemplate: false,
    productHighlightAllowed: false,
  },
  pro: {
    key: 'pro',
    label: 'Pro',
    restaurantLimit: 3,
    menuLimit: 30,
    productLimit: 300,
    productPhotosAllowed: true,
    gourmetTemplate: true,
    productHighlightAllowed: true,
  },
  pro_team: {
    key: 'pro_team',
    label: 'Pro Team',
    restaurantLimit: 3,
    menuLimit: 30,
    productLimit: 300,
    productPhotosAllowed: true,
    gourmetTemplate: true,
    productHighlightAllowed: true,
  },
  premium: {
    key: 'premium',
    label: 'Premium',
    restaurantLimit: 10,
    menuLimit: -1,
    productLimit: 1200,
    productPhotosAllowed: true,
    gourmetTemplate: true,
    productHighlightAllowed: true,
  },
};

function toMap(
  rows: PublicPlanLimitRow[],
): Record<'free' | 'starter' | 'pro' | 'pro_team' | 'premium', PublicPlanLimitRow> {
  const m = { ...DEFAULT_PUBLIC_PLAN_LIMITS };
  for (const r of rows) {
    if (
      r.key === 'free' ||
      r.key === 'starter' ||
      r.key === 'pro' ||
      r.key === 'pro_team' ||
      r.key === 'premium'
    ) {
      m[r.key] = r;
    }
  }
  return m;
}

export async function fetchPublicPlanLimits(): Promise<
  Record<'free' | 'starter' | 'pro' | 'pro_team' | 'premium', PublicPlanLimitRow>
> {
  try {
    const res = await fetch(`${getApiBaseUrl().replace(/\/$/, '')}/public/plan-limits`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return DEFAULT_PUBLIC_PLAN_LIMITS;
    const data = (await res.json()) as PublicPlanLimitsResponse;
    if (!data?.plans?.length) return DEFAULT_PUBLIC_PLAN_LIMITS;
    return toMap(data.plans);
  } catch {
    return DEFAULT_PUBLIC_PLAN_LIMITS;
  }
}

export function formatRestaurantsLine(limit: number): string {
  if (limit === 1) return '1 restaurante';
  return `${limit} restaurantes`;
}

export function formatMenusLine(limit: number): string {
  if (limit === -1) return 'Menús ilimitados';
  return `Hasta ${limit} menús`;
}

export function formatProductsLine(limit: number): string {
  if (limit === -1) return 'Productos ilimitados';
  return `Hasta ${limit} productos`;
}
