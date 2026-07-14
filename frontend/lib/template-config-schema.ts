/**
 * Esquema de opciones de configuración por plantilla.
 * Cada plantilla puede definir sus propias opciones; aquí se preestablecen.
 * Los colores principales/secundarios se usan en todas las plantillas (las vistas ya los tienen establecidos).
 */
import { DEFAULT_BEACH_BAR_BACKGROUND_IMAGE } from './beach-bar-template';
import { SOL_NOCHE_TIMEZONE_OPTIONS } from './sol-noche-template';
export type TemplateConfigOptionType = 'boolean' | 'number' | 'string' | 'select' | 'color' | 'image';

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
  /** Solo planes Pro / Pro Team / Premium o rol SUPER_ADMIN (panel plantilla). */
  restrictToPaidPlans?: boolean;
  /** Ruta API para subir imágenes (por defecto template-background). */
  imageUploadPath?: string;
}

export const TEMPLATE_NAMES: Record<string, string> = {
  classic: 'Clásica',
  minimalist: 'Minimalista',
  foodie: 'Foodie',
  burgers: 'Burgers',
  italianFood: 'Italian Food',
  gourmet: 'Gourmet',
  proMobile: 'Modern Food',
  nightClub: 'Neon Club',
  smartFood: 'Smart Food',
  beachBar: 'Beach Life',
  solNoche: 'Sol & Noche',
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

/** Solo plantilla Burgers: tamaño de los títulos de categoría (H2) en el menú público. */
const BURGERS_SECTION_TITLE_SIZE: TemplateConfigOption = {
  id: 'sectionTitleFontSize',
  label: 'Tamaño de letra de los títulos de sección',
  description: 'Tamaño del texto de las categorías del menú (por ejemplo: Hamburguesas, Acompañamientos).',
  type: 'select',
  default: 'medium',
  options: [
    { value: 'small', label: 'Pequeño' },
    { value: 'medium', label: 'Mediano' },
    { value: 'large', label: 'Grande' },
    { value: 'xlarge', label: 'Extra grande' },
  ],
};

/** Visible solo en planes de pago indicados (y super admin); en planes inferiores el menú público sigue mostrando banderas. */
const TRANSLATION_FLAGS_TEMPLATE_OPTIONS: TemplateConfigOption[] = [
  {
    id: 'showTranslationFlags',
    label: 'Mostrar banderas de traducciones',
    description:
      'Si está desactivado, se ocultan los iconos de bandera en el selector de idiomas del menú público cuando hay varias traducciones.',
    type: 'boolean',
    default: true,
    restrictToPaidPlans: true,
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

/** Modern Food: colores, visibilidad del encabezado y fotos de productos. */
const PRO_MOBILE_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  ...VISIBILITY_OPTIONS,
  { id: 'showProductImages', label: 'Mostrar fotos de productos', description: 'Mostrar foto del producto cuando exista (sin placeholder si no hay foto).', type: 'boolean', default: true },
];

/** Night Club: layout móvil oscuro, sin fotos de productos. */
const NIGHT_CLUB_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  ...VISIBILITY_OPTIONS,
];

/** Smart Food: sin portada, filtros de alérgenos en menú público. */
const SMART_FOOD_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  { id: 'showLogo', label: 'Mostrar logo', description: 'Mostrar el logo del restaurante.', type: 'boolean', default: true },
  { id: 'showRestaurantName', label: 'Mostrar nombre del restaurante', description: 'Mostrar el nombre del restaurante.', type: 'boolean', default: true },
  { id: 'showRestaurantDescription', label: 'Mostrar descripción del restaurante', description: 'Mostrar la descripción del restaurante.', type: 'boolean', default: true },
];

/** Beach Life: fondo configurable por restaurante, cards horizontales sobre playa. */
const BEACH_BAR_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  {
    id: 'backgroundImageUrl',
    label: 'Imagen de fondo',
    description: 'Foto de fondo a pantalla completa. Cada restaurante puede tener la suya.',
    type: 'image',
    default: DEFAULT_BEACH_BAR_BACKGROUND_IMAGE,
  },
  { id: 'showLogo', label: 'Mostrar logo', description: 'Mostrar el logo del restaurante.', type: 'boolean', default: true },
  { id: 'showRestaurantName', label: 'Mostrar nombre del restaurante', description: 'Mostrar el nombre del restaurante.', type: 'boolean', default: true },
  { id: 'showRestaurantDescription', label: 'Mostrar descripción del restaurante', description: 'Mostrar la descripción del restaurante.', type: 'boolean', default: true },
  { id: 'showProductImages', label: 'Mostrar fotos de productos', description: 'Mostrar foto del producto cuando exista.', type: 'boolean', default: true },
];

