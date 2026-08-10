import type { TFunction } from 'i18next';
import type { TemplateConfigOption } from './template-config-schema';
import { TEMPLATE_NAMES } from './template-config-schema';

/** Clave i18n segura a partir de un value de select (p. ej. IANA timezone). */
export function templateConfigSelectValueKey(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/\//g, '_')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveKey(t: TFunction, key: string, fallback: string): string {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function translateTemplateName(t: TFunction, templateId: string): string {
  const id = templateId || 'classic';
  const fallback = TEMPLATE_NAMES[id] || id;
  return resolveKey(t, `adminTemplates.templateNames.${id}`, fallback);
}

export function translateTemplateConfigOptionLabel(
  t: TFunction,
  option: TemplateConfigOption,
): string {
  return resolveKey(t, `adminTemplates.configOptions.${option.id}.label`, option.label);
}

export function translateTemplateConfigOptionDescription(
  t: TFunction,
  option: TemplateConfigOption,
): string | undefined {
  if (!option.description) return undefined;
  return resolveKey(
    t,
    `adminTemplates.configOptions.${option.id}.description`,
    option.description,
  );
}

export function translateTemplateConfigSelectLabel(
  t: TFunction,
  optionId: string,
  value: string,
  fallbackLabel: string,
): string {
  const valueKey = templateConfigSelectValueKey(value);
  if (!valueKey) return fallbackLabel;
  return resolveKey(
    t,
    `adminTemplates.configOptions.${optionId}.values.${valueKey}`,
    fallbackLabel,
  );
}

export function formatTemplateConfigOptionValue(
  t: TFunction,
  opt: TemplateConfigOption,
  raw: unknown,
): string {
  const empty = resolveKey(t, 'adminTemplates.configOptions.empty', '—');
  if (opt.type === 'boolean') {
    return raw === true
      ? resolveKey(t, 'adminTemplates.configOptions.yes', 'Sí')
      : resolveKey(t, 'adminTemplates.configOptions.no', 'No');
  }
  if (opt.type === 'color') {
    const s = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
    return s || empty;
  }
  if (opt.type === 'select' && opt.options) {
    const s = String(raw ?? '');
    const hit = opt.options.find((o) => o.value === s);
    const fallback = hit?.label ?? s;
    if (!fallback) return empty;
    return translateTemplateConfigSelectLabel(t, opt.id, s, fallback);
  }
  if (raw === undefined || raw === null || raw === '') return empty;
  return String(raw);
}
