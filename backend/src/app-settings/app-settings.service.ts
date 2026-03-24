import { Injectable } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

export const MERCADOPAGO_MODE_KEY = 'mercadopago_mode';

export type MercadoPagoAppMode = 'sandbox' | 'production';

/**
 * Usa SQL vía pg (PostgresService) para no depender de `prisma generate` en Docker
 * cuando el volumen `node_modules` tiene un cliente Prisma desactualizado.
 */
@Injectable()
export class AppSettingsService {
  constructor(private readonly postgres: PostgresService) {}

  async getMercadoPagoMode(): Promise<MercadoPagoAppMode> {
    try {
      const rows = await this.postgres.queryRaw<{ value: string }>(
        `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
        [MERCADOPAGO_MODE_KEY],
      );
      if (rows[0]?.value === 'sandbox') return 'sandbox';
      return 'production';
    } catch {
      return 'production';
    }
  }

  async setMercadoPagoMode(mode: MercadoPagoAppMode): Promise<MercadoPagoAppMode> {
    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [MERCADOPAGO_MODE_KEY, mode],
    );
    return mode;
  }
}
