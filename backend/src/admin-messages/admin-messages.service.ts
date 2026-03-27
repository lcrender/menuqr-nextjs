import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { EmailService } from '../common/email/email.service';

type AdminMessageEventKey =
  | 'user_created'
  | 'user_email_verified'
  | 'subscription_created'
  | 'subscription_payment_succeeded'
  | 'subscription_payment_failed';

export type AdminMessagesSettings = {
  receiverEmail: string;
  events: Record<AdminMessageEventKey, boolean>;
};

const SETTINGS_KEY = 'super_admin_messages_v1';

const DEFAULT_SETTINGS: AdminMessagesSettings = {
  receiverEmail: '',
  events: {
    user_created: false,
    user_email_verified: false,
    subscription_created: false,
    subscription_payment_succeeded: false,
    subscription_payment_failed: false,
  },
};

@Injectable()
export class AdminMessagesService {
  private readonly logger = new Logger(AdminMessagesService.name);
  private cached: { settings: AdminMessagesSettings; loadedAt: number } | null = null;

  constructor(
    private readonly postgres: PostgresService,
    private readonly emailService: EmailService,
  ) {}

  invalidateCache() {
    this.cached = null;
  }

  private async getSettings(): Promise<AdminMessagesSettings> {
    const now = Date.now();
    if (this.cached && now - this.cached.loadedAt < 30_000) return this.cached.settings;

    const rows = await this.postgres.queryRaw<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
      [SETTINGS_KEY],
    );

    let parsed: Partial<AdminMessagesSettings> | null = null;
    if (rows[0]?.value) {
      try {
        parsed = JSON.parse(rows[0].value) as Partial<AdminMessagesSettings>;
      } catch (e) {
        this.logger.warn(`No se pudo parsear settings ${SETTINGS_KEY}: ${e}`);
      }
    }

    const settings: AdminMessagesSettings = {
      receiverEmail: String(parsed?.receiverEmail ?? DEFAULT_SETTINGS.receiverEmail),
      events: {
        ...DEFAULT_SETTINGS.events,
        ...(parsed?.events ?? {}),
      },
    };

