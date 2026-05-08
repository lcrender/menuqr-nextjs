import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit {
  private readonly logger = new Logger(PostgresService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get('DATABASE_URL');
    
    // Parsear DATABASE_URL: postgresql://user:password@host:port/database
    const url = new URL(databaseUrl);
    
    this.pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1), // Remover el '/' inicial
      user: url.username,
      password: url.password,
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('🔌 Conectando a la base de datos PostgreSQL...');
      await this.pool.query('SELECT 1');
      this.logger.log('✅ Conexión a PostgreSQL establecida');
    } catch (error) {
      this.logger.error('❌ Error conectando a PostgreSQL:', error);
      throw error;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async queryRaw<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query<T>(text, params);
    return result.rows;
  }

  async executeRaw(text: string, params?: any[]): Promise<void> {
    await this.pool.query(text, params);
  }

  async withTransaction<T>(
    callback: (tx: {
      queryRaw: <R = any>(text: string, params?: any[]) => Promise<R[]>;
      executeRaw: (text: string, params?: any[]) => Promise<void>;
    }) => Promise<T>,
  ): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const tx = {
        queryRaw: async <R = any>(text: string, params?: any[]): Promise<R[]> => {
          const result = await client.query<R>(text, params);
          return result.rows;
        },
        executeRaw: async (text: string, params?: any[]): Promise<void> => {
          await client.query(text, params);
        },
      };
      const out = await callback(tx);
      await client.query('COMMIT');
      return out;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

