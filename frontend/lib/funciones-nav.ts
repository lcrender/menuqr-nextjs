import type { LandingRegion, SpanishLandingRegion } from './landing-region';

/**
 * Manifiesto de la sección pública «Funciones» (nav + páginas /funciones/* y /en/features/*).
 * AR usa «menú»; ES usa «carta» donde corresponde; EN copy en inglés.
 */
export type FuncionesSlug =
  | 'menu-qr-dinamico'
  | 'menu-con-alergenos'
  | 'menu-multidioma'
  | 'programar-menus'
  | 'imprimir-menu'
  | 'gestionar-productos-menu';

export type FuncionesUiLocale = 'es' | 'en';

export type FuncionesCopyMap<T> = Record<'AR' | 'ES' | 'EN', T>;

export type FuncionesSection = {
  slug: FuncionesSlug;
  /** Slug SEO en inglés bajo `/en/features/…` */
  enSlug: string;
  /** Título corto para el dropdown del nav */
  navLabel: FuncionesCopyMap<string>;
  /** H1 de la página de detalle / H2 en el índice */
  title: FuncionesCopyMap<string>;
  /** Texto del botón CTA en el índice */
  ctaLabel: FuncionesCopyMap<string>;
  metaTitle: FuncionesCopyMap<string>;
  metaDescription: FuncionesCopyMap<string>;
  lead: FuncionesCopyMap<string>;
  bullets: FuncionesCopyMap<string[]>;
};

export const FUNCIONES_PATH_ES = '/funciones' as const;
export const FUNCIONES_PATH_EN = '/en/features' as const;
/** Alias histórico → ES */
export const FUNCIONES_PATH = FUNCIONES_PATH_ES;

/** SEO e intro del índice */
export const FUNCIONES_INDEX = {
  ES: {
    metaTitle: 'Funciones para crear y gestionar menús QR | App Menu QR',
    metaDescription:
      'Crea y gestiona la carta digital de tu restaurante: actualiza productos, declara alérgenos, traduce, programa e imprime tus menús QR.',
    h1: 'Funciones para crear y gestionar la carta digital de tu restaurante',
    lead: 'Crea tu menú QR, actualiza productos y precios, informa sobre alérgenos, traduce tu carta y programa qué menús se muestran en cada momento.',
  },
  EN: {
    metaTitle: 'Features to create and manage QR menus | App Menu QR',
    metaDescription:
      'Create and manage your restaurant digital menu: update products, declare allergens, translate, schedule, and print your QR menus.',
    h1: 'Features to create and manage your restaurant digital menu',
    lead: 'Create your QR menu, update products and prices, show allergens, translate your menu, and schedule which menus appear at each time.',
  },
} as const;

/** Rutas antiguas → slug actual (redirects). */
export const FUNCIONES_LEGACY_REDIRECTS: Record<string, FuncionesSlug> = {
  'crear-menu-qr': 'menu-qr-dinamico',
  'declarar-alergenos': 'menu-con-alergenos',
  'traducir-menus': 'menu-multidioma',
  'desactivar-productos': 'gestionar-productos-menu',
  'destacar-productos': 'gestionar-productos-menu',
};