    this.cached = { settings, loadedAt: now };
    return settings;
  }

  async getCurrentSettings(): Promise<AdminMessagesSettings> {
    return this.getSettings();
  }

  async sendTestEmail(): Promise<{ sent: boolean; to: string }> {
    const settings = await this.getSettings();
    const to = (settings.receiverEmail || '').trim();
    if (!this.validateReceiverEmail(to)) {
      throw new Error('Primero configurá un email válido en "Email destino".');
    }

    const subject = '[MenuQR] Test de notificaciones de Mensajes';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
          .container { max-width: 680px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
          .content { background: #f8fafc; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
          .footer { text-align: center; margin-top: 18px; color: #64748b; font-size: 12px; }
          .tag { display:inline-block; background:#eef2ff; color:#3730a3; padding:4px 10px; border-radius:999px; font-weight:700; font-size:12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">🍽️ MenuQR</h1>
          </div>
          <div class="content">
            <h2 style="margin-top:0;">Prueba de notificaciones</h2>
            <p>Este es un email de prueba desde <strong>Configuración → Mensajes</strong>.</p>
            <p><span class="tag">TEST OK</span></p>
            <p>Fecha: ${new Date().toISOString()}</p>
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} MenuQR</div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendAdminNotificationEmail(to, subject, html);
    return { sent: true, to };
  }

  private validateReceiverEmail(email: string): boolean {
    const e = (email || '').trim();
    // Validación simple; el DTO ya valida en UI.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async getReceiverEmailIfEventEnabled(eventKey: AdminMessageEventKey): Promise<string | null> {
    const settings = await this.getSettings();
    if (!settings.events[eventKey]) return null;
    if (!this.validateReceiverEmail(settings.receiverEmail)) return null;
    return settings.receiverEmail.trim();
  }

  async updateSettings(patch: Partial<AdminMessagesSettings>): Promise<AdminMessagesSettings> {
    const current = await this.getSettings();
    const next: AdminMessagesSettings = {
      receiverEmail: patch.receiverEmail !== undefined ? patch.receiverEmail : current.receiverEmail,
      events: {
        ...current.events,
        ...(patch.events ?? {}),
      },
    };

    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [SETTINGS_KEY, JSON.stringify(next)],
    );

    this.invalidateCache();
    return next;
  }

  async notifyIfEnabled(eventKey: AdminMessageEventKey, actorUser: { id: string; email: string; firstName?: string | null; lastName?: string | null; role?: string; tenantId?: string | null }, extra?: Record<string, unknown>) {
    const to = await this.getReceiverEmailIfEventEnabled(eventKey);
    if (!to) return;

    const subject = this.buildSubject(eventKey, actorUser.email);
    const html = await this.buildHtml(eventKey, actorUser, extra);
    await this.emailService.sendAdminNotificationEmail(to, subject, html);
  }

  private buildSubject(eventKey: AdminMessageEventKey, actorEmail: string): string {
    switch (eventKey) {
      case 'user_created':
        return `[MenuQR] Nuevo usuario creado - ${actorEmail}`;
      case 'user_email_verified':
        return `[MenuQR] Usuario verificó email - ${actorEmail}`;
      case 'subscription_created':
        return `[MenuQR] Nueva suscripción - ${actorEmail}`;
      case 'subscription_payment_succeeded':
        return `[MenuQR] Pago de suscripción exitoso - ${actorEmail}`;
      case 'subscription_payment_failed':
        return `[MenuQR] Falló un pago de suscripción - ${actorEmail}`;
      default:
        return `[MenuQR] Notificación - ${actorEmail}`;
    }
  }

  private async buildHtml(
    eventKey: AdminMessageEventKey,
    actorUser: { id: string; email: string; firstName?: string | null; lastName?: string | null; role?: string; tenantId?: string | null },
    extra?: Record<string, unknown>,
  ): Promise<string> {
    const fullName = [actorUser.firstName, actorUser.lastName].filter(Boolean).join(' ');

    let tenantPlan: string | null = null;
    if (actorUser.tenantId) {
      try {
        const rows = await this.postgres.queryRaw<{ plan: string }>(
          `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
          [actorUser.tenantId],
        );
        tenantPlan = rows[0]?.plan ?? null;
      } catch (e) {
        this.logger.warn(`No se pudo obtener tenant plan para tenantId=${actorUser.tenantId}: ${e}`);
      }
    }

    const eventLabel = this.eventLabel(eventKey);
    const extraHtml = extra && Object.keys(extra).length
      ? `<h3 style="margin-top: 20px; margin-bottom: 8px;">Detalles</h3><pre style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e5e7eb; white-space: pre-wrap;">${this.escapeHtml(JSON.stringify(extra, null, 2))}</pre>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
          .container { max-width: 760px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 26px; border-radius: 12px 12px 0 0; }
          .content { background: #f8fafc; padding: 26px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
          .pill { display:inline-block; background:#eef2ff; color:#3730a3; padding:6px 10px; border-radius:999px; font-size: 13px; font-weight: 700; }
          .kv { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .kv td { border: 1px solid #e5e7eb; padding: 10px; vertical-align: top; }
          .kv td:first-child { font-weight: 700; background: #ffffff; width: 180px; }
          .footer { text-align: center; margin-top: 18px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 20px;">🍽️ MenuQR - Notificaciones</h1>
            <div style="margin-top: 10px;">
              <span class="pill">${this.escapeHtml(eventLabel)}</span>
            </div>
          </div>
          <div class="content">
            <h2 style="margin: 0 0 10px 0; font-size: 16px;">Usuario</h2>
            <table class="kv">
              <tbody>
                <tr><td>ID</td><td>${this.escapeHtml(actorUser.id)}</td></tr>
                <tr><td>Email</td><td>${this.escapeHtml(actorUser.email)}</td></tr>
                <tr><td>Nombre</td><td>${this.escapeHtml(fullName || '—')}</td></tr>
                <tr><td>Rol</td><td>${this.escapeHtml(actorUser.role || '—')}</td></tr>
                <tr><td>Tenant ID</td><td>${this.escapeHtml(actorUser.tenantId || '—')}</td></tr>
                <tr><td>Plan (tenant)</td><td>${this.escapeHtml(tenantPlan || '—')}</td></tr>
              </tbody>
            </table>
            ${extraHtml}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} MenuQR. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private eventLabel(eventKey: AdminMessageEventKey): string {
    switch (eventKey) {
      case 'user_created':
        return 'Nuevo usuario creado';
      case 'user_email_verified':
        return 'Usuario verificó email';
      case 'subscription_created':
        return 'Nueva suscripción';
      case 'subscription_payment_succeeded':
        return 'Pago de suscripción exitoso';
      case 'subscription_payment_failed':
        return 'Fallo de pago de suscripción';
      default:
        return 'Notificación';
    }
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

