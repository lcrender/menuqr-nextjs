export const PROMO_PLAN_SLUGS = ['starter', 'pro', 'premium'] as const;
export type PromoPlanSlug = (typeof PROMO_PLAN_SLUGS)[number];

export const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  premium: 'Premium',
  free: 'Free',
};

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

export function formatPlanList(slugs: string[]): string {
  return slugs.map((s) => PLAN_LABELS[s] ?? s).join(', ');
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function formatDateEsAr(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