export const FUNCIONES_SECTIONS: FuncionesSection[] = [
  {
    slug: 'menu-qr-dinamico',
    enSlug: 'dynamic-qr-menu',
    navLabel: {
      AR: 'Menú QR dinámico',
      ES: 'Carta QR dinámica',
      EN: 'Dynamic QR menu',
    },
    title: {
      AR: 'Crea un menú QR dinámico y actualízalo en tiempo real',
      ES: 'Crea un menú QR dinámico y actualízalo en tiempo real',
      EN: 'Create a dynamic QR menu and update it in real time',
    },
    ctaLabel: {
      AR: 'Crear menú QR dinámico',
      ES: 'Crear menú QR dinámico',
      EN: 'Create dynamic QR menu',
    },
    metaTitle: {
      AR: 'Menú QR dinámico para restaurantes | Actualiza tu carta',
      ES: 'Menú QR dinámico para restaurantes | Actualiza tu carta',
      EN: 'Dynamic QR Menu for Restaurants | Update Your Menu Instantly',
    },
    metaDescription: {
      AR: 'Crea un menú QR dinámico y actualiza productos, precios e imágenes en tiempo real. Mantén siempre el mismo código QR en tu restaurante.',
      ES: 'Crea un menú QR dinámico y actualiza productos, precios e imágenes en tiempo real. Mantén siempre el mismo código QR en tu restaurante.',
      EN: 'Create a dynamic QR menu and update products, prices, and images in real time. Keep the same QR code in your restaurant forever.',
    },
    lead: {
      AR: 'Armá tu menú digital una vez y mantenelo siempre al día: cambios de precios, platos nuevos o faltantes se reflejan al momento en el QR de la mesa.',
      ES: 'Arma tu carta digital una vez y mantenla siempre al día: cambios de precios, platos nuevos o faltantes se reflejan al momento en el QR de la mesa.',
      EN: 'Build your digital menu once and keep it current: price changes, new dishes, or sold-out items show instantly on the table QR.',
    },
    bullets: {
      AR: [
        'Alta del restaurante con logo, portada y moneda.',
        'Menús por local (almuerzo, cena, barra, etc.).',
        'Secciones y productos con precios e iconos.',
        'Publicación y código QR listo para la mesa.',
      ],
      ES: [
        'Alta del restaurante con logo, portada y moneda.',
        'Cartas por local (comida, cena, barra, etc.).',
        'Secciones y productos con precios e iconos.',
        'Publicación y código QR listo para la mesa.',
      ],
      EN: [
        'Set up your restaurant with logo, cover, and currency.',
        'Menus per venue (lunch, dinner, bar, etc.).',
        'Sections and products with prices and icons.',
        'Publish and get a QR code ready for the table.',
      ],
    },
  },
  {
    slug: 'menu-con-alergenos',
    enSlug: 'allergen-menu',
    navLabel: {
      AR: 'Menú con alérgenos',
      ES: 'Carta con alérgenos',
      EN: 'Allergen menu',
    },
    title: {
      AR: 'Crea un menú con alérgenos claro y fácil de consultar',
      ES: 'Crea un menú con alérgenos claro y fácil de consultar',
      EN: 'Create a clear allergen menu that is easy to check',
    },
    ctaLabel: {
      AR: 'Crear menú con alérgenos',
      ES: 'Crear menú con alérgenos',
      EN: 'Create allergen menu',
    },
    metaTitle: {
      AR: 'Menú con alérgenos para restaurantes | Carta digital QR',
      ES: 'Menú con alérgenos para restaurantes | Carta digital QR',
      EN: 'Allergen Menu for Restaurants | Digital QR Menu',
    },
    metaDescription: {
      AR: 'Añade los alérgenos de cada producto y muéstralos claramente en tu carta digital. Actualiza la información sin cambiar ni reimprimir el QR.',
      ES: 'Añade los alérgenos de cada producto y muéstralos claramente en tu carta digital. Actualiza la información sin cambiar ni reimprimir el QR.',
      EN: 'Add allergens for each product and display them clearly on your digital menu. Update info without changing or reprinting the QR.',
    },
    lead: {
      AR: 'Declará alérgenos e iconos dietéticos en cada producto y mostralos en la carta QR para que el comensal los consulte desde el teléfono.',
      ES: 'Declara alérgenos e iconos dietéticos en cada producto y muéstralos en la carta QR para que el comensal los consulte desde el teléfono.',
      EN: 'Declare allergens and dietary icons on each product and show them on the QR menu so guests can check from their phone.',
    },
    bullets: {
      AR: [
        'Iconos y etiquetas visibles en el menú digital.',
        'Edición por producto desde el panel.',
        'Útil para filtros y lectura rápida en el celular.',
        'Actualizá la información sin cambiar el código QR.',
      ],
      ES: [
        'Iconos y etiquetas visibles en la carta digital.',
        'Edición por producto desde el panel.',
        'Útil para filtros y lectura rápida en el móvil.',
        'Actualiza la información sin cambiar el código QR.',
      ],
      EN: [
        'Icons and labels visible on the digital menu.',
        'Edit per product from the admin panel.',
        'Great for filters and quick reading on mobile.',
        'Update information without changing the QR code.',
      ],
    },
  },
  {
    slug: 'menu-multidioma',
    enSlug: 'multilingual-menu',
    navLabel: {
      AR: 'Menú multidioma',
      ES: 'Carta multidioma',
      EN: 'Multilingual menu',
    },
    title: {
      AR: 'Crea un menú multidioma para tu restaurante',
      ES: 'Crea un menú multidioma para tu restaurante',
      EN: 'Create a multilingual menu for your restaurant',
    },
    ctaLabel: {
      AR: 'Crear mi menú multidioma',
      ES: 'Crear mi menú multidioma',
      EN: 'Create my multilingual menu',
    },
    metaTitle: {
      AR: 'Menú multidioma para restaurantes | Traduce tu carta digital',
      ES: 'Menú multidioma para restaurantes | Traduce tu carta digital',
      EN: 'Multilingual Menu for Restaurants | Translate Your Digital Menu',
    },
    metaDescription: {
      AR: 'Crea un menú multidioma para tu restaurante y muestra la carta en diferentes idiomas desde el mismo código QR. Gestiona todas las traducciones desde un único panel.',
      ES: 'Crea un menú multidioma para tu restaurante y muestra la carta en diferentes idiomas desde el mismo código QR. Gestiona todas las traducciones desde un único panel.',
      EN: 'Create a multilingual menu for your restaurant and show it in different languages from the same QR code. Manage all translations from one panel.',
    },
    lead: {
      AR: 'Traducí la carta digital y permití que cada cliente consulte productos y descripciones en su idioma, con el mismo código QR.',
      ES: 'Traduce la carta digital y permite que cada cliente consulte productos y descripciones en su idioma, con el mismo código QR.',
      EN: 'Translate your digital menu so each guest can browse products and descriptions in their language—same QR code.',
    },
    bullets: {
      AR: [
        'Un único código QR para todos los idiomas.',
        'Selector de idioma visible en la carta.',
        'Gestión de traducciones desde un solo panel.',
        'Traducción automática disponible según el plan contratado.',
      ],
      ES: [
        'Un único código QR para todos los idiomas.',
        'Selector de idioma visible en la carta.',
        'Gestión de traducciones desde un solo panel.',
        'Traducción automática disponible según el plan contratado.',
      ],
      EN: [
        'One QR code for every language.',
        'Language switcher visible on the menu.',
        'Manage translations from a single panel.',
        'Automatic translation available depending on your plan.',
      ],
    },
  },
  {
    slug: 'programar-menus',
    enSlug: 'schedule-menus',
    navLabel: {
      AR: 'Programar menús',
      ES: 'Programar cartas',
      EN: 'Schedule menus',
    },
    title: {
      AR: 'Programa tus menús por días y horarios',
      ES: 'Programa tus cartas por días y horarios',
      EN: 'Schedule your menus by day and time',
    },
    ctaLabel: {
      AR: 'Programar mis menús',
      ES: 'Programar mis cartas',
      EN: 'Schedule my menus',
    },
    metaTitle: {
      AR: 'Programar menús por días y horarios | Carta digital',
      ES: 'Programar menús por días y horarios | Carta digital',
      EN: 'Schedule Menus by Day and Time | Digital Menu',
    },
    metaDescription: {
      AR: 'Programa los menús de tu restaurante por días y horarios. Muestra automáticamente desayunos, almuerzos, cenas o promociones con el mismo código QR.',
      ES: 'Programa los menús de tu restaurante por días y horarios. Muestra automáticamente desayunos, almuerzos, cenas o promociones con el mismo código QR.',
      EN: 'Schedule restaurant menus by day and time. Automatically show breakfast, lunch, dinner, or promos with the same QR code.',
    },
    lead: {
      AR: 'Definí franjas horarias para que el menú correcto aparezca solo cuando corresponde. Ideal si tenés carta de mediodía, noche o menús de fin de semana.',
      ES: 'Define franjas horarias para que la carta correcta aparezca solo cuando corresponde. Ideal si tienes carta de mediodía, noche o cartas de fin de semana.',
      EN: 'Set time windows so the right menu appears only when it should. Ideal for lunch, dinner, or weekend menus.',
    },
    bullets: {
      AR: [
        'Horarios por menú según el día de la semana.',
        'Menos trabajo manual de publicar/despublicar.',
        'El QR siempre apunta al local; cambia lo que se muestra.',
        'Combinable con varios menús en el mismo restaurante.',
      ],
      ES: [
        'Horarios por carta según el día de la semana.',
        'Menos trabajo manual de publicar/despublicar.',
        'El QR siempre apunta al local; cambia lo que se muestra.',
        'Combinable con varias cartas en el mismo restaurante.',
      ],
      EN: [
        'Schedules per menu by day of the week.',
        'Less manual publish/unpublish work.',
        'The QR always points to the venue; what shows changes.',
        'Works with multiple menus in the same restaurant.',
      ],
    },
  },
  {
    slug: 'imprimir-menu',
    enSlug: 'print-menu',
    navLabel: {
      AR: 'Imprimir menú',
      ES: 'Imprimir carta',
      EN: 'Print menu',
    },
    title: {
      AR: 'Crea e imprime la carta de tu restaurante',
      ES: 'Crea e imprime la carta de tu restaurante',
      EN: 'Create and print your restaurant menu',
    },
    ctaLabel: {
      AR: 'Imprimir mi carta',
      ES: 'Imprimir mi carta',
      EN: 'Print my menu',
    },
    metaTitle: {
      AR: 'Imprimir menú de restaurante | Crea tu carta en papel',
      ES: 'Imprimir menú de restaurante | Crea tu carta en papel',
      EN: 'Print Restaurant Menu | Create Your Paper Menu',
    },
    metaDescription: {
      AR: 'Crea e imprime la carta de tu restaurante con los productos y precios de tu menú digital. Elige páginas separadas o categorías continuas.',
      ES: 'Crea e imprime la carta de tu restaurante con los productos y precios de tu menú digital. Elige páginas separadas o categorías continuas.',
      EN: 'Create and print your restaurant menu with products and prices from your digital menu. Choose separate pages or continuous categories.',
    },
    lead: {
      AR: 'Además del QR, podés sacar una versión en papel de tu menú digital: útil para salón, eventos o como respaldo. Elegí el diseño que mejor se adapte a tu local.',
      ES: 'Además del QR, puedes sacar una versión en papel de tu carta digital: útil para salón, eventos o como respaldo. Elige el diseño que mejor se adapte a tu local.',
      EN: 'Besides the QR, you can print a paper version of your digital menu—useful for the dining room, events, or as a backup.',
    },
    bullets: {
      AR: [
        'Carta impresa alineada a tu contenido digital.',
        'Opciones de plantilla / diseño según disponibilidad.',
        'Complementa el menú QR en la mesa.',
        'Ideal para locales híbridos (digital + papel).',
      ],
      ES: [
        'Carta impresa alineada a tu contenido digital.',
        'Opciones de plantilla / diseño según disponibilidad.',
        'Complementa la carta QR en la mesa.',
        'Ideal para locales híbridos (digital + papel).',
      ],
      EN: [
        'Printed menu aligned with your digital content.',
        'Template / layout options as available.',
        'Complements the QR menu at the table.',
        'Ideal for hybrid venues (digital + paper).',
      ],
    },
  },
  {
    slug: 'gestionar-productos-menu',
    enSlug: 'manage-menu-products',
    navLabel: {
      AR: 'Gestionar productos',
      ES: 'Gestionar productos',
      EN: 'Manage products',
    },
    title: {
      AR: 'Desactiva y destaca productos de tu menú',
      ES: 'Desactiva y destaca productos de tu carta',
      EN: 'Disable and highlight products on your menu',
    },
    ctaLabel: {
      AR: 'Gestionar productos del menú',
      ES: 'Gestionar productos de la carta',
      EN: 'Manage menu products',
    },
    metaTitle: {
      AR: 'Gestionar productos del menú digital | Activa y destaca platos',
      ES: 'Gestionar productos del menú digital | Activa y destaca platos',
      EN: 'Manage Digital Menu Products | Enable and Highlight Dishes',
    },
    metaDescription: {
      AR: 'Activa, desactiva y destaca productos de tu menú digital. Controla la disponibilidad de platos y actualiza la carta sin cambiar el código QR.',
      ES: 'Activa, desactiva y destaca productos de tu menú digital. Controla la disponibilidad de platos y actualiza la carta sin cambiar el código QR.',
      EN: 'Enable, disable, and highlight products on your digital menu. Control dish availability and update the menu without changing the QR code.',
    },
    lead: {
      AR: 'Cuando un plato se agota, desactivalo; cuando querés empujar un plato estrella, destacalo. La carta QR se actualiza al instante y no perdés precios ni descripciones.',
      ES: 'Cuando un plato se agota, desactívalo; cuando quieres empujar un plato estrella, destácalo. La carta QR se actualiza al instante y no pierdes precios ni descripciones.',
      EN: 'When a dish sells out, disable it; when you want to push a star dish, highlight it. The QR menu updates instantly without losing prices or descriptions.',
    },
    bullets: {
      AR: [
        'Ocultá productos sin eliminar datos ni precios.',
        'Reactivación rápida cuando vuelve el stock.',
        'Destacá platos estrella, novedades o promociones.',
        'La carta pública se actualiza en tiempo real.',
      ],
      ES: [
        'Oculta productos sin eliminar datos ni precios.',
        'Reactivación rápida cuando vuelve el stock.',
        'Destaca platos estrella, novedades o promociones.',
        'La carta pública se actualiza en tiempo real.',
      ],
      EN: [
        'Hide products without deleting data or prices.',
        'Quick reactivation when stock returns.',
        'Highlight star dishes, new items, or promos.',
        'The public menu updates in real time.',
      ],
    },
  },
];

