import type { LandingRegion } from './landing-region';

/**
 * Manifiesto de la sección pública «Funciones» (nav + páginas /funciones/*).
 * AR usa «menú»; ES usa «carta» donde corresponde en nav/detalle.
 */
export type FuncionesSlug =
  | 'menu-qr-dinamico'
  | 'menu-con-alergenos'
  | 'menu-multidioma'
  | 'programar-menus'
  | 'imprimir-menu'
  | 'gestionar-productos-menu';

export type FuncionesSection = {
  slug: FuncionesSlug;
  /** Título corto para el dropdown del nav */
  navLabel: Record<LandingRegion, string>;
  /** H1 de la página de detalle / H2 en el índice */
  title: Record<LandingRegion, string>;
  /** Texto del botón CTA en el índice */
  ctaLabel: Record<LandingRegion, string>;
  metaTitle: Record<LandingRegion, string>;
  metaDescription: Record<LandingRegion, string>;
  lead: Record<LandingRegion, string>;
  bullets: Record<LandingRegion, string[]>;
};

export const FUNCIONES_PATH = '/funciones' as const;

/** SEO e intro del índice /funciones */
export const FUNCIONES_INDEX = {
  metaTitle: 'Funciones para crear y gestionar menús QR | App Menu QR',
  metaDescription:
    'Crea y gestiona la carta digital de tu restaurante: actualiza productos, declara alérgenos, traduce, programa e imprime tus menús QR.',
  h1: 'Funciones para crear y gestionar la carta digital de tu restaurante',
  lead: 'Crea tu menú QR, actualiza productos y precios, informa sobre alérgenos, traduce tu carta y programa qué menús se muestran en cada momento.',
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
    navLabel: {
      AR: 'Menú QR dinámico',
      ES: 'Carta QR dinámica',
    },
    title: {
      AR: 'Crea un menú QR dinámico y actualízalo en tiempo real',
      ES: 'Crea un menú QR dinámico y actualízalo en tiempo real',
    },
    ctaLabel: {
      AR: 'Crear menú QR dinámico',
      ES: 'Crear menú QR dinámico',
    },
    metaTitle: {
      AR: 'Menú QR dinámico para restaurantes | Actualiza tu carta',
      ES: 'Menú QR dinámico para restaurantes | Actualiza tu carta',
    },
    metaDescription: {
      AR: 'Crea un menú QR dinámico y actualiza productos, precios e imágenes en tiempo real. Mantén siempre el mismo código QR en tu restaurante.',
      ES: 'Crea un menú QR dinámico y actualiza productos, precios e imágenes en tiempo real. Mantén siempre el mismo código QR en tu restaurante.',
    },
    lead: {
      AR: 'Armá tu menú digital una vez y mantenelo siempre al día: cambios de precios, platos nuevos o faltantes se reflejan al momento en el QR de la mesa.',
      ES: 'Arma tu carta digital una vez y mantenla siempre al día: cambios de precios, platos nuevos o faltantes se reflejan al momento en el QR de la mesa.',
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
    },
  },
  {
    slug: 'menu-con-alergenos',
    navLabel: {
      AR: 'Menú con alérgenos',
      ES: 'Carta con alérgenos',
    },
    title: {
      AR: 'Crea un menú con alérgenos claro y fácil de consultar',
      ES: 'Crea un menú con alérgenos claro y fácil de consultar',
    },
    ctaLabel: {
      AR: 'Crear menú con alérgenos',
      ES: 'Crear menú con alérgenos',
    },
    metaTitle: {
      AR: 'Menú con alérgenos para restaurantes | Carta digital QR',
      ES: 'Menú con alérgenos para restaurantes | Carta digital QR',
    },
    metaDescription: {
      AR: 'Añade los alérgenos de cada producto y muéstralos claramente en tu carta digital. Actualiza la información sin cambiar ni reimprimir el QR.',
      ES: 'Añade los alérgenos de cada producto y muéstralos claramente en tu carta digital. Actualiza la información sin cambiar ni reimprimir el QR.',
    },
    lead: {
      AR: 'Declará alérgenos e iconos dietéticos en cada producto y mostralos en la carta QR para que el comensal los consulte desde el teléfono.',
      ES: 'Declara alérgenos e iconos dietéticos en cada producto y muéstralos en la carta QR para que el comensal los consulte desde el teléfono.',
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
    },
  },
  {
    slug: 'menu-multidioma',
    navLabel: {
      AR: 'Menú multidioma',
      ES: 'Carta multidioma',
    },
    title: {
      AR: 'Crea un menú multidioma para tu restaurante',
      ES: 'Crea un menú multidioma para tu restaurante',
    },
    ctaLabel: {
      AR: 'Crear mi menú multidioma',
      ES: 'Crear mi menú multidioma',
    },
    metaTitle: {
      AR: 'Menú multidioma para restaurantes | Traduce tu carta digital',
      ES: 'Menú multidioma para restaurantes | Traduce tu carta digital',
    },
    metaDescription: {
      AR: 'Crea un menú multidioma para tu restaurante y muestra la carta en diferentes idiomas desde el mismo código QR. Gestiona todas las traducciones desde un único panel.',
      ES: 'Crea un menú multidioma para tu restaurante y muestra la carta en diferentes idiomas desde el mismo código QR. Gestiona todas las traducciones desde un único panel.',
    },
    lead: {
      AR: 'Traducí la carta digital y permití que cada cliente consulte productos y descripciones en su idioma, con el mismo código QR.',
      ES: 'Traduce la carta digital y permite que cada cliente consulte productos y descripciones en su idioma, con el mismo código QR.',
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
    },
  },
  {
    slug: 'programar-menus',
    navLabel: {
      AR: 'Programar menús',
      ES: 'Programar cartas',
    },
    title: {
      AR: 'Programa tus menús por días y horarios',
      ES: 'Programa tus cartas por días y horarios',
    },
    ctaLabel: {
      AR: 'Programar mis menús',
      ES: 'Programar mis cartas',
    },
    metaTitle: {
      AR: 'Programar menús por días y horarios | Carta digital',
      ES: 'Programar menús por días y horarios | Carta digital',
    },
    metaDescription: {
      AR: 'Programa los menús de tu restaurante por días y horarios. Muestra automáticamente desayunos, almuerzos, cenas o promociones con el mismo código QR.',
      ES: 'Programa los menús de tu restaurante por días y horarios. Muestra automáticamente desayunos, almuerzos, cenas o promociones con el mismo código QR.',
    },
    lead: {
      AR: 'Definí franjas horarias para que el menú correcto aparezca solo cuando corresponde. Ideal si tenés carta de mediodía, noche o menús de fin de semana.',
      ES: 'Define franjas horarias para que la carta correcta aparezca solo cuando corresponde. Ideal si tienes carta de mediodía, noche o cartas de fin de semana.',
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
    },
  },
  {
    slug: 'imprimir-menu',
    navLabel: {
      AR: 'Imprimir menú',
      ES: 'Imprimir carta',
    },
    title: {
      AR: 'Crea e imprime la carta de tu restaurante',
      ES: 'Crea e imprime la carta de tu restaurante',
    },
    ctaLabel: {
      AR: 'Imprimir mi carta',
      ES: 'Imprimir mi carta',
    },
    metaTitle: {
      AR: 'Imprimir carta del restaurante | App Menu QR',
      ES: 'Imprimir carta del restaurante | App Menu QR',
    },
    metaDescription: {
      AR: 'Generá una versión imprimible de tu menú digital para mesa, carta física o respaldo cuando no hay Wi‑Fi.',
      ES: 'Genera una versión imprimible de tu carta digital para mesa, carta física o respaldo cuando no hay Wi‑Fi.',
    },
    lead: {
      AR: 'Además del QR, podés sacar una versión en papel de tu menú digital: útil para salón, eventos o como respaldo. Elegí el diseño que mejor se adapte a tu local.',
      ES: 'Además del QR, puedes sacar una versión en papel de tu carta digital: útil para salón, eventos o como respaldo. Elige el diseño que mejor se adapte a tu local.',
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
    },
  },
  {
    slug: 'gestionar-productos-menu',
    navLabel: {
      AR: 'Gestionar productos',
      ES: 'Gestionar productos',
    },
    title: {
      AR: 'Desactiva y destaca productos de tu menú',
      ES: 'Desactiva y destaca productos de tu carta',
    },
    ctaLabel: {
      AR: 'Gestionar productos del menú',
      ES: 'Gestionar productos de la carta',
    },
    metaTitle: {
      AR: 'Desactivar y destacar productos | App Menu QR',
      ES: 'Desactivar y destacar productos | App Menu QR',
    },
    metaDescription: {
      AR: 'Ocultá platos sin stock y resaltá novedades o platos estrella en tu menú digital sin rearmar la carta.',
      ES: 'Oculta platos sin stock y resalta novedades o platos estrella en tu carta digital sin rearmar la carta.',
    },
    lead: {
      AR: 'Cuando un plato se agota, desactivalo; cuando querés empujar un plato estrella, destacalo. La carta QR se actualiza al instante y no perdés precios ni descripciones.',
      ES: 'Cuando un plato se agota, desactívalo; cuando quieres empujar un plato estrella, destácalo. La carta QR se actualiza al instante y no pierdes precios ni descripciones.',
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
    },
  },
];

export const FUNCIONES_SLUGS = FUNCIONES_SECTIONS.map((s) => s.slug);

export function getFuncionesSection(slug: string | undefined | null): FuncionesSection | undefined {
  if (!slug) return undefined;
  return FUNCIONES_SECTIONS.find((s) => s.slug === slug);
}

export function isFuncionesSlug(slug: string): slug is FuncionesSlug {
  return FUNCIONES_SECTIONS.some((s) => s.slug === slug);
}

export function funcionesHref(slug?: FuncionesSlug): string {
  if (!slug) return FUNCIONES_PATH;
  return `${FUNCIONES_PATH}/${slug}`;
}

export function funcionesCopyForRegion<T>(map: Record<LandingRegion, T>, region: LandingRegion): T {
  return map[region];
}
