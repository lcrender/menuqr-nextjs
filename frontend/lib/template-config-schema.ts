/**
 * Esquema de opciones de configuración por plantilla.
 * Cada plantilla puede definir sus propias opciones; aquí se preestablecen.
 * Los colores principales/secundarios se usan en todas las plantillas (las vistas ya los tienen establecidos).
 */
import {
  DEFAULT_BEACH_BAR_BACKGROUND_ID,
  beachBarBackgroundSelectOptions,
} from './beach-bar-template';
import {
  DEFAULT_BURGERS_BACKGROUND_ID,
  burgersBackgroundSelectOptions,
} from './burgers-template';
import { SOL_NOCHE_TIMEZONE_OPTIONS } from './sol-noche-template';
import {
  googleFontSelectOptions,
  migrateLegacyTemplateFont,
  TEMPLATE_GOOGLE_FONT_DEFAULT,
} from './template-google-fonts';
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

/** Selector de Google Fonts. El valor por defecto no pisa la fuente de la plantilla. */
const GOOGLE_FONT_TEMPLATE_OPTION: TemplateConfigOption = {
  id: 'googleFont',
  label: 'Fuente',
  description:
    'Por defecto se usa la fuente de la plantilla. Podés reemplazarla por una de Google Fonts.',
  type: 'select',
  default: TEMPLATE_GOOGLE_FONT_DEFAULT,
  options: googleFontSelectOptions(),
};

function withGoogleFont(options: TemplateConfigOption[]): TemplateConfigOption[] {
  return [GOOGLE_FONT_TEMPLATE_OPTION, ...options];
}

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
    description: 'Si está desactivado, no se muestra el logo del comercio.',
    type: 'boolean',
    default: true,
  },
  {
    id: 'showRestaurantName',
    label: 'Mostrar nombre del comercio',
    description: 'Si está desactivado, no se muestra el nombre del comercio.',
    type: 'boolean',
    default: true,
  },
  {
    id: 'showRestaurantDescription',
    label: 'Mostrar descripción del comercio',
    description: 'Si está desactivado, no se muestra la descripción del comercio.',
    type: 'boolean',
    default: true,
  },
];

/** Burgers: fondo a elegir del catálogo, visibilidad + color del nombre. */
const BURGERS_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  {
    id: 'backgroundId',
    label: 'Fondo',
    description: 'Elegí el fondo de pantalla de Burgers.',
    type: 'select',
    default: DEFAULT_BURGERS_BACKGROUND_ID,
    options: burgersBackgroundSelectOptions(),
  },
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
    description: 'Si está desactivado, no se muestra el logo del comercio.',
    type: 'boolean',
    default: true,
  },
  {
    id: 'showRestaurantName',
    label: 'Mostrar nombre del comercio',
    description: 'Si está desactivado, no se muestra el nombre del comercio.',
    type: 'boolean',
    default: true,
  },
  {
    id: 'restaurantNameColor',
    label: 'Color del nombre del comercio',
    description: 'Color del texto del nombre del comercio en la cabecera.',
    type: 'color',
    default: '#2c3e50',
  },
  {
    id: 'showRestaurantDescription',
    label: 'Mostrar descripción del comercio',
    description: 'Si está desactivado, no se muestra la descripción del comercio.',
    type: 'boolean',
    default: true,
  },
];

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

/** Opciones Gourmet: colores y visibilidad (logo, portada, nombre, descripción, fotos). La fuente va en Google Fonts. */
const GOURMET_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  { id: 'showLogo', label: 'Mostrar logo', description: 'Mostrar el logo del comercio.', type: 'boolean', default: true },
  { id: 'showCoverImage', label: 'Mostrar imagen de portada', description: 'Mostrar la imagen de portada.', type: 'boolean', default: true },
  { id: 'showRestaurantName', label: 'Mostrar nombre del comercio', description: 'Mostrar el nombre del comercio.', type: 'boolean', default: true },
  { id: 'showRestaurantDescription', label: 'Mostrar descripción del comercio', description: 'Mostrar la descripción del comercio.', type: 'boolean', default: true },
  { id: 'showProductImages', label: 'Mostrar fotos de productos', description: 'Mostrar foto del producto cuando exista (sin placeholder si no hay foto).', type: 'boolean', default: true },
];

const TEMPLATE_FONT_SIZE_STEPS = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
  { value: 'xlarge', label: 'Extra grande' },
];

function templateFontSizeOption(id: string, label: string, description: string): TemplateConfigOption {
  return {
    id,
    label,
    description,
    type: 'select',
    default: 'medium',
    options: TEMPLATE_FONT_SIZE_STEPS,
  };
}

