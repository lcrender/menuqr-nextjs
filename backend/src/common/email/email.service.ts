import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
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
    const fromName = this.configService.get('SMTP_FROM_NAME', 'MenuQR');
    return fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const html = this.getPasswordResetEmailTemplate(firstName, resetUrl);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: email,
          subject: 'Recuperar contraseña - MenuQR',
          html,
        });
        this.logger.log(`Email de recuperación enviado a ${email}`);
      } catch (err) {
        this.logger.error(`Error enviando email de recuperación a ${email}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email de recuperación para ${email} (token en logs)`);
      this.logger.warn(`🔗 Enlace reset: ${resetUrl}`);
    }
  }

  async sendEmailVerification(
    email: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;
    const html = this.getVerificationEmailTemplate(firstName, verificationUrl);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: email,
          subject: 'Verifica tu email en MenuQR',
          html,
        });
        this.logger.log(`Email de verificación enviado a ${email}`);
      } catch (err) {
        this.logger.error(`Error enviando email de verificación a ${email}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email de verificación para ${email}`);
      this.logger.warn(`🔗 Enlace verificación: ${verificationUrl}`);
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
  ): Promise<void> {
    const confirmUrl = `${this.frontendUrl}/verify-email-change?token=${encodeURIComponent(token)}`;
    const html = this.getEmailChangeVerificationTemplate(firstName, confirmUrl);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: newEmail,
          subject: 'Confirma el cambio de email - MenuQR',
          html,
        });
        this.logger.log(`Email de confirmación de cambio enviado a ${newEmail}`);
      } catch (err) {
        this.logger.error(`Error enviando email de cambio a ${newEmail}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Email de cambio de correo para ${newEmail}`);
      this.logger.warn(`🔗 Enlace: ${confirmUrl}`);
    }
  }

  /** Notificación al email anterior informando que el email fue modificado. */
  async sendEmailChangeNotification(oldEmail: string): Promise<void> {
    const html = this.getEmailChangeNotificationTemplate();

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.getFrom(),
          to: oldEmail,
          subject: 'Tu email en MenuQR fue modificado',
          html,
        });
        this.logger.log(`Notificación de cambio de email enviada a ${oldEmail}`);
      } catch (err) {
        this.logger.error(`Error enviando notificación de cambio a ${oldEmail}:`, err);
        throw err;
      }
    } else {
      this.logger.log(`[DEV] Notificación de cambio de email para ${oldEmail}`);
    }
  }

  private getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ MenuQR</h1>
          </div>
          <div class="content">
            <h2>Hola ${firstName},</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en MenuQR.</p>
            <p>Haz clic en el siguiente botón para elegir una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
            <p><strong>Este enlace expira en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no se modificará.</p>
            <p>Saludos,<br>El equipo de MenuQR</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MenuQR. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailChangeVerificationTemplate(firstName: string, confirmUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ MenuQR</h1>
          </div>
          <div class="content">
            <h2>Hola ${firstName},</h2>
            <p>Recibimos una solicitud para cambiar el email de tu cuenta en MenuQR a esta dirección.</p>
            <p>Haz clic en el siguiente botón para confirmar el cambio:</p>
            <div style="text-align: center;">
              <a href="${confirmUrl}" class="button">Confirmar cambio de email</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #6366f1;">${confirmUrl}</p>
            <p><strong>Este enlace expira en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este email. Tu email no se modificará.</p>
            <p>Saludos,<br>El equipo de MenuQR</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MenuQR. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailChangeNotificationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ MenuQR</h1>
          </div>
          <div class="content">
            <h2>Cambio de email realizado</h2>
            <p>Te informamos que el email asociado a tu cuenta en MenuQR fue modificado correctamente.</p>
            <div class="alert">
              <strong>¿No realizaste este cambio?</strong> Contacta a soporte inmediatamente.
            </div>
            <p>Saludos,<br>El equipo de MenuQR</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MenuQR. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ MenuQR</h1>
          </div>
          <div class="content">
            <h2>Hola ${firstName},</h2>
            <p>Gracias por registrarte en MenuQR.</p>
            <p>Por favor, verifica tu dirección de email haciendo clic en el siguiente botón:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Email</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
            <p>Saludos,<br>El equipo de MenuQR</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MenuQR. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
