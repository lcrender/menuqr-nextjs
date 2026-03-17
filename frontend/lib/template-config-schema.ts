/**
 * Esquema de opciones de configuración por plantilla.
 * Cada plantilla puede definir sus propias opciones; aquí se preestablecen.
 * Los colores principales/secundarios se usan en todas las plantillas (las vistas ya los tienen establecidos).
 */
export type TemplateConfigOptionType = 'boolean' | 'number' | 'string' | 'select' | 'color';

export interface TemplateConfigOptionSelect {
  value: string;
  label: string;
}

export interface TemplateConfigOption {
  id: string;
  label: string;
  description?: string;
  type: TemplateConfigOptionType;
  default: unknown;
  options?: TemplateConfigOptionSelect[];
}

export const TEMPLATE_NAMES: Record<string, string> = {
  classic: 'Clásica',
  minimalist: 'Minimalista',
  foodie: 'Foodie',
  burgers: 'Burgers',
  italianFood: 'Italian Food',
  gourmet: 'Gourmet',
};

/** Opciones de color comunes a todas las plantillas (los ejemplos ya usan estos colores). */
const COMMON_COLOR_OPTIONS: TemplateConfigOption[] = [
  {
    id: 'primaryColor',
    label: 'Color principal',
    description: 'Color principal de la plantilla (botones, títulos, elementos destacados).',
    type: 'color',
    default: '#007bff',
  },
  {
    id: 'secondaryColor',
    label: 'Color secundario',
    description: 'Color secundario (acentos, bordes, texto destacado).',
    type: 'color',
    default: '#0056b3',
  },
];

/** Opciones de visibilidad para classic, minimalist y foodie (mostrar u ocultar en la plantilla). */
const VISIBILITY_OPTIONS: TemplateConfigOption[] = [
  {
    id: 'showCoverImage',
    label: 'Mostrar imagen de portada',
    description: 'Si está desactivado, no se muestra la imagen de portada en la plantilla.',
    type: 'boolean',
    default: true,
  },
  {
    id: 'showLogo',
    label: 'Mostrar logo',
    description: 'Si está desactivado, no se muestra el logo del restaurante.',
    type: 'boolean',
    default: true,
  },
  {
    id: 'showRestaurantName',
    label: 'Mostrar nombre del restaurante',
    description: 'Si está desactivado, no se muestra el nombre del restaurante.',
    type: 'boolean',
    default: true,
  },
  {
    id: 'showRestaurantDescription',
    label: 'Mostrar descripción del restaurante',
    description: 'Si está desactivado, no se muestra la descripción del restaurante.',
    type: 'boolean',
    default: true,
  },
];

/** Opciones Gourmet: colores, tipografía clásica y visibilidad (logo, portada, fotos de productos). */
const GOURMET_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  {
    id: 'fontFamily',
    label: 'Tipografía',
    description: 'Fuente clásica para títulos y texto.',
    type: 'select',
    default: 'serif',
    options: [
      { value: 'serif', label: 'Serif (Georgia)' },
      { value: 'sans', label: 'Sans (Helvetica)' },
      { value: 'century', label: 'Century Schoolbook' },
      { value: 'baskerville', label: 'Baskerville' },
      { value: 'palatino', label: 'Palatino' },
    ],
  },
  { id: 'showLogo', label: 'Mostrar logo', description: 'Mostrar el logo del restaurante.', type: 'boolean', default: true },
  { id: 'showCoverImage', label: 'Mostrar imagen de portada', description: 'Mostrar la imagen de portada.', type: 'boolean', default: true },
  { id: 'showProductImages', label: 'Mostrar fotos de productos', description: 'Mostrar foto del producto cuando exista (sin placeholder si no hay foto).', type: 'boolean', default: true },
];

/**
 * Opciones de configuración disponibles por plantilla.
 * classic, minimalist y foodie incluyen además opciones de visibilidad (portada, logo, nombre, descripción).
 */
export const TEMPLATE_CONFIG_SCHEMAS: Record<string, TemplateConfigOption[]> = {
  classic: [...COMMON_COLOR_OPTIONS, ...VISIBILITY_OPTIONS],
  minimalist: [...COMMON_COLOR_OPTIONS, ...VISIBILITY_OPTIONS],
  foodie: [...COMMON_COLOR_OPTIONS, ...VISIBILITY_OPTIONS],
  burgers: [...COMMON_COLOR_OPTIONS],
  italianFood: [...COMMON_COLOR_OPTIONS],
  gourmet: GOURMET_OPTIONS,
};