/** Plantillas con títulos de sección (H2): Classic, Minimalista, Foodie, Burgers, Gourmet, Italian. */
const TYPOGRAPHY_SIZE_SECTION_TITLE: TemplateConfigOption[] = [
  templateFontSizeOption('restaurantNameFontSize', 'Tamaño del nombre', 'Agrandá o achicá el nombre del comercio.'),
  templateFontSizeOption('restaurantDescriptionFontSize', 'Tamaño de la descripción', 'Agrandá o achicá la descripción del comercio.'),
  templateFontSizeOption('sectionTitleFontSize', 'Tamaño de las categorías', 'Agrandá o achicá los títulos de categoría.'),
  templateFontSizeOption('productNameFontSize', 'Tamaño del producto', 'Agrandá o achicá el nombre de los productos.'),
  templateFontSizeOption('productDescriptionFontSize', 'Tamaño de la descripción del producto', 'Agrandá o achicá la descripción de los productos.'),
  templateFontSizeOption('priceFontSize', 'Tamaño del precio', 'Agrandá o achicá los precios.'),
];

/** Plantillas con pestañas laterales/superiores de categoría: Modern Food, Neon Club, Smart Food, Beach, Sol & Noche. */
const TYPOGRAPHY_SIZE_SECTION_TABS: TemplateConfigOption[] = [
  templateFontSizeOption('restaurantNameFontSize', 'Tamaño del nombre', 'Agrandá o achicá el nombre del comercio.'),
  templateFontSizeOption('restaurantDescriptionFontSize', 'Tamaño de la descripción', 'Agrandá o achicá la descripción del comercio.'),
  templateFontSizeOption('sectionTabFontSize', 'Tamaño de las categorías', 'Agrandá o achicá el texto de las categorías.'),
  templateFontSizeOption('productNameFontSize', 'Tamaño del producto', 'Agrandá o achicá el nombre de los productos.'),
  templateFontSizeOption('productDescriptionFontSize', 'Tamaño de la descripción del producto', 'Agrandá o achicá la descripción de los productos.'),
  templateFontSizeOption('priceFontSize', 'Tamaño del precio', 'Agrandá o achicá los precios.'),
];

/** Modern Food: colores, tipografía, visibilidad del encabezado y fotos de productos. */
const PRO_MOBILE_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  ...TYPOGRAPHY_SIZE_SECTION_TABS,
  ...VISIBILITY_OPTIONS,
  { id: 'showProductImages', label: 'Mostrar fotos de productos', description: 'Mostrar foto del producto cuando exista (sin placeholder si no hay foto).', type: 'boolean', default: true },
];

/** Night Club: color principal, color de precios y tamaño de cada texto. Sin fotos de productos. */
const NIGHT_CLUB_OPTIONS: TemplateConfigOption[] = [
  {
    id: 'primaryColor',
    label: 'Color principal',
    description: 'Color de botones, pestañas y elementos destacados.',
    type: 'color',
    default: '#9333ea',
  },
  {
    id: 'backgroundColor',
    label: 'Color de fondo',
    description: 'Color de fondo de Neon Club. No cambia el color principal ni el de los precios.',
    type: 'color',
    default: '#0a0a0f',
  },
  {
    id: 'priceColor',
    label: 'Color de los precios',
    description: 'Color de los precios. No cambia el color principal.',
    type: 'color',
    default: '#9333ea',
  },
  {
    id: 'restaurantNameColor',
    label: 'Color del nombre',
    description: 'Color del nombre del comercio.',
    type: 'color',
    default: '#f4f4f5',
  },
  {
    id: 'restaurantDescriptionColor',
    label: 'Color de la descripción',
    description: 'Color de la descripción del comercio.',
    type: 'color',
    default: '#a1a1aa',
  },
  {
    id: 'sectionTabColor',
    label: 'Color de las categorías',
    description: 'Color del texto de las categorías, incluida la que está seleccionada.',
    type: 'color',
    default: '#71717a',
  },
  {
    id: 'productNameColor',
    label: 'Color de título de Productos',
    description: 'Color del nombre de los productos.',
    type: 'color',
    default: '#f4f4f5',
  },
  {
    id: 'productDescriptionColor',
    label: 'Color de la descripción del producto',
    description: 'Color de la descripción de los productos y del nombre de la variante, el texto que aparece antes del precio.',
    type: 'color',
    default: '#a1a1aa',
  },
  ...TYPOGRAPHY_SIZE_SECTION_TABS,
  ...VISIBILITY_OPTIONS,
];

/** Smart Food: sin portada, filtros de alérgenos en menú público. */
const SMART_FOOD_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  { id: 'showLogo', label: 'Mostrar logo', description: 'Mostrar el logo del comercio.', type: 'boolean', default: true },
  { id: 'showRestaurantName', label: 'Mostrar nombre del comercio', description: 'Mostrar el nombre del comercio.', type: 'boolean', default: true },
  { id: 'showRestaurantDescription', label: 'Mostrar descripción del comercio', description: 'Mostrar la descripción del comercio.', type: 'boolean', default: true },
];

