import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { WinstonLogger } from './common/logger/winston.logger';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('🚀 Iniciando MenuQR Backend...');
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: new WinstonLogger(),
      rawBody: true, // necesario para verificar firma de webhooks (PayPal, etc.)
    });

    const configService = app.get(ConfigService);

    // ========================================
    // CONFIGURACIÓN DE SEGURIDAD
    // ========================================
    
    // Helmet para headers de seguridad
    app.use(helmet.default({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // Compresión gzip
    app.use(compression());

    // ========================================
    // CONFIGURACIÓN DE CORS
    // ========================================
    
    const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
    const corsCredentials = configService.get('CORS_CREDENTIALS', 'true') === 'true';
    
    app.enableCors({
      origin: corsOrigin,
      credentials: corsCredentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // ========================================
    // CONFIGURACIÓN DE VALIDACIÓN
    // ========================================
    
    // ValidationPipe personalizado que permite propiedades cuando no hay DTO definido
    class CustomValidationPipe extends ValidationPipe {
      async transform(value: any, metadata: any) {
        // Si no hay tipo definido o es Object/any, saltar validación
        const metatype = metadata?.metatype;
        if (!metatype || metatype === Object || metatype.name === 'Object' || metatype === String || metatype === Number || metatype === Boolean) {
          return value;
        }
        // Para DTOs reales, usar validación normal pero sin forbidNonWhitelisted si es necesario
        return super.transform(value, metadata);
      }
    }

    app.useGlobalPipes(
      new CustomValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // ========================================
    // CONFIGURACIÓN DE GUARDS GLOBALES
    // ========================================
    
    const reflector = app.get(Reflector);
    app.useGlobalGuards(
      new JwtAuthGuard(reflector),
      new RolesGuard(reflector),
    );

    // ========================================
    // CONFIGURACIÓN DE SWAGGER
    // ========================================
    
    if (configService.get('NODE_ENV') !== 'production') {
      const nodeEnv = configService.get('NODE_ENV', 'development');
      const backendUrl = configService.get('BACKEND_URL', 'http://localhost:3001');
      
      const config = new DocumentBuilder()
        .setTitle('MenuQR API')
        .setDescription(
          `API REST moderna para gestión de menús de restaurantes multi-tenant.

**Características principales:**
• Autenticación JWT con refresh tokens
• Multi-tenant con Row Level Security
• Gestión completa de restaurantes y menús
• Almacenamiento de archivos con MinIO
• Generación automática de códigos QR
• Soporte multi-idioma (i18n)
• Caché inteligente para endpoints públicos

**Versión:** 1.0.0 | **Entorno:** ${nodeEnv} | **Base URL:** ${backendUrl}`
        )
        .setVersion('1.0.0')
        .setContact('MenuQR Team', 'https://menuqr.com', 'support@menuqr.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addServer(configService.get('BACKEND_URL', 'http://localhost:3001'), 'Servidor de desarrollo')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Ingresa tu token JWT. Obtén uno mediante el endpoint /auth/login',
            in: 'header',
          },
          'JWT-auth',
        )
        .addTag('auth', 'Autenticación y autorización')
        .addTag('tenants', 'Gestión de tenants')
        .addTag('restaurants', 'Gestión de restaurantes')
        .addTag('menus', 'Gestión de menús')
        .addTag('menu-sections', 'Secciones de menú')
        .addTag('menu-items', 'Productos del menú')
        .addTag('public', 'Endpoints públicos')
        .addTag('media', 'Gestión de archivos')
        .addTag('qr', 'Códigos QR')
        .build();

      const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      });

      // CSS personalizado - Cargar desde archivo externo
      let customCss = '';
      
      try {
        const cssPath = join(__dirname, 'common', 'swagger', 'swagger-custom.css');
        customCss = readFileSync(cssPath, 'utf8');
        logger.log('✅ CSS personalizado cargado correctamente');
      } catch (error) {
        // Fallback a CSS inline mejorado si no se puede cargar el archivo
        logger.warn('⚠️ No se pudo cargar el CSS personalizado, usando fallback');
        customCss = `
          body { background: linear-gradient(135deg, #0a0e27 0%, #0f172a 100%); color: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info .title { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .swagger-ui .opblock { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(51, 65, 85, 0.3); border-radius: 12px; margin-bottom: 20px; transition: all 0.3s ease; }
          .swagger-ui .opblock:hover { border-color: #6366f1; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3); transform: translateY(-2px); }
          .swagger-ui .btn { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 8px; padding: 12px 24px; font-weight: 600; transition: all 0.2s ease; }
          .swagger-ui .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
        `;
      }

      SwaggerModule.setup('api', app, document, {
        customSiteTitle: 'MenuQR API',
        customfavIcon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚡</text></svg>',
        customCss: customCss,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          docExpansion: 'list',
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          tryItOutEnabled: true,
        },
        jsonDocumentUrl: '/api-json',
        yamlDocumentUrl: '/api-yaml',
      });

      logger.log('📚 Swagger disponible en /api');
      logger.log('🎨 Diseño moderno y minimalista aplicado');
    }

    // ========================================
    // CONFIGURACIÓN DE PUERTO
    // ========================================
    // En Docker el servidor debe escuchar en 0.0.0.0 para ser accesible desde el host.
    const port = configService.get('PORT', 3001);
    const host = configService.get('HOST', '0.0.0.0');
    await app.listen(port, host);

    logger.log(`✅ MenuQR Backend iniciado en puerto ${port}`);
    logger.log(`🌐 URL: http://localhost:${port}`);
    
    if (configService.get('NODE_ENV') !== 'production') {
      logger.log(`📚 API Docs: http://localhost:${port}/api`);
    }

    // ========================================
    // MANEJO DE SHUTDOWN GRACEFUL
    // ========================================
    
    const gracefulShutdown = async (signal: string) => {
      logger.log(`🔄 Recibida señal ${signal}, cerrando aplicación...`);
      
      try {
        await app.close();
        logger.log('✅ Aplicación cerrada correctamente');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error durante el cierre:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Error iniciando la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();

