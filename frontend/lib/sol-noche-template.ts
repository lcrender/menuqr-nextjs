export type SolNocheColorMode = 'light' | 'dark';

export interface SolNocheTemplateConfig {
  colorMode?: SolNocheColorMode;
  autoDayNightSwitch?: boolean;
  templateTimezone?: string;
  dayStartHour?: number;
  dayEndHour?: number;
  dayLogoUrl?: string;
  nightLogoUrl?: string;
  dayCoverImageUrl?: string;
  nightCoverImageUrl?: string;
  showCoverImage?: boolean;
  showLogo?: boolean;
  showRestaurantName?: boolean;
  showRestaurantDescription?: boolean;
  showProductImages?: boolean;
}

const DEFAULT_DAY_START = 6;
const DEFAULT_DAY_END = 20;

export function resolveSolNocheTimezone(
  templateConfig: SolNocheTemplateConfig | Record<string, unknown> | undefined,
  restaurantTimezone?: string,
): string {
  const tc = templateConfig ?? {};
  const fromConfig = typeof tc.templateTimezone === 'string' ? tc.templateTimezone.trim() : '';
  if (fromConfig) return fromConfig;
  const fromRestaurant = typeof restaurantTimezone === 'string' ? restaurantTimezone.trim() : '';
  return fromRestaurant || 'UTC';
}

export function isDaytimeInTimezone(
  timezone: string,
  dayStartHour = DEFAULT_DAY_START,
  dayEndHour = DEFAULT_DAY_END,
  now = new Date(),
): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).formatToParts(now);
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 12);
    if (dayStartHour === dayEndHour) return true;
    if (dayStartHour < dayEndHour) {
      return hour >= dayStartHour && hour < dayEndHour;
    }
    return hour >= dayStartHour || hour < dayEndHour;
  } catch {
    const hour = now.getHours();
    return hour >= dayStartHour && hour < dayEndHour;
  }
}

export function resolveSolNocheIsDark(args: {
  templateConfig?: SolNocheTemplateConfig | Record<string, unknown>;
  restaurantTimezone?: string;
  now?: Date;
}): boolean {
  const tc = args.templateConfig ?? {};
  const manual = tc.colorMode === 'dark' ? true : tc.colorMode === 'light' ? false : null;
  if (tc.autoDayNightSwitch === true) {
    const tz = resolveSolNocheTimezone(tc, args.restaurantTimezone);
    const start =
      typeof tc.dayStartHour === 'number' && Number.isFinite(tc.dayStartHour)
        ? tc.dayStartHour
        : DEFAULT_DAY_START;
    const end =
      typeof tc.dayEndHour === 'number' && Number.isFinite(tc.dayEndHour)
        ? tc.dayEndHour
        : DEFAULT_DAY_END;
    return !isDaytimeInTimezone(tz, start, end, args.now);
  }
  return manual ?? false;
}

export function resolveSolNocheCoverUrl(args: {
  isDark: boolean;
  coverUrl?: string | null;
  templateConfig?: SolNocheTemplateConfig | Record<string, unknown>;
}): string | null {
  const tc = args.templateConfig ?? {};
  const dayCover = typeof tc.dayCoverImageUrl === 'string' ? tc.dayCoverImageUrl.trim() : '';
  const nightCover = typeof tc.nightCoverImageUrl === 'string' ? tc.nightCoverImageUrl.trim() : '';
  const restaurantCover = typeof args.coverUrl === 'string' ? args.coverUrl.trim() : '';

  if (args.isDark) {
    return nightCover || dayCover || restaurantCover || null;
  }
  return dayCover || nightCover || restaurantCover || null;
}

export function resolveSolNocheLogoUrl(args: {
  isDark: boolean;
  logoUrl?: string | null;
  templateConfig?: SolNocheTemplateConfig | Record<string, unknown>;
}): string | null {
  const tc = args.templateConfig ?? {};
  const dayLogo = typeof tc.dayLogoUrl === 'string' ? tc.dayLogoUrl.trim() : '';
  const nightLogo = typeof tc.nightLogoUrl === 'string' ? tc.nightLogoUrl.trim() : '';
  const restaurantLogo = typeof args.logoUrl === 'string' ? args.logoUrl.trim() : '';

  if (args.isDark) {
    return nightLogo || dayLogo || restaurantLogo || null;
  }
  return dayLogo || nightLogo || restaurantLogo || null;
}

const RECOMMENDED_PRODUCT_LABELS: Record<string, string> = {
  es: 'Producto recomendado',
  en: 'Recommended product',
  it: 'Prodotto consigliato',
  pt: 'Produto recomendado',
  fr: 'Produit recommandé',
  de: 'Empfohlenes Produkt',
};

/** Etiqueta UI del bloque de productos destacados según locale BCP-47 del menú (p. ej. es-ES). */
export function recommendedProductLabelForLocale(locale?: string): string {
  const lang = (locale || 'es-ES').split('-')[0]?.toLowerCase() || 'es';
  return RECOMMENDED_PRODUCT_LABELS[lang] ?? RECOMMENDED_PRODUCT_LABELS.es!;
}

export const SOL_NOCHE_TIMEZONE_OPTIONS = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'America/Montevideo', label: 'Uruguay (Montevideo)' },
  { value: 'America/Santiago', label: 'Chile (Santiago)' },
  { value: 'America/Sao_Paulo', label: 'Brasil (São Paulo)' },
  { value: 'America/Mexico_City', label: 'México (Ciudad de México)' },
  { value: 'America/Bogota', label: 'Colombia (Bogotá)' },
  { value: 'America/Lima', label: 'Perú (Lima)' },
  { value: 'Europe/Madrid', label: 'España (Madrid)' },
  { value: 'UTC', label: 'UTC' },
] as const;