export const FUNCIONES_SLUGS = FUNCIONES_SECTIONS.map((s) => s.slug);

const EN_SLUG_TO_FUNCIONES: Record<string, FuncionesSlug> = Object.fromEntries(
  FUNCIONES_SECTIONS.map((s) => [s.enSlug, s.slug]),
) as Record<string, FuncionesSlug>;

export function getFuncionesSection(slug: string | undefined | null): FuncionesSection | undefined {
  if (!slug) return undefined;
  return FUNCIONES_SECTIONS.find((s) => s.slug === slug || s.enSlug === slug);
}

export function isFuncionesSlug(slug: string): slug is FuncionesSlug {
  return FUNCIONES_SECTIONS.some((s) => s.slug === slug);
}

export function isFuncionesEnSlug(slug: string): boolean {
  return Boolean(EN_SLUG_TO_FUNCIONES[slug]);
}

export function funcionesSlugFromEnSlug(enSlug: string): FuncionesSlug | null {
  return EN_SLUG_TO_FUNCIONES[enSlug] ?? null;
}

export function funcionesUiLocaleFromRegion(region: LandingRegion): FuncionesUiLocale {
  return region === 'EN' ? 'en' : 'es';
}

export function funcionesPath(locale: FuncionesUiLocale = 'es'): string {
  return locale === 'en' ? FUNCIONES_PATH_EN : FUNCIONES_PATH_ES;
}

