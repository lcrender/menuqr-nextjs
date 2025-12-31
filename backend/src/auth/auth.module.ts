import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

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

@Module({
  imports: [
    // ========================================
    // MÓDULOS BASE
    // ========================================
    UsersModule,
    TenantsModule,
    EmailModule,
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

    // ========================================
    // RATE LIMITING ESPECÍFICO PARA AUTH
    // ========================================
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000, // 1 minuto
        limit: 5, // 5 intentos por minuto
      },
      {
        name: 'login',
        ttl: 300000, // 5 minutos
        limit: 3, // 3 intentos de login por 5 minutos
      },
    ]),
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

