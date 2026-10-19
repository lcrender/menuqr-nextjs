import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicResponseCacheService } from './public-response-cache.service';

/**
 * Caché compartida para GET /public/* e invalidación desde mutaciones admin.
 * Debe ser la misma instancia que usa CacheInterceptor en PublicController.
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      // 5 minutos (ms). Se invalida al crear/editar productos, categorías y menús.
      ttl: 300_000,
      max: 500,
    }),
  ],
  providers: [PublicResponseCacheService],
  exports: [CacheModule, PublicResponseCacheService],
})
export class PublicResponseCacheModule {}
