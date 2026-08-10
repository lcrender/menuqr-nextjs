import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { emailBrandHeaderHtml } from './email-branding';
import {
  authEmailCopy,
  defaultEmailDisplayName,
  normalizeEmailLang,
  type EmailLang,
} from './email-i18n';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
  }

  /** Cabecera con logo del sitio (para plantillas en otros servicios). */
  brandHeaderHtml(opts?: { titleSuffix?: string }): string {
    return emailBrandHeaderHtml(this.frontendUrl, opts);
  }

  onModuleInit() {
    const host = this.configService.get('SMTP_HOST');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');
    if (host && user && pass) {
      const port = parseInt(this.configService.get('SMTP_PORT', '587'), 10);
      const secure = port === 465;
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`Email SMTP configurado: ${host}:${port}`);
    } else {
      this.logger.warn('SMTP no configurado (SMTP_HOST, SMTP_USER, SMTP_PASS). Los emails se solo loguearán.');
    }
  }

  private getFrom(): string {
    const fromEmail = this.configService.get('SMTP_FROM', 'noreply@menuqr.com');
    const fromName = this.configService.get('SMTP_FROM_NAME', 'AppMenuQR');
    return fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
  }

  private resolveLang(lang?: string | null): EmailLang {
    return normalizeEmailLang(lang);
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
    preferredLanguage?: string | null,
  ): Promise<void> {
    const lang = this.resolveLang(preferredLanguage);
    const copy = authEmailCopy.passwordReset[lang];
    const name = firstName?.trim() || defaultEmailDisplayName(lang);
    const resetUrl = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const html = this.getPasswordResetEmailTemplate(name, resetUrl, lang);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: email,
          subject: copy.subject,
          html,
        });
        this.logger.log(`Email de recuperación enviado a ${email} (${lang})`);
      } catch (err) {
        this.logger.error(`Error enviando email de recuperación a ${email}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email de recuperación para ${email} (${lang})`);
      this.logger.warn(`🔗 Enlace reset: ${resetUrl}`);
    }
  }

  async sendEmailVerification(
    email: string,
    firstName: string,
    verificationToken: string,
    preferredLanguage?: string | null,
  ): Promise<void> {
    const lang = this.resolveLang(preferredLanguage);
    const copy = authEmailCopy.emailVerification[lang];
    const name = firstName?.trim() || defaultEmailDisplayName(lang);
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;
    const html = this.getVerificationEmailTemplate(name, verificationUrl, lang);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: email,
          subject: copy.subject,
          html,
        });
        this.logger.log(`Email de verificación enviado a ${email} (${lang})`);
      } catch (err) {
        this.logger.error(`Error enviando email de verificación a ${email}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email de verificación para ${email} (${lang})`);
      this.logger.warn(`🔗 Enlace verificación: ${verificationUrl}`);
    }
  }

  async sendUserTransactionalEmail(to: string, subject: string, html: string): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to,
          subject,
          html,
        });
        this.logger.log(`Email transaccional enviado a ${to} (${subject})`);
      } catch (err) {
        this.logger.error(`Error enviando email transaccional a ${to}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email transaccional a ${to} (${subject})`);
    }
  }

  async sendAdminNotificationEmail(to: string, subject: string, html: string): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to,
          subject,
          html,
        });
        this.logger.log(`Email admin-notification enviado a ${to} (${subject})`);
      } catch (err) {
        this.logger.error(`Error enviando email admin-notification a ${to}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email admin-notification a ${to} (${subject})`);
      this.logger.warn('Sin SMTP configurado: el email se solo loguea.');
    }
  }

  /** Email al nuevo correo con link para confirmar el cambio de email. */
  async sendEmailChangeVerification(
    newEmail: string,
    firstName: string,
    token: string,
    preferredLanguage?: string | null,
  ): Promise<void> {
    const lang = this.resolveLang(preferredLanguage);
    const copy = authEmailCopy.emailChangeVerification[lang];
    const name = firstName?.trim() || defaultEmailDisplayName(lang);
    const confirmUrl = `${this.frontendUrl}/verify-email-change?token=${encodeURIComponent(token)}`;
    const html = this.getEmailChangeVerificationTemplate(name, confirmUrl, lang);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: newEmail,
          subject: copy.subject,
          html,
        });
        this.logger.log(`Email de confirmación de cambio enviado a ${newEmail} (${lang})`);
      } catch (err) {
        this.logger.error(`Error enviando email de cambio a ${newEmail}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email de cambio de correo para ${newEmail} (${lang})`);
      this.logger.warn(`🔗 Enlace: ${confirmUrl}`);
    }
  }

  /** Notificación al email anterior informando que el email fue modificado. */
  async sendEmailChangeNotification(
    oldEmail: string,
    preferredLanguage?: string | null,
  ): Promise<void> {
    const lang = this.resolveLang(preferredLanguage);
    const copy = authEmailCopy.emailChangeNotification[lang];
    const html = this.getEmailChangeNotificationTemplate(lang);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: oldEmail,
          subject: copy.subject,
          html,
        });
        this.logger.log(`Notificación de cambio de email enviada a ${oldEmail} (${lang})`);
      } catch (err) {
        this.logger.error(`Error enviando notificación de cambio a ${oldEmail}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Notificación de cambio de email para ${oldEmail} (${lang})`);
    }
  }

  private emailShell(lang: EmailLang, contentHtml: string): string {
    return `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
${this.brandHeaderHtml()}
          </div>
          ${contentHtml}
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(firstName: string, resetUrl: string, lang: EmailLang): string {
    const c = authEmailCopy.passwordReset[lang];
    const year = new Date().getFullYear();
    return this.emailShell(
      lang,
      `
          <div class="content">
            <h2>${c.greeting(firstName)}</h2>
            <p>${c.body[0]}</p>
            <p>${c.body[1]}</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">${c.cta}</a>
            </div>
            <p>${c.orPaste}</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
            <p><strong>${c.expires}</strong></p>
            <p>${c.ignore}</p>
            <p>${c.regards}<br>${c.team}</p>
          </div>
          <div class="footer">
            <p>${c.footer(year)}</p>
          </div>
      `,
    );
  }

  private getEmailChangeVerificationTemplate(
    firstName: string,
    confirmUrl: string,
    lang: EmailLang,
  ): string {
    const c = authEmailCopy.emailChangeVerification[lang];
    const year = new Date().getFullYear();
    return this.emailShell(
      lang,
      `
          <div class="content">
            <h2>${c.greeting(firstName)}</h2>
            <p>${c.body[0]}</p>
            <p>${c.body[1]}</p>
            <div style="text-align: center;">
              <a href="${confirmUrl}" class="button">${c.cta}</a>
            </div>
            <p>${c.orPaste}</p>
            <p style="word-break: break-all; color: #6366f1;">${confirmUrl}</p>
            <p><strong>${c.expires}</strong></p>
            <p>${c.ignore}</p>
            <p>${c.regards}<br>${c.team}</p>
          </div>
          <div class="footer">
            <p>${c.footer(year)}</p>
          </div>
      `,
    );
  }

  private getEmailChangeNotificationTemplate(lang: EmailLang): string {
    const c = authEmailCopy.emailChangeNotification[lang];
    const year = new Date().getFullYear();
    return this.emailShell(
      lang,
      `
          <div class="content">
            <h2>${c.title}</h2>
            <p>${c.body}</p>
            <div class="alert">
              <strong>${c.alertTitle}</strong> ${c.alertBody}
            </div>
            <p>${c.regards}<br>${c.team}</p>
          </div>
          <div class="footer">
            <p>${c.footer(year)}</p>
          </div>
      `,
    );
  }

  private getVerificationEmailTemplate(
    firstName: string,
    verificationUrl: string,
    lang: EmailLang,
  ): string {
    const c = authEmailCopy.emailVerification[lang];
    const year = new Date().getFullYear();
    return this.emailShell(
      lang,
      `
          <div class="content">
            <h2>${c.greeting(firstName)}</h2>
            <p>${c.body[0]}</p>
            <p>${c.body[1]}</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">${c.cta}</a>
            </div>
            <p>${c.orPaste}</p>
            <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
            <p><strong>${c.expires}</strong></p>
            <p>${c.ignore}</p>
            <p>${c.regards}<br>${c.team}</p>
          </div>
          <div class="footer">
            <p>${c.footer(year)}</p>
          </div>
      `,
    );
  }
}
