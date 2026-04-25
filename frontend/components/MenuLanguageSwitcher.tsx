import React, { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { MenuLocaleFlagGlyph } from '../lib/menu-locale-flag';

export type MenuLangManifestEntry = {
  locale: string;
  label?: string;
  flagCode?: string;
  /** Si es false, no se ofrece en el menú público (solo admin). Por defecto true. */
  enabledPublic?: boolean;
};

export type MenuTabVariant = 'classic' | 'minimalist' | 'foodie' | 'gourmet' | 'burgers' | 'italianFood';

export type TemplateMenuLocalesProps = {
  locales: string[];
  manifest: MenuLangManifestEntry[];
  value: string;
  onChange: (locale: string) => void;
  primaryColor: string;
  secondaryColor: string;
  menuTabVariant: MenuTabVariant;
  /** Gourmet: misma fuente que las pestañas de menú */
  gourmetFontFamily?: string | undefined;
  /** Si false, no se muestran glifos de bandera (solo etiquetas). Por defecto true. */
  showTranslationFlags?: boolean;
};

export function normalizeMenuTabVariant(template: string | undefined): MenuTabVariant {
  const x = (template || 'classic').toString().toLowerCase().replace(/-/g, '');
  if (x === 'italianfood') return 'italianFood';
  if (x === 'minimalist') return 'minimalist';
  if (x === 'foodie') return 'foodie';
  if (x === 'burgers') return 'burgers';
  if (x === 'gourmet') return 'gourmet';
  return 'classic';
}

type MenuLocalesMenu = {
  availableLocales?: string[];
  translationLanguageManifest?: MenuLangManifestEntry[];
};

type MenuLocalesRestaurant = {
  primaryColor?: string;
  secondaryColor?: string;
  tenantPlan?: string | null;
  templateConfig?: Record<string, unknown> | null;
};

function normalizeTenantPlanKeyForFlags(plan: string | null | undefined): string {
  const raw = (plan || 'free').toString().toLowerCase().trim().replace(/\s+/g, '_');
  return raw === 'proteam' ? 'pro_team' : raw;
}

/** Solo estos planes pueden ocultar banderas vía plantilla; el resto siempre muestra banderas. */
export function tenantPlanAllowsTranslationFlagToggle(plan: string | null | undefined): boolean {
  const p = normalizeTenantPlanKeyForFlags(plan);
  return p === 'pro' || p === 'pro_team' || p === 'premium';
}

function normalizeTemplateConfigForFlags(templateConfig: Record<string, unknown> | string | null | undefined) {
  if (templateConfig === undefined || templateConfig === null) return undefined;
  if (typeof templateConfig === 'object' && !Array.isArray(templateConfig)) {
    return templateConfig as Record<string, unknown>;
  }
  if (typeof templateConfig === 'string') {
    try {
      const o = JSON.parse(templateConfig) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

/** Si el plan no califica, siempre true (mostrar banderas). */
export function resolveShowTranslationFlagGlyphs(
  tenantPlan: string | null | undefined,
  templateConfig: Record<string, unknown> | string | null | undefined,
): boolean {
  if (!tenantPlanAllowsTranslationFlagToggle(tenantPlan)) return true;
  const cfg = normalizeTemplateConfigForFlags(templateConfig);
  const v = cfg?.showTranslationFlags;
  if (v === false) return false;
  return true;
}

/** Props para pasar a las plantillas; `undefined` si no hay selector (un solo idioma público). */
export function buildTemplateMenuLocales(
  menu: MenuLocalesMenu,
  restaurant: MenuLocalesRestaurant,
  template: string | undefined,
  contentLocale: string,
  onChange: (locale: string) => void,
): TemplateMenuLocalesProps | undefined {
  if (!menu.availableLocales || menu.availableLocales.length <= 1) return undefined;
  const tab = normalizeMenuTabVariant(template);
  let primary = restaurant.primaryColor || '#007bff';
  let secondary = restaurant.secondaryColor || '#0056b3';
  if (tab === 'italianFood') {
    primary = '#009246';
    secondary = '#CE2B37';
  }
  const showTranslationFlags = resolveShowTranslationFlagGlyphs(restaurant.tenantPlan, restaurant.templateConfig ?? undefined);
  return {
    locales: menu.availableLocales,
    manifest: menu.translationLanguageManifest || [],
    value: contentLocale,
    onChange,
    primaryColor: primary,
    secondaryColor: secondary,
    menuTabVariant: tab,
    showTranslationFlags,
  };
}

const BCP47 = /^[a-z]{2}-[A-Z]{2}$/;

export function isBcp47MenuLocale(s: string): boolean {
  return BCP47.test((s || '').trim());
}

function menuTabButtonStyle(
  variant: MenuTabVariant,
  active: boolean,
  primary: string,
  _secondary: string,
  gourmetFontFamily?: string,
): CSSProperties {
  const base: CSSProperties = { transition: 'all 0.3s ease' };

  switch (variant) {
    case 'minimalist':
      return {
        ...base,
        borderRadius: '25px',
        padding: '10px 24px',
        fontSize: '0.95rem',
        fontWeight: active ? 400 : 300,
        boxShadow: active ? `0 4px 12px ${primary}50` : 'none',
        border: active ? 'none' : `2px solid ${primary}`,
        color: active ? 'white' : primary,
        background: active ? primary : 'transparent',
      };
    case 'burgers':
      return {
        ...base,
        borderRadius: '50px',
        padding: '14px 32px',
        fontSize: '1rem',
        fontWeight: active ? 700 : 600,
        border: active ? 'none' : `3px solid ${primary}`,
        color: active ? 'white' : primary,
        background: active ? primary : 'transparent',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      };
    case 'italianFood':
      return {
        ...base,
        borderRadius: '8px',
        padding: '12px 28px',
        fontSize: '1.05rem',
        fontWeight: active ? 600 : 500,
        boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        border: active ? 'none' : `2px solid ${primary}`,
        color: active ? 'white' : primary,
        background: active ? primary : 'transparent',
        fontStyle: 'italic',
        fontFamily: "'Playfair Display', serif",
      };
    case 'foodie':
    case 'gourmet':
      return {
        ...base,
        borderRadius: '8px',
        padding: '12px 28px',
        fontSize: '1rem',
        fontWeight: active ? 600 : 400,
        boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        border: active ? 'none' : `1px solid ${primary}`,
        color: active ? 'white' : primary,
        background: active ? primary : 'transparent',
        ...(variant === 'gourmet' && gourmetFontFamily ? { fontFamily: gourmetFontFamily } : {}),
      };
    case 'classic':
    default:
      return {
        ...base,
        borderRadius: '25px',
        padding: '10px 24px',
        fontSize: '0.95rem',
        fontWeight: active ? 600 : 500,
        boxShadow: active ? `0 4px 12px ${primary}50` : 'none',
        border: active ? 'none' : `2px solid ${primary}`,
        color: active ? 'white' : primary,
        background: active ? primary : 'transparent',
      };
  }
}

function localeTabsWrapperStyle(variant: MenuTabVariant): CSSProperties {
  switch (variant) {
    case 'burgers':
      return { marginBottom: '50px' };
    case 'foodie':
    case 'gourmet':
      return { marginBottom: '50px' };
    case 'italianFood':
      return { marginBottom: '40px' };
    case 'minimalist':
      return { marginTop: '30px', marginBottom: '40px' };
    case 'classic':
    default:
      return { marginTop: '30px', marginBottom: '40px' };
  }
}

function localeTabsGap(variant: MenuTabVariant): string {
  if (variant === 'burgers' || variant === 'foodie' || variant === 'gourmet' || variant === 'italianFood') {
    return '12px';
  }
  return '10px';
}

type Props = Partial<TemplateMenuLocalesProps> & {
  className?: string;
};

/**
 * Selector de idioma del contenido del menú.
 * En plantillas públicas pasá `menuTabVariant` + colores para el mismo aspecto que las pestañas de menú.
 */
export default function MenuLanguageSwitcher({
  locales,
  manifest,
  value,
  onChange,
  className,
  primaryColor,
  secondaryColor,
  menuTabVariant,
  gourmetFontFamily,
  showTranslationFlags: showFlagsProp,
}: Props) {
  const showTranslationFlags = showFlagsProp !== false;
  const changeLocale = onChange ?? (() => {});
  const meta = useMemo(() => {
    const m: Record<string, MenuLangManifestEntry> = {};
    (manifest || []).forEach((e) => {
      if (e?.locale) m[e.locale] = e;
    });
    return m;
  }, [manifest]);

  if (!locales || locales.length <= 1) return null;

  const labelFor = (loc: string, mo?: MenuLangManifestEntry) =>
    loc === 'es-ES' ? (mo?.label?.trim() || 'Español') : (mo?.label?.trim() || loc);

  const primary = primaryColor || '#007bff';
  const secondary = secondaryColor || '#0056b3';
  const variant = menuTabVariant || 'classic';

  if (menuTabVariant && primaryColor && secondaryColor) {
    return (
      <div className={`menu-locale-tabs mb-5 ${className || ''}`} style={localeTabsWrapperStyle(variant)}>
        <div className="d-flex flex-wrap gap-2" style={{ gap: localeTabsGap(variant), justifyContent: 'center' }}>
          {locales.map((loc) => {
            const active = loc === value;
            const mo = meta[loc];
            return (
              <button
                key={loc}
                type="button"
                onClick={() => changeLocale(loc)}
                aria-pressed={active}
                className="btn"
                style={menuTabButtonStyle(variant, active, primary, secondary, gourmetFontFamily)}
              >
                {showTranslationFlags && (
                  <span className="me-1" aria-hidden>
                    <MenuLocaleFlagGlyph flagCode={mo?.flagCode} locale={loc} />
                  </span>
                )}
                <span>{labelFor(loc, mo)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`menu-language-switcher d-flex flex-wrap justify-content-center align-items-center gap-2 py-2 px-3 ${className || ''}`}
      style={{
        background: 'rgba(0,0,0,0.04)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
      role="navigation"
      aria-label="Idioma del menú"
    >
      <span className="small text-muted me-1 d-none d-sm-inline">Menú:</span>
      {locales.map((loc) => {
        const active = loc === value;
        const mo = meta[loc];
        return (
          <button
            key={loc}
            type="button"
            className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => changeLocale(loc)}
            aria-pressed={active}
          >
            {showTranslationFlags && (
              <span className="me-1" aria-hidden>
                <MenuLocaleFlagGlyph flagCode={mo?.flagCode} locale={loc} />
              </span>
            )}
            <span>{labelFor(loc, mo)}</span>
          </button>
        );
      })}
    </div>
  );
}
