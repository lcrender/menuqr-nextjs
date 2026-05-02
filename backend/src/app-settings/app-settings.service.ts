import { Injectable } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

export const MERCADOPAGO_MODE_KEY = 'mercadopago_mode';

export type MercadoPagoAppMode = 'sandbox' | 'production';

export const PAYPAL_MODE_KEY = 'paypal_mode';

/** Alineado con la API de PayPal (`PAYPAL_MODE`: sandbox | live). */
export type PayPalAppMode = 'sandbox' | 'live';

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

  /** Valor guardado en BD; `null` si no hay fila (se usa `PAYPAL_MODE` del entorno). */
  async getStoredPayPalMode(): Promise<PayPalAppMode | null> {
    try {
      const rows = await this.postgres.queryRaw<{ value: string }>(
        `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
        [PAYPAL_MODE_KEY],
      );
      const v = rows[0]?.value?.trim().toLowerCase();
      if (v === 'sandbox') return 'sandbox';
      if (v === 'live') return 'live';
      return null;
    } catch {
      return null;
    }
  }

  async setPayPalMode(mode: PayPalAppMode): Promise<PayPalAppMode> {
    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [PAYPAL_MODE_KEY, mode],
    );
    return mode;
  }
}
