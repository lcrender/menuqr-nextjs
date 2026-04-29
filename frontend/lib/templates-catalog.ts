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
    id: 'classic',
    name: 'Clásica',
    description:
      'Diseño tradicional y elegante, perfecto para restaurantes que buscan un estilo atemporal.',
    preview: '🎨',
    category: 'Tradicional',
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
    id: 'foodie',
    name: 'Foodie',
    description: 'Diseño elegante y sofisticado, ideal para restaurantes gourmet.',
    preview: '🍽️',
    category: 'Gourmet',
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
    id: 'burgers',
    name: 'Burgers',
    description:
      'Diseño bold y dinámico estilo hamburguesería, con tipografía impactante y colores vibrantes.',
    preview: '🍔',
    category: 'Casual',
  },
  {
    id: 'italianFood',
    name: 'Italian Food',
    description:
      'Diseño elegante con tipografía cursiva y colores de la bandera italiana, perfecto para restaurantes italianos.',
    preview: '🍝',
    category: 'Gourmet',
  },
];

export const PREVIEW_IMAGE_BASE = '/preview';
export const PREVIEW_DEFAULT_IMAGE = '/preview/preview-default.svg';
