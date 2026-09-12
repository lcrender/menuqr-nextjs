import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import {
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_TEMPLATE_DEFINITIONS,
  getEmailTemplateDefinition,
  type EmailTemplateDefinition,
  type EmailTemplateLocaleContent,
} from './email-templates.catalog';

export type EmailTemplateLang = 'es' | 'en';

export type EmailTemplateOverride = Partial<Record<EmailTemplateLang, EmailTemplateLocaleContent>>;

/** Shape guardado en app_settings: { [templateId]: { es?: {...}, en?: {...} } } */
export type EmailTemplateOverrides = Record<string, EmailTemplateOverride>;

const SETTINGS_KEY = 'email_templates_v1';
const CACHE_TTL_MS = 15_000;

@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);
  private cached: { overrides: EmailTemplateOverrides; loadedAt: number } | null = null;

  constructor(private readonly postgres: PostgresService) {}

  invalidateCache() {
    this.cached = null;
  }

  async list() {
    const overrides = await this.getOverrides();

    return {
      categories: EMAIL_TEMPLATE_CATEGORIES,
      templates: EMAIL_TEMPLATE_DEFINITIONS.map((definition) => {
        const override = overrides[definition.id];
        return {
          id: definition.id,
          category: definition.category,
          name: definition.name,
          when: definition.when,
          recipient: definition.recipient,
          note: definition.note ?? null,
          locales: this.availableLocales(definition),
          hasOverride: this.hasContent(override),
          sendUsesOverride: definition.sendUsesOverride,
          wrapInShell: definition.wrapInShell,
          variableKeys: definition.variables.map((v) => v.key),
        };
      }),
    };
  }

  async getOne(id: string) {
    const definition = this.requireDefinition(id);
    const overrides = await this.getOverrides();
    const override = overrides[id];
    const locales = this.availableLocales(definition);

    const content: Record<string, EmailTemplateLocaleContent & { isOverridden: boolean }> = {};
    for (const lang of locales) {
      const fallback = definition.defaults[lang] ?? definition.defaults.es;
      const patch = override?.[lang];
      content[lang] = {
        subject: patch?.subject ?? fallback.subject,
        bodyHtml: patch?.bodyHtml ?? fallback.bodyHtml,
        isOverridden: Boolean(patch?.subject || patch?.bodyHtml),
      };
    }

    return {
      id: definition.id,
      category: definition.category,
      name: definition.name,
      when: definition.when,
      recipient: definition.recipient,
      note: definition.note ?? null,
      wrapInShell: definition.wrapInShell,
      sendUsesOverride: definition.sendUsesOverride,
      locales,
      variables: definition.variables,
      defaults: definition.defaults,
      content,
      isOverridden: this.hasContent(override),
    };
  }

  async update(id: string, patch: EmailTemplateOverride) {
    const definition = this.requireDefinition(id);
    const locales = this.availableLocales(definition);

    const next: EmailTemplateOverride = {};
    for (const lang of ['es', 'en'] as EmailTemplateLang[]) {
      const incoming = patch[lang];
      if (!incoming) continue;
      if (!locales.includes(lang)) {
        throw new BadRequestException(`La plantilla "${id}" no tiene versión en "${lang}".`);
      }
      next[lang] = {
        subject: this.requireNonEmpty(incoming.subject, `${lang}.subject`),
        bodyHtml: this.requireNonEmpty(incoming.bodyHtml, `${lang}.bodyHtml`),
      };
    }

    if (Object.keys(next).length === 0) {
      throw new BadRequestException('No se recibió contenido para guardar.');
    }

    const overrides = await this.getOverrides();
    const merged: EmailTemplateOverrides = {
      ...overrides,
      [id]: { ...(overrides[id] ?? {}), ...next },
    };

    await this.persist(merged);
    return this.getOne(id);
  }

  async reset(id: string) {
    this.requireDefinition(id);
    const overrides = await this.getOverrides();
    if (overrides[id]) {
      const merged = { ...overrides };
      delete merged[id];
      await this.persist(merged);
    }
    return this.getOne(id);
  }

  /** Contenido efectivo (default + override) para enviar un email. */
  async resolveContent(
    id: string,
    lang: EmailTemplateLang,
  ): Promise<{ subject: string; bodyHtml: string; wrapInShell: boolean }> {
    const definition = this.requireDefinition(id);
    const fallback = definition.defaults[lang] ?? definition.defaults.es;

    let override: EmailTemplateOverride | undefined;
    try {
      const overrides = await this.getOverrides();
      override = overrides[id];
    } catch (e) {
      this.logger.warn(`No se pudieron leer overrides de plantillas (${id}): ${e}`);
    }

    const patch = override?.[lang] ?? (lang === 'en' ? undefined : override?.es);

    return {
      subject: patch?.subject?.trim() ? patch.subject : fallback.subject,
      bodyHtml: patch?.bodyHtml?.trim() ? patch.bodyHtml : fallback.bodyHtml,
      wrapInShell: definition.wrapInShell,
    };
  }

  /**
   * Reemplaza `{{key}}` por su valor. Escapa HTML salvo que la variable esté
   * marcada con `allowHtml` en el catálogo o venga en `allowedHtmlKeys`.
   * `htmlSource` acepta el id de la plantilla, su definición o un Set de claves.
   */
  interpolate(
    template: string,
    vars: Record<string, string>,
    htmlSource?: string | EmailTemplateDefinition | Set<string>,
  ): string {
    const allowedHtmlKeys = this.resolveAllowedHtmlKeys(htmlSource);

    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
      if (!Object.prototype.hasOwnProperty.call(vars, key)) return match;
      const raw = vars[key] ?? '';
      return allowedHtmlKeys.has(key) ? raw : this.escapeHtml(raw);
    });
  }

  private resolveAllowedHtmlKeys(
    htmlSource?: string | EmailTemplateDefinition | Set<string>,
  ): Set<string> {
    if (!htmlSource) return new Set();
    if (htmlSource instanceof Set) return htmlSource;

    const definition =
      typeof htmlSource === 'string' ? getEmailTemplateDefinition(htmlSource) : htmlSource;
    if (!definition) return new Set();

    return new Set(definition.variables.filter((v) => v.allowHtml).map((v) => v.key));
  }

  private requireDefinition(id: string): EmailTemplateDefinition {
    const definition = getEmailTemplateDefinition(id);
    if (!definition) throw new NotFoundException(`Plantilla de email "${id}" inexistente.`);
    return definition;
  }

  private requireNonEmpty(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`El campo "${field}" no puede estar vacío.`);
    }
    return value;
  }

  private availableLocales(definition: EmailTemplateDefinition): EmailTemplateLang[] {
    return definition.defaults.en ? ['es', 'en'] : ['es'];
  }

  private hasContent(override?: EmailTemplateOverride): boolean {
    if (!override) return false;
    return Boolean(
      override.es?.subject || override.es?.bodyHtml || override.en?.subject || override.en?.bodyHtml,
    );
  }

  private async getOverrides(): Promise<EmailTemplateOverrides> {
    const now = Date.now();
    if (this.cached && now - this.cached.loadedAt < CACHE_TTL_MS) return this.cached.overrides;

    const rows = await this.postgres.queryRaw<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
      [SETTINGS_KEY],
    );

    let overrides: EmailTemplateOverrides = {};
    if (rows[0]?.value) {
      try {
        const parsed = JSON.parse(rows[0].value);
        if (parsed && typeof parsed === 'object') overrides = parsed as EmailTemplateOverrides;
      } catch (e) {
        this.logger.warn(`No se pudo parsear settings ${SETTINGS_KEY}: ${e}`);
      }
    }

    this.cached = { overrides, loadedAt: now };
    return overrides;
  }

  private async persist(overrides: EmailTemplateOverrides): Promise<void> {
    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [SETTINGS_KEY, JSON.stringify(overrides)],
    );
    this.invalidateCache();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
