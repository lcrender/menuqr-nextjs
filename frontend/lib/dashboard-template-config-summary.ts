import { TEMPLATE_CONFIG_SCHEMAS, type TemplateConfigOption } from './template-config-schema';

function optionValueEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  return String(a ?? '') === String(b ?? '');
}

function formatRawForOption(opt: TemplateConfigOption, raw: unknown): string {
  if (opt.type === 'boolean') return raw === true ? 'Sí' : 'No';
  if (opt.type === 'color') {
    const s = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
    return s || '—';
  }
  if (opt.type === 'select' && opt.options) {
    const s = String(raw ?? '');
    const hit = opt.options.find((o) => o.value === s);
    return (hit?.label ?? s) || '—';
  }
  if (raw === undefined || raw === null || raw === '') return '—';
  return String(raw);
}

export type TemplateConfigSummaryLine = {
  id: string;
  label: string;
  valueText: string;
  colorSwatch?: string;
  isDefault: boolean;
};

function schemaKeyForTemplate(templateId: string | null | undefined): string {
  const raw = (templateId || 'classic').toString();
  if (raw in TEMPLATE_CONFIG_SCHEMAS) return raw;
  const lower = raw.toLowerCase();
  const aliases: Record<string, string> = { italianfood: 'italianFood' };
  if (aliases[lower]) return aliases[lower];
  return 'classic';
}

/**
 * Líneas listas para mostrar en el dashboard (valores efectivos: columnas del restaurante + template_config).
 */
export function buildTemplateConfigSummaryLines(
  templateId: string | null | undefined,
  templateConfig: Record<string, unknown> | null | undefined,
  restaurantPrimaryColor?: string | null,
  restaurantSecondaryColor?: string | null,
): TemplateConfigSummaryLine[] {
  const key = schemaKeyForTemplate(templateId);
  const schema: TemplateConfigOption[] =
    TEMPLATE_CONFIG_SCHEMAS[key] ?? TEMPLATE_CONFIG_SCHEMAS.classic ?? [];
  const tc = templateConfig || {};
  const lines: TemplateConfigSummaryLine[] = [];

  for (const opt of schema) {
    let raw: unknown = tc[opt.id];
    if (opt.id === 'primaryColor' && (raw === undefined || raw === null || raw === '')) {
      raw = restaurantPrimaryColor ?? undefined;
    }
    if (opt.id === 'secondaryColor' && (raw === undefined || raw === null || raw === '')) {
      raw = restaurantSecondaryColor ?? undefined;
    }
    if (raw === undefined || raw === null || raw === '') raw = opt.default;

    const valueText = formatRawForOption(opt, raw);
    const isDefault = optionValueEquals(raw, opt.default);
    const colorSwatch =
      opt.type === 'color' && typeof raw === 'string' && /^#[0-9A-Fa-f]{6}$/i.test(raw.trim())
        ? raw.trim()
        : undefined;

    lines.push({
      id: opt.id,
      label: opt.label,
      valueText,
      isDefault,
      ...(colorSwatch !== undefined ? { colorSwatch } : {}),
    });
  }

  return lines;
}

/** Opciones «Mostrar…» / visibilidad para columna dedicada en el dashboard (desktop). */
const DASHBOARD_VISIBILITY_COLUMN_ORDER = [
  'showCoverImage',
  'showLogo',
  'showRestaurantName',
  'showRestaurantDescription',
  'showTranslationFlags',
  'showProductImages',
] as const;

/**
 * Separa colores/tipografía del bloque de visibilidad (portada, logo, nombre, etc.).
 */
export function partitionTemplateSummaryLines(lines: TemplateConfigSummaryLine[]): {
  generalLines: TemplateConfigSummaryLine[];
  visibilityLines: TemplateConfigSummaryLine[];
} {
  const visibilityIds = new Set<string>(DASHBOARD_VISIBILITY_COLUMN_ORDER);
  const byId = new Map(lines.map((l) => [l.id, l]));
  const visibilityLines = DASHBOARD_VISIBILITY_COLUMN_ORDER.map((id) => byId.get(id)).filter(
    (l): l is TemplateConfigSummaryLine => l !== undefined,
  );
  const generalLines = lines.filter((l) => !visibilityIds.has(l.id));
  return { generalLines, visibilityLines };
}
