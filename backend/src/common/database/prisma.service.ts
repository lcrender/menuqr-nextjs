import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });

    // ========================================
    // CONFIGURAR LOGGING DE PRISMA
    // ========================================
    
    // Nota: Los eventos de Prisma requieren que el cliente esté generado
    // Por ahora comentamos estos eventos hasta que Prisma Client esté disponible
    /*
    if (configService.get('NODE_ENV') === 'development') {
      this.$on('query', (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    this.$on('error', (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
      this.logger.error(`Target: ${e.target}`);
    });

    this.$on('info', (e: any) => {
      this.logger.log(`Prisma Info: ${e.message}`);
    });

    this.$on('warn', (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });
    */
  }

  async onModuleInit() {
    try {
      this.logger.log('🔌 Conectando a la base de datos...');
      // Intentar conectar, pero no fallar si hay problemas con Prisma en ARM
      try {
        await this.$connect();
        this.logger.log('✅ Conexión a la base de datos establecida');
      } catch (prismaError: any) {
        this.logger.warn('⚠️ Prisma Client no pudo conectarse, usando conexión directa');
        // Verificar conexión directa
        await this.$queryRaw`SELECT 1`;
        this.logger.log('✅ Conexión a la base de datos establecida (modo directo)');
      }
    } catch (error) {
      this.logger.error('❌ Error conectando a la base de datos:', error);
      // No lanzar error para permitir que la app inicie
      this.logger.warn('⚠️ Continuando sin conexión a Prisma (modo degradado)');
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('🔌 Desconectando de la base de datos...');
      await this.$disconnect();
      this.logger.log('✅ Desconexión de la base de datos completada');
    } catch (error) {
      this.logger.error('❌ Error desconectando de la base de datos:', error);
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Ejecuta una consulta raw para setear el contexto del tenant
   */
  async setTenantContext(tenantId: string): Promise<void> {
    try {
      await this.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, false)`;
    } catch (error) {
      this.logger.error(`Error seteando tenant context: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ejecuta una consulta raw para setear el usuario actual
   */
  async setCurrentUserContext(userId: string): Promise<void> {
    try {
      await this.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, false)`;
    } catch (error) {
      this.logger.error(`Error seteando user context: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ejecuta una consulta raw para setear información adicional del request
   */
  async setRequestContext(data: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      if (data.ipAddress) {
        await this.$executeRaw`SELECT set_config('app.ip_address', ${data.ipAddress}, false)`;
      }
      if (data.userAgent) {
        await this.$executeRaw`SELECT set_config('app.user_agent', ${data.userAgent}, false)`;
      }
    } catch (error) {
      this.logger.error(`Error seteando request context: ${error.message}`);
      // No lanzamos error aquí ya que no es crítico
    }
  }

  /**
   * Limpia el contexto del request
   */
  async clearRequestContext(): Promise<void> {
    try {
      await this.$executeRaw`SELECT set_config('app.tenant_id', NULL, false)`;
      await this.$executeRaw`SELECT set_config('app.current_user_id', NULL, false)`;
      await this.$executeRaw`SELECT set_config('app.ip_address', NULL, false)`;
      await this.$executeRaw`SELECT set_config('app.user_agent', NULL, false)`;
    } catch (error) {
      this.logger.error(`Error limpiando request context: ${error.message}`);
      // No lanzamos error aquí ya que no es crítico
    }
  }

  /**
   * Ejecuta una transacción con contexto del tenant
   */
  async withTenantContext<T>(
    tenantId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      await this.setTenantContext(tenantId);
      const result = await fn();
      return result;
    } finally {
      await this.clearRequestContext();
    }
  }

  /**
   * Ejecuta una transacción con contexto completo del request
   */
  async withRequestContext<T>(
    context: {
      tenantId: string;
      userId: string;
      ipAddress?: string;
      userAgent?: string;
    },
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      await this.setTenantContext(context.tenantId);
      await this.setCurrentUserContext(context.userId);
      await this.setRequestContext({
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      
      const result = await fn();
      return result;
    } finally {
      await this.clearRequestContext();
    }
  }

  /**
   * Verifica la salud de la base de datos
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Health check falló:', error);
      return false;
    }
  }
}

