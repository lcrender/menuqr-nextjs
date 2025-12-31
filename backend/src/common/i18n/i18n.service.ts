import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';

export interface TranslationData {
  [key: string]: string | TranslationData;
}

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private translationCache: Map<string, Map<string, TranslationData>> = new Map();

  constructor(private readonly postgres: PostgresService) {}

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
            id, tenant_id, entity_type, entity_id, locale, key, value,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
          )
          ON CONFLICT (tenant_id, entity_type, entity_id, locale, key)
          DO UPDATE SET value = $7, updated_at = NOW()`,
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

      // Limpiar caché
      const cacheKey = `${tenantId}:${entityType}:${entityId}:${locale}`;
      this.translationCache.delete(cacheKey);
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

