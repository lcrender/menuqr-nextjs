import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);

  constructor(private readonly config: ConfigService) {}

  private getSecret(): string {
    return (this.config.get<string>('GOOGLE_RECAPTCHA_SECRET_KEY') || '').trim();
  }

  /**
   * Umbral v3 (0–1). Registro por defecto 0.2 (usuarios reales a menudo caen bajo 0.5).
   * Override: GOOGLE_RECAPTCHA_MIN_SCORE
   */
  private getRegisterMinScore(): number {
    const raw = this.config.get<string | number>('GOOGLE_RECAPTCHA_MIN_SCORE');
    if (raw === undefined || raw === null || raw === '') return 0.2;
    const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
    if (!Number.isFinite(n)) return 0.2;
    return Math.min(1, Math.max(0, n));
  }

  /** Formulario público: el secret debe estar configurado. */
  async verifyRequired(token: string, remoteip?: string): Promise<void> {
    const secret = this.getSecret();
    if (!secret) {
      throw new BadRequestException(
        'No se puede enviar el formulario en este momento. Falta configurar reCAPTCHA en el servidor.',
      );
    }
    // Contacto / premium: un poco más estricto que el registro.
    await this.verifyWithSecret(secret, token, remoteip, { minScore: Math.max(this.getRegisterMinScore(), 0.3) });
  }

  /**
   * Registro: si hay secret en servidor, exige token y valida (v3 + action).
   * Si no hay secret (desarrollo), no hace nada.
   */
  async verifyOptionalForRegister(
    token: string | undefined,
    remoteip: string | undefined,
    opts: { expectedAction: string },
  ): Promise<void> {
    const secret = this.getSecret();
    if (!secret) return;
    const t = (token || '').trim();
    if (!t) {
      throw new BadRequestException('Falta validar reCAPTCHA en el registro.');
    }
    await this.verifyWithSecret(secret, t, remoteip, {
      expectedAction: opts.expectedAction,
      minScore: this.getRegisterMinScore(),
    });
  }

  private async verifyWithSecret(
    secret: string,
    token: string,
    remoteip: string | undefined,
    options: { expectedAction?: string; minScore?: number },
  ): Promise<void> {
    const minScore = options.minScore ?? 0.5;
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteip ? { remoteip } : {}),
      }),
    });
    if (!verifyRes.ok) {
      this.logger.warn(`reCAPTCHA siteverify HTTP ${verifyRes.status}`);
      throw new BadRequestException('No se pudo validar reCAPTCHA. Intentá nuevamente.');
    }
    const verifyJson = (await verifyRes.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      hostname?: string;
      'error-codes'?: string[];
    };
    if (!verifyJson.success) {
      this.logger.warn(
        `reCAPTCHA rejected: error-codes=${JSON.stringify(verifyJson['error-codes'] || [])} hostname=${verifyJson.hostname || '-'}`,
      );
      throw new BadRequestException('No se pudo validar reCAPTCHA. Intentá nuevamente.');
    }
    const score = typeof verifyJson.score === 'number' ? verifyJson.score : 0;
    if (score < minScore) {
      this.logger.warn(
        `reCAPTCHA low score: score=${score} min=${minScore} action=${verifyJson.action || '-'} hostname=${verifyJson.hostname || '-'}`,
      );
      throw new BadRequestException('No se pudo validar reCAPTCHA. Intentá nuevamente.');
    }
    if (options.expectedAction != null && verifyJson.action !== options.expectedAction) {
      this.logger.warn(
        `reCAPTCHA action mismatch: got=${verifyJson.action || '-'} expected=${options.expectedAction}`,
      );
      throw new BadRequestException('No se pudo validar reCAPTCHA. Intentá nuevamente.');
    }
  }
}
