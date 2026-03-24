import { ConfigService } from '@nestjs/config';

/**
 * Lee variables de entorno de forma fiable con Docker + Nest:
 * primero `process.env` (lo que inyecta Compose / el sistema), luego ConfigService.
 */
export function readEnvTrimmed(key: string, config: ConfigService): string | undefined {
  const fromProcess = process.env[key]?.trim();
  if (fromProcess) return fromProcess;
  const fromConfig = config.get<string>(key)?.trim();
  if (fromConfig) return fromConfig;
  return undefined;
}