export function funcionesPathForRegion(region: LandingRegion | null | undefined): string {
  return funcionesPath(region === 'EN' ? 'en' : 'es');
}

export function funcionesHref(slug?: FuncionesSlug, locale: FuncionesUiLocale = 'es'): string {
  const base = funcionesPath(locale);
  if (!slug) return base;
  if (locale === 'en') {
    const section = getFuncionesSection(slug);
    return `${base}/${section?.enSlug ?? slug}`;
  }
  return `${base}/${slug}`;
}

export function funcionesHrefForRegion(
  slug: FuncionesSlug | undefined,
  region: LandingRegion | null | undefined,
): string {
  return funcionesHref(slug, region === 'EN' ? 'en' : 'es');
}

function normalizePathname(pathname: string | undefined): string {
  if (!pathname) return '';
  return pathname.replace(/\/$/, '').toLowerCase();
}

/** Detecta índice o detalle de funciones (ES o EN). */
export function funcionesLocaleFromPath(pathname: string | undefined): FuncionesUiLocale | null {
  const path = normalizePathname(pathname);
  if (path === FUNCIONES_PATH_ES || path.startsWith(`${FUNCIONES_PATH_ES}/`)) return 'es';
  if (path === FUNCIONES_PATH_EN || path.startsWith(`${FUNCIONES_PATH_EN}/`)) return 'en';
  return null;
}

