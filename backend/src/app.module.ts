import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

// Módulos de la aplicación
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenusModule } from './menus/menus.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { MenuSectionsModule } from './menu-sections/menu-sections.module';
import { PublicModule } from './public/public.module';
import { MediaModule } from './media/media.module';
import { QRModule } from './qr/qr.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { TrackingModule } from './tracking/tracking.module';
import { PaymentModule } from './payment/payment.module';

// Módulos comunes
import { DatabaseModule } from './common/database/database.module';
import { CacheModule as CustomCacheModule } from './common/cache/cache.module';
import { LoggerModule } from './common/logger/logger.module';
import { MinioModule } from './common/minio/minio.module';
import { EmailModule } from './common/email/email.module';
import { I18nModule } from './common/i18n/i18n.module';

// Configuración de validación
import { validationSchema } from './common/config/validation.schema';

@Module({
  imports: [
    // ========================================
    // CONFIGURACIÓN BASE
    // ========================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // ========================================
    // MÓDULOS DE INFRAESTRUCTURA
    // ========================================
    DatabaseModule,
    CustomCacheModule,
    LoggerModule,
    MinioModule,
    EmailModule,
    I18nModule,

    // ========================================
    // MÓDULOS DE SEGURIDAD Y RENDIMIENTO
    // ========================================
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: parseInt(config.get('RATE_LIMIT_WINDOW_MS', '900000')),
          limit: parseInt(config.get('RATE_LIMIT_MAX_REQUESTS', '100')),
        }],
      }),
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: parseInt(config.get('CACHE_TTL', '3600')),
        max: 100,
      }),
    }),

    ScheduleModule.forRoot(),
    TerminusModule,

    // ========================================
    // MÓDULOS DE LA APLICACIÓN
    // ========================================
    AuthModule,
    UsersModule,
    TenantsModule,
    RestaurantsModule,
    MenusModule,
    MenuItemsModule,
    MenuSectionsModule,
    PublicModule,
    MediaModule,
    QRModule,
    HealthModule,
    MetricsModule,
    TrackingModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

