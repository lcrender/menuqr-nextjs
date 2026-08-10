import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Estrategias de autenticación
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

// Servicios
import { AuthService } from './auth.service';
import { JwtAuthService } from './jwt-auth.service';

// Controladores
import { AuthController } from './auth.controller';

// Módulos
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { EmailModule } from '../common/email/email.module';
import { GeoModule } from '../geo/geo.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AdminMessagesModule } from '../admin-messages/admin-messages.module';
import { RecaptchaModule } from '../common/recaptcha/recaptcha.module';

@Module({
  imports: [
    // ========================================
    // MÓDULOS BASE
    // ========================================
    UsersModule,
    TenantsModule,
    EmailModule,
    GeoModule,
    SubscriptionModule,
    AdminMessagesModule,
    RecaptchaModule,
    PassportModule,
    
    // ========================================
    // CONFIGURACIÓN JWT
    // ========================================
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '15m'),
          issuer: 'menuqr',
          audience: 'menuqr-users',
        },
      }),
    }),
    // Rate limit global: AppModule (ThrottlerModule). En AuthController se aplica
    // ThrottlerGuard solo a login/registro/recuperación — no a /auth/me.
  ],

  // ========================================
  // PROVEEDORES
  // ========================================
  providers: [
    AuthService,
    JwtAuthService,
    LocalStrategy,
    JwtStrategy,
  ],

  // ========================================
  // CONTROLADORES
  // ========================================
  controllers: [AuthController],

  // ========================================
  // EXPORTACIONES
  // ========================================
  exports: [
    AuthService,
    JwtAuthService,
    JwtModule,
  ],
})
export class AuthModule {}

