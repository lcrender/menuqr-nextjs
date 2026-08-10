/**
 * Contenido ES del artículo: plantilla Smart Food + filtros alimentarios.
 */

export const BLOG_ARTICLE_SMART_FOOD = {
  slug: 'plantilla-smart-food-filtros-alimentarios',
  youtubeVideoId: '7emaNwmnLyI',
  demoHref: '/preview/smart-food',
  featuresHref: '/caracteristicas/smart-food',
  relatedHref: '/funciones/menu-con-alergenos',
  lead: 'App Menu QR suma una nueva plantilla gratuita pensada para negocios que necesitan una carta clara y filtros alimentarios visibles desde el celular.',
  intro:
    'Ya está disponible la plantilla Smart Food. Está orientada a restaurantes, cafeterías y locales saludables que quieren mostrar su carta digital QR de forma ordenada, con navegación por menús y secciones, y con la posibilidad de filtrar productos según preferencias alimentarias.',
  bodyFilters:
    'La novedad principal es el sistema de filtros por tags: cada producto puede llevar etiquetas como sin gluten, sin lactosa, vegetariano, vegano o picante. En la carta pública, el cliente activa uno o más filtros y ve solo los platos compatibles. Si un filtro no aplica a ningún producto del menú, no se muestra, para mantener la interfaz limpia.',
  filterLabels: {
    glutenFree: 'sin gluten',
    lactoseFree: 'sin lactosa',
    vegetarian: 'vegetariano',
    vegan: 'vegano',
    spicy: 'picante',
  },
  closing:
    'Smart Food no usa imagen de portada: prioriza logo, nombre del restaurante, descripción y una lectura rápida de la carta. Es una opción gratuita, ideal si tu propuesta se basa en opciones veganas, sin gluten o menús con distintas restricciones alimentarias.',
  tagTranslationNote:
    'Los nombres de estos tags que vienen por defecto se traducen automáticamente cuando el menú detecta el código de idioma: español, inglés, italiano, francés, alemán y ruso. Así, la carta muestra las etiquetas en el idioma que el cliente está consultando.',
  bullets: [
    'Filtros alimentarios visibles (tags) con opción de limpiar filtros',
    'Nombres de tags por defecto traducidos según el idioma del menú (ES, EN, IT, FR, DE, RU)',
    'Navegación por menús (por ejemplo almuerzo y merienda) y por secciones',
    'Diseño limpio, optimizado para móvil y acceso por código QR',
    'Plantilla gratuita, disponible para todos los planes',
  ],
  ctaDemoLabel: 'Ver demo de Smart Food',
  ctaFeaturesLabel: 'Ver características de la plantilla',
  videoHeading: 'Video: Smart Food en acción',
  videoCaption: 'Recorrido de la plantilla y de los filtros alimentarios.',
  openYoutube: 'Abrir en YouTube',
  videoIframeTitle: 'Plantilla Smart Food: filtros alimentarios en App Menu QR',
  includesHeading: 'Qué incluye',
  relatedBefore: 'También podés leer más sobre',
  relatedLinkLabel: 'menús con alérgenos e iconos dietéticos',
  relatedAfter: 'en la sección de funciones.',
} as const;