export function funcionesSlugFromPath(pathname: string | undefined): FuncionesSlug | null {
  const path = normalizePathname(pathname);
  const locale = funcionesLocaleFromPath(path);
  if (!locale) return null;
  const base = funcionesPath(locale);
  if (path === base) return null;
  const rest = path.slice(base.length + 1);
  if (!rest || rest.includes('/')) return null;
  if (locale === 'en') return funcionesSlugFromEnSlug(rest);
  return isFuncionesSlug(rest) ? rest : null;
}

/** Alternate path for language switcher (index ↔ index, detail ↔ detail). */
export function funcionesAlternatePath(
  pathname: string | undefined,
  targetLocale: FuncionesUiLocale,
): string {
  const slug = funcionesSlugFromPath(pathname);
  return funcionesHref(slug ?? undefined, targetLocale);
}

export function buildFuncionesHreflangLinks(
  absoluteBaseUrl: string,
  slug?: FuncionesSlug,
): Array<{ hreflang: string; href: string }> {
  const base = absoluteBaseUrl.replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return [];
  const es = `${base}${funcionesHref(slug, 'es')}`;
  const en = `${base}${funcionesHref(slug, 'en')}`;
  return [
    { hreflang: 'es', href: es },
    { hreflang: 'es-ES', href: es },
    { hreflang: 'es-AR', href: es },
    { hreflang: 'en', href: en },
    { hreflang: 'en-US', href: en },
    { hreflang: 'x-default', href: es },
  ];
}

export function funcionesCopyForRegion<T>(map: FuncionesCopyMap<T>, region: LandingRegion): T {
  if (region === 'EN') return map.EN;
  if (region === 'AR') return map.AR;
  return map.ES;
}

export function funcionesIndexCopy(locale: FuncionesUiLocale) {
  return locale === 'en' ? FUNCIONES_INDEX.EN : FUNCIONES_INDEX.ES;
}

/** @deprecated Prefer SpanishLandingRegion only where AR/ES diverge; EN uses map.EN */
export type { SpanishLandingRegion };
