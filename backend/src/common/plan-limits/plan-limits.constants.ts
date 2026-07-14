/**
 * Límites por plan del tenant (sincronizar con restaurants, menus y menu-items services).
 * Valores -1 = ilimitado.
 */
export const TENANT_PLAN_KEYS = ['free', 'starter', 'pro', 'pro_team', 'premium'] as const;
export type TenantPlanKey = (typeof TENANT_PLAN_KEYS)[number];

export interface TenantPlanLimitsRow {
  key: TenantPlanKey;
  label: string;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  /**
   * Máximo de ejecuciones de traducción automática (beta) por usuario al mes (todos los menús).
   * 0 = deshabilitado; -1 = ilimitado.
   */
  autoTranslateMonthlyPerUser: number;
  /** Puede usar plantilla Gourmet */
  gourmetTemplate: boolean;
  /** Fotos en productos (MinIO) */
  productPhotosAllowed: boolean;
  /** Habilita la opción "Destacar producto" en el admin (y luego se usa en plantillas). */
  productHighlightAllowed: boolean;
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
  'nightClub',
  'smartFood',
] as const;

/** Solo Pro, Pro Team o Premium (restaurants.service). */
export const GOURMET_TEMPLATE_ID = 'gourmet';

/** Plantilla PRO con layout móvil (tabs laterales). Solo Pro, Pro Team o Premium. */
export const PRO_MOBILE_TEMPLATE_ID = 'proMobile';

/** Plantilla premium estilo beach bar con fondo configurable. Solo Pro, Pro Team o Premium. */
export const BEACH_BAR_TEMPLATE_ID = 'beachBar';

/** Sol & Noche: portada día/noche, destacados y modo claro/oscuro. Solo Pro o Pro Team. */
export const SOL_NOCHE_TEMPLATE_ID = 'solNoche';

export function getTenantPlanLimitsCatalog(): TenantPlanLimitsRow[] {
  return [
    {
      key: 'free',
      label: 'Free',
      restaurantLimit: 1,
      menuLimit: 3,
      productLimit: 30,
      autoTranslateMonthlyPerUser: 0,
      gourmetTemplate: false,
      productPhotosAllowed: false,
      productHighlightAllowed: false,
      proOnlyTemplatesInAdmin: [],
    },
    {
      key: 'starter',
      label: 'Starter',
      restaurantLimit: 1,
      menuLimit: 6,
      productLimit: 60,
      autoTranslateMonthlyPerUser: 0,
      gourmetTemplate: false,
      productPhotosAllowed: false,
      productHighlightAllowed: false,
      proOnlyTemplatesInAdmin: [],
    },
    {
      key: 'pro',
      label: 'Pro',
      restaurantLimit: 3,
      menuLimit: 30,
      productLimit: 300,
      autoTranslateMonthlyPerUser: 6,
      gourmetTemplate: true,
      productPhotosAllowed: true,
      productHighlightAllowed: true,
      proOnlyTemplatesInAdmin: ['gourmet', 'proMobile', 'beachBar', 'solNoche'],
    },
    {
      key: 'pro_team',
      label: 'Pro Team',
      restaurantLimit: 3,
      menuLimit: 30,
      productLimit: 300,
      autoTranslateMonthlyPerUser: 6,
      gourmetTemplate: true,
      productPhotosAllowed: true,
      productHighlightAllowed: true,
      proOnlyTemplatesInAdmin: ['gourmet', 'proMobile', 'beachBar', 'solNoche'],
      note: 'Asignación manual por super admin; no se sobrescribe por webhooks de suscripción.',
    },
    {
      key: 'premium',
      label: 'Premium',
      restaurantLimit: 10,
      menuLimit: -1,
      productLimit: 1200,
      autoTranslateMonthlyPerUser: 6,
      gourmetTemplate: true,
      productPhotosAllowed: true,
      productHighlightAllowed: true,
      proOnlyTemplatesInAdmin: ['gourmet', 'proMobile', 'beachBar', 'solNoche'],
    },
  ];
}
