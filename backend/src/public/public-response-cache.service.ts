import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Vacía la caché de respuestas GET /public/* (CacheInterceptor).
 * Sin esto, tras publicar productos/categorías la página del comercio
 * puede seguir mostrando datos viejos hasta que expire el TTL.
 */
@Injectable()
export class PublicResponseCacheService {
  private readonly logger = new Logger(PublicResponseCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async invalidatePublicResponses(): Promise<void> {
    try {
      const anyCache = this.cache as Cache & {
        reset?: () => Promise<void>;
        clear?: () => Promise<void>;
        store?: { reset?: () => Promise<void>; clear?: () => Promise<void> };
        stores?: Array<{ reset?: () => Promise<void>; clear?: () => Promise<void> }>;
      };

      if (typeof anyCache.reset === 'function') {
        await anyCache.reset();
        return;
      }
      if (typeof anyCache.clear === 'function') {
        await anyCache.clear();
        return;
      }
      if (Array.isArray(anyCache.stores)) {
        for (const store of anyCache.stores) {
          if (typeof store?.clear === 'function') await store.clear();
          else if (typeof store?.reset === 'function') await store.reset();
        }
        return;
      }
      if (typeof anyCache.store?.reset === 'function') {
        await anyCache.store.reset();
        return;
      }
      if (typeof anyCache.store?.clear === 'function') {
        await anyCache.store.clear();
        return;
      }
      this.logger.warn('No hay método disponible para vaciar la caché pública');
    } catch (error) {
      this.logger.warn(
        `Error invalidando caché pública: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