/** Sol & Noche: modo claro/oscuro, portadas día/noche y productos destacados. */
const SOL_NOCHE_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  {
    id: 'colorMode',
    label: 'Modo de color',
    description: 'Apariencia base de la carta cuando no está activo el cambio automático por horario.',
    type: 'select',
    default: 'light',
    options: [
      { value: 'light', label: 'Claro' },
      { value: 'dark', label: 'Oscuro' },
    ],
  },
  {
    id: 'autoDayNightSwitch',
    label: 'Cambiar según horario día/noche',
    description: 'Alterna entre modo claro y oscuro según el uso horario y las horas configuradas.',
    type: 'boolean',
    default: false,
  },
  {
    id: 'templateTimezone',
    label: 'Uso horario',
    description: 'Zona horaria para calcular si es día o noche. Si no se define, usa la del restaurante.',
    type: 'select',
    default: 'America/Argentina/Buenos_Aires',
    options: SOL_NOCHE_TIMEZONE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  },
  {
    id: 'dayStartHour',
    label: 'Hora de inicio del día',
    description: 'Hora local desde la cual se considera día (modo claro). Valor de 0 a 23.',
    type: 'number',
    default: 6,
  },
  {
    id: 'dayEndHour',
    label: 'Hora de fin del día',
    description: 'Hora local desde la cual comienza la noche (modo oscuro). Valor de 0 a 23.',
    type: 'number',
    default: 20,
  },
  {
    id: 'dayLogoUrl',
    label: 'Logo (modo claro)',
    description: 'Logo para el modo claro. Si no se define, usa el logo del restaurante.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-logo-day',
  },
  {
    id: 'nightLogoUrl',
    label: 'Logo (modo oscuro)',
    description: 'Logo para el modo oscuro. Si no se define, usa el logo de día o el del restaurante.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-logo-night',
  },
  {
    id: 'dayCoverImageUrl',
    label: 'Portada de día',
    description: 'Imagen de portada para el modo claro. Tiene prioridad sobre la portada del restaurante.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-cover-day',
  },
  {
    id: 'nightCoverImageUrl',
    label: 'Portada de noche',
    description: 'Imagen de portada para el modo oscuro. Tiene prioridad sobre la portada del restaurante.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-cover-night',
  },
  ...VISIBILITY_OPTIONS,
  { id: 'showProductImages', label: 'Mostrar fotos de productos', description: 'Mostrar foto del producto cuando exista.', type: 'boolean', default: true },
];

/**
 * classic, minimalist y foodie incluyen además opciones de visibilidad (portada, logo, nombre, descripción).
 */
export const TEMPLATE_CONFIG_SCHEMAS: Record<string, TemplateConfigOption[]> = {
  classic: [...COMMON_COLOR_OPTIONS, ...VISIBILITY_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  minimalist: [...COMMON_COLOR_OPTIONS, ...VISIBILITY_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  foodie: [...COMMON_COLOR_OPTIONS, ...VISIBILITY_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  burgers: [...COMMON_COLOR_OPTIONS, BURGERS_SECTION_TITLE_SIZE, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  italianFood: [...COMMON_COLOR_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  gourmet: [...GOURMET_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  proMobile: [...PRO_MOBILE_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  nightClub: [...NIGHT_CLUB_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  smartFood: [...SMART_FOOD_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  beachBar: [...BEACH_BAR_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
  solNoche: [...SOL_NOCHE_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS],
};

/** Valores por defecto del esquema de una plantilla, fusionados con config existente. */
export function buildTemplateConfigDefaults(
  templateId: string,
  existing?: Record<string, unknown> | null,
  restaurantColors?: { primaryColor?: string | null; secondaryColor?: string | null },
): Record<string, unknown> {
  const schema = TEMPLATE_CONFIG_SCHEMAS[templateId] || [];
  const values: Record<string, unknown> = {};
  schema.forEach((opt) => {
    if (existing && existing[opt.id] !== undefined) {
      values[opt.id] = existing[opt.id];
      return;
    }
    values[opt.id] = opt.default;
  });
  if (restaurantColors?.primaryColor) values.primaryColor = restaurantColors.primaryColor;
  if (restaurantColors?.secondaryColor) values.secondaryColor = restaurantColors.secondaryColor;
  return values;
}
