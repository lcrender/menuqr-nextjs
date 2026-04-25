import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';

export interface TranslationData {
  [key: string]: string | TranslationData;
}

const MENU_I18N_ENTITY_TYPES = new Set(['menu', 'menu_section', 'menu_item']);

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private translationCache: Map<string, Map<string, TranslationData>> = new Map();

  constructor(private readonly postgres: PostgresService) {}

  private isMenuTranslationEntity(entityType: string): boolean {
    return MENU_I18N_ENTITY_TYPES.has(entityType);
  }

  /**
   * Obtiene las traducciones para una entidad específica
   */
  async getTranslations(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string = 'es-ES',
  ): Promise<TranslationData> {
    const cacheKey = `${tenantId}:${entityType}:${entityId}:${locale}`;

    // Verificar caché
    if (this.translationCache.has(cacheKey)) {
      const cached = this.translationCache.get(cacheKey);
      if (cached) {
        return cached.get(locale) || {};
      }
    }

    try {
      const translations = await this.postgres.queryRaw<any>(
        `SELECT key, value
         FROM translations
         WHERE tenant_id = $1
           AND entity_type = $2
           AND entity_id = $3
           AND locale = $4`,
        [tenantId, entityType, entityId, locale],
      );

      const result: TranslationData = {};
      translations.forEach((t: any) => {
        // Soporte para keys anidadas (ej: "name", "description")
        result[t.key] = t.value;
      });

      // Guardar en caché
      if (!this.translationCache.has(cacheKey)) {
        this.translationCache.set(cacheKey, new Map());
      }
      this.translationCache.get(cacheKey)?.set(locale, result);

      return result;
    } catch (error) {
      this.logger.error(`Error obteniendo traducciones: ${error}`);
      return {};
    }
  }

  /**
   * Por cada key, indica si la fila de traducción está marcada como desactualizada (solo aplica a locales != es-ES).
   */
  async getStaleKeyMap(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string,
  ): Promise<Record<string, boolean>> {
    if (locale === 'es-ES') return {};
    try {
      const rows = await this.postgres.queryRaw<{ key: string; stale: boolean }>(
        `SELECT key, COALESCE(stale, false) AS stale
         FROM translations
         WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3 AND locale = $4`,
        [tenantId, entityType, entityId, locale],
      );
      const out: Record<string, boolean> = {};
      for (const r of rows) {
        if (r.key) out[r.key] = !!r.stale;
      }
      return out;
    } catch (e) {
      this.logger.warn(`getStaleKeyMap omitido (¿migración stale pendiente?): ${e}`);
      return {};
    }
  }

  private async markNonEsLocalesStaleForMenuEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<void> {
    if (!this.isMenuTranslationEntity(entityType)) return;
    try {
      await this.postgres.executeRaw(
        `UPDATE translations
         SET stale = true, stale_at = NOW(), updated_at = NOW()
         WHERE tenant_id = $1
           AND entity_type = $2
           AND entity_id = $3
           AND locale <> 'es-ES'`,
        [tenantId, entityType, entityId],
      );
    } catch (e) {
      this.logger.warn(`markNonEsLocalesStaleForMenuEntity falló: ${e}`);
    }
  }

  /**
   * Guarda o actualiza traducciones para una entidad
   */
  async saveTranslations(
    tenantId: string,
    entityType: string,
    entityId: string,
    translations: { [key: string]: string },
    locale: string = 'es-ES',
  ): Promise<void> {
    try {
      for (const [key, value] of Object.entries(translations)) {
        await this.postgres.executeRaw(
          `INSERT INTO translations (
            id, tenant_id, entity_type, entity_id, locale, key, value, stale, stale_at,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, false, NULL, NOW(), NOW()
          )
          ON CONFLICT (tenant_id, entity_type, entity_id, locale, key)
          DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = NOW(),
            stale = CASE WHEN EXCLUDED.locale <> 'es-ES' THEN false ELSE translations.stale END,
            stale_at = CASE WHEN EXCLUDED.locale <> 'es-ES' THEN NULL ELSE translations.stale_at END`,
          [
            `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            tenantId,
            entityType,
            entityId,
            locale,
            key,
            value,
          ],
        );
      }

      if (locale === 'es-ES' && this.isMenuTranslationEntity(entityType)) {
        await this.markNonEsLocalesStaleForMenuEntity(tenantId, entityType, entityId);
      }

      // Limpiar caché de valores para esta entidad (todas las locales si fue es-ES)
      if (locale === 'es-ES' && this.isMenuTranslationEntity(entityType)) {
        this.clearCache(tenantId, entityType, entityId);
      } else {
        const cacheKey = `${tenantId}:${entityType}:${entityId}:${locale}`;
        this.translationCache.delete(cacheKey);
      }
    } catch (error) {
      this.logger.error(`Error guardando traducciones: ${error}`);
      throw error;
    }
  }

  /**
   * Obtiene el texto traducido o el texto por defecto
   */
  async translate(
    tenantId: string,
    entityType: string,
    entityId: string,
    key: string,
    defaultValue: string,
    locale: string = 'es-ES',
  ): Promise<string> {
    const translations = await this.getTranslations(tenantId, entityType, entityId, locale);
    return (translations[key] as string) || defaultValue;
  }

  /**
   * Limpia el caché de traducciones
   */
  clearCache(tenantId?: string, entityType?: string, entityId?: string): void {
    if (!tenantId) {
      this.translationCache.clear();
      return;
    }

    const prefix = `${tenantId}${entityType ? `:${entityType}` : ''}${entityId ? `:${entityId}` : ''}`;
    for (const key of this.translationCache.keys()) {
      if (key.startsWith(prefix)) {
        this.translationCache.delete(key);
      }
    }
  }
}
