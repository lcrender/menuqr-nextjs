/**
 * Catálogo de plantillas para admin y páginas públicas (catálogo /plantillas).
 * Mantener sincronizado con las plantillas disponibles en el backend.
 */
export interface TemplateCatalogItem {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
  /** Si es true, solo planes Pro/Premium pueden aplicarla; la vista previa es pública. */
  requiresProOrPremium?: boolean;
}

export const TEMPLATES_CATALOG: TemplateCatalogItem[] = [
  {
    id: 'smartFood',
    name: 'Smart Food',
    description:
      'Diseño claro con filtros de alérgenos, ideal para restaurantes saludables, bowls y opciones conscientes.',
    preview: '🥗',
    category: 'Saludable',
  },
  {
    id: 'beachBar',
    name: 'Beach Life',
    description:
      'Estilo beach bar con foto de fondo configurable, cards horizontales y tipografía cursiva. Ideal para bares de playa y locales costeros. Solo Pro, Pro Team o Premium.',
    preview: '🏖️',
    category: 'Playa',
    requiresProOrPremium: true,
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    description:
      'Diseño limpio y minimalista, ideal para restaurantes con un enfoque elegante y sofisticado.',
    preview: '✨',
    category: 'Contemporáneo',
  },
  {
    id: 'gourmet',
    name: 'Gourmet',
    description:
      'Estilo refinado con tipografías clásicas. Fotos de productos solo cuando existan. Disponible para plan Pro o Premium.',
    preview: '🥂',
    category: 'Gourmet',
    requiresProOrPremium: true,
  },
  {
    id: 'nightClub',
    name: 'Neon Club',
    description:
      'Diseño oscuro optimizado para móvil: secciones en tabs verticales, ideal para bares, discotecas y locales nocturnos. Sin fotos de producto.',
    preview: '🌙',
    category: 'Nocturno',
  },
  {
    id: 'proMobile',
    name: 'Modern Food',
    description:
      'Diseño moderno optimizado para móvil: secciones en tabs verticales, detalle del producto al centro e imagen a la derecha. Disponible para plan Pro, Pro Team o Premium.',
    preview: '📱',
    category: 'Gourmet',
    requiresProOrPremium: true,
  },
  {
    id: 'italianFood',
    name: 'Italian Food',
    description:
      'Diseño elegante con tipografía cursiva y colores de la bandera italiana, perfecto para restaurantes italianos.',
    preview: '🍝',
    category: 'Gourmet',
  },
  {
    id: 'solNoche',
    name: 'Sol & Noche',
    description:
      'Carta con modo claro/oscuro, portadas de día y noche, secciones fijas y productos destacados. Solo Pro o Pro Team.',
    preview: '🌅',
    category: 'Visual',
    requiresProOrPremium: true,
  },
  {
    id: 'foodie',
    name: 'Foodie',
    description: 'Diseño elegante y sofisticado, ideal para restaurantes gourmet.',
    preview: '🍽️',
    category: 'Gourmet',
  },
  {
    id: 'classic',
    name: 'Clásica',
    description:
      'Diseño tradicional y elegante, perfecto para restaurantes que buscan un estilo atemporal.',
    preview: '🎨',
    category: 'Tradicional',
  },
  {
    id: 'burgers',
    name: 'Burgers',
    description:
      'Diseño bold y dinámico estilo hamburguesería, con tipografía impactante y colores vibrantes.',
    preview: '🍔',
    category: 'Casual',
  },
];

export const PREVIEW_IMAGE_BASE = '/preview';
export const PREVIEW_DEFAULT_IMAGE = '/preview/preview-default.svg';