/** Beach Life: fondo a elegir del catálogo, cards horizontales sobre playa. */
const BEACH_BAR_OPTIONS: TemplateConfigOption[] = [
  ...COMMON_COLOR_OPTIONS,
  {
    id: 'backgroundId',
    label: 'Fondo',
    description: 'Elegí el fondo de pantalla de Beach Life.',
    type: 'select',
    default: DEFAULT_BEACH_BAR_BACKGROUND_ID,
    options: beachBarBackgroundSelectOptions(),
  },
  { id: 'showLogo', label: 'Mostrar logo', description: 'Mostrar el logo del comercio.', type: 'boolean', default: true },
  { id: 'showRestaurantName', label: 'Mostrar nombre del comercio', description: 'Mostrar el nombre del comercio.', type: 'boolean', default: true },
  { id: 'showRestaurantDescription', label: 'Mostrar descripción del comercio', description: 'Mostrar la descripción del comercio.', type: 'boolean', default: true },
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
    description: 'Zona horaria para calcular si es día o noche. Si no se define, usa la del comercio.',
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
    description: 'Logo para el modo claro. Si no se define, usa el logo del comercio.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-logo-day',
  },
  {
    id: 'nightLogoUrl',
    label: 'Logo (modo oscuro)',
    description: 'Logo para el modo oscuro. Si no se define, usa el logo de día o el del comercio.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-logo-night',
  },
  {
    id: 'dayCoverImageUrl',
    label: 'Portada de día',
    description: 'Imagen de portada para el modo claro. Tiene prioridad sobre la portada del comercio.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-cover-day',
  },
  {
    id: 'nightCoverImageUrl',
    label: 'Portada de noche',
    description: 'Imagen de portada para el modo oscuro. Tiene prioridad sobre la portada del comercio.',
    type: 'image',
    default: '',
    imageUploadPath: 'template-cover-night',
  },
  ...VISIBILITY_OPTIONS,
  { id: 'showProductImages', label: 'Mostrar fotos de productos', description: 'Mostrar foto del producto cuando exista.', type: 'boolean', default: true },
];

/** Italian Food: colores fijos de bandera. La fuente se elige en Google Fonts. */
const ITALIAN_FOOD_OPTIONS: TemplateConfigOption[] = [];

/**
 * classic, minimalist y foodie incluyen además opciones de visibilidad (portada, logo, nombre, descripción).
 */
export const TEMPLATE_CONFIG_SCHEMAS: Record<string, TemplateConfigOption[]> = {
  classic: withGoogleFont([
    ...COMMON_COLOR_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TITLE,
    ...VISIBILITY_OPTIONS,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
  minimalist: withGoogleFont([
    ...COMMON_COLOR_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TITLE,
    ...VISIBILITY_OPTIONS,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
  foodie: withGoogleFont([
    ...COMMON_COLOR_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TITLE,
    ...VISIBILITY_OPTIONS,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
  burgers: withGoogleFont([
    ...BURGERS_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TITLE,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
  italianFood: withGoogleFont([
    ...ITALIAN_FOOD_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TITLE,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
  gourmet: withGoogleFont([
    ...GOURMET_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TITLE,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
  proMobile: withGoogleFont([...PRO_MOBILE_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS]),
  nightClub: withGoogleFont([...NIGHT_CLUB_OPTIONS, ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS]),
  smartFood: withGoogleFont([
    ...SMART_FOOD_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TABS,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
  beachBar: withGoogleFont([...BEACH_BAR_OPTIONS, ...TYPOGRAPHY_SIZE_SECTION_TABS]),
  solNoche: withGoogleFont([
    ...SOL_NOCHE_OPTIONS,
    ...TYPOGRAPHY_SIZE_SECTION_TABS,
    ...TRANSLATION_FLAGS_TEMPLATE_OPTIONS,
  ]),
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
  if (templateId === 'nightClub') {
    const savedPrice = existing?.priceColor;
    const hasSavedPrice = typeof savedPrice === 'string' && /^#[0-9A-Fa-f]{6}$/.test(savedPrice);
    if (!hasSavedPrice) {
      const primary = values.primaryColor;
      values.priceColor = typeof primary === 'string' && /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : '#9333ea';
    }
  }
  const migratedFont = migrateLegacyTemplateFont(existing);
  if (migratedFont && values.googleFont === TEMPLATE_GOOGLE_FONT_DEFAULT) {
    values.googleFont = migratedFont;
  }
  return values;
}
