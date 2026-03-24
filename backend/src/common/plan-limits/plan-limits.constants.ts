/**
 * Límites por plan del tenant (sincronizar con restaurants, menus y menu-items services).
 * Valores -1 = ilimitado.
 */
export const TENANT_PLAN_KEYS = ['free', 'basic', 'pro', 'pro_team', 'premium'] as const;
export type TenantPlanKey = (typeof TENANT_PLAN_KEYS)[number];

export interface TenantPlanLimitsRow {
  key: TenantPlanKey;
  label: string;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  /** Puede usar plantilla Gourmet */
  gourmetTemplate: boolean;
  /** Fotos en productos (MinIO) */
  productPhotosAllowed: boolean;
  /** Plantillas Pro de pago en UI (ej. Gourmet en admin) */
  proOnlyTemplatesInAdmin: string[];
  note?: string;
}

/** Plantillas disponibles para todos los planes (sin contar restricciones Gourmet). */
export const STANDARD_TEMPLATE_IDS = [
  'classic',
  'minimalist',
  'foodie',
  'burgers',
  'italianFood',
] as const;

/** Solo Pro, Pro Team o Premium (restaurants.service). */
export const GOURMET_TEMPLATE_ID = 'gourmet';

export function getTenantPlanLimitsCatalog(): TenantPlanLimitsRow[] {
  return [
    {
      key: 'free',
      label: 'Free',
      restaurantLimit: 1,
      menuLimit: 3,
      productLimit: 30,
      gourmetTemplate: false,
      productPhotosAllowed: false,
      proOnlyTemplatesInAdmin: [],
    },
    {
      key: 'basic',
      label: 'Basic',
      restaurantLimit: 1,
      menuLimit: 6,
      productLimit: 60,
      gourmetTemplate: false,
      productPhotosAllowed: false,
      proOnlyTemplatesInAdmin: [],
    },
    {
      key: 'pro',
      label: 'Pro',
      restaurantLimit: 3,
      menuLimit: 30,
      productLimit: 300,
      gourmetTemplate: true,
      productPhotosAllowed: true,
      proOnlyTemplatesInAdmin: ['gourmet'],
    },
    {
      key: 'pro_team',
      label: 'Pro Team',
      restaurantLimit: 3,
      menuLimit: 30,
      productLimit: 300,
      gourmetTemplate: true,
      productPhotosAllowed: true,
      proOnlyTemplatesInAdmin: ['gourmet'],
      note: 'Asignación manual por super admin; no se sobrescribe por webhooks de suscripción.',
    },
    {
      key: 'premium',
      label: 'Premium',
      restaurantLimit: 10,
      menuLimit: -1,
      productLimit: 1200,
      gourmetTemplate: true,
      productPhotosAllowed: true,
      proOnlyTemplatesInAdmin: ['gourmet'],
    },
  ];
}
