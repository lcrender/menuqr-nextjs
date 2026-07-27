import { ConfigService } from '@nestjs/config';
import { readEnvTrimmed } from '../common/config/read-env-trimmed';

/** Días de prueba gratis legacy vía env. Default 0: el trial de producto va por cupones. */
export function getMercadoPagoFreeTrialDays(config: ConfigService): number {
  const raw = readEnvTrimmed('MERCADOPAGO_FREE_TRIAL_DAYS', config);
  if (raw === '' || raw == null) return 0;
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 3650);
}
