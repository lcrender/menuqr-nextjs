import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    // TODO: Implementar envío de email
    this.logger.log(`Email de recuperación de contraseña para ${email} (token: ${resetToken})`);
  }

  async sendEmailVerification(
    email: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;

    // En producción, aquí se integraría con un servicio de email real (SendGrid, AWS SES, etc.)
    // Por ahora, logueamos el email para desarrollo
    this.logger.log(`
╔══════════════════════════════════════════════════════════════╗
║                    EMAIL DE VERIFICACIÓN                     ║
╠══════════════════════════════════════════════════════════════╣
║ Para: ${email.padEnd(50)} ║
║ Asunto: Verifica tu email en MenuQR                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║ Hola ${firstName},                                           ║
║                                                              ║
║ Gracias por registrarte en MenuQR.                          ║
║                                                              ║
║ Por favor, verifica tu dirección de email haciendo clic en  ║
║ el siguiente enlace:                                         ║
║                                                              ║
║ ${verificationUrl}                                           ║
║                                                              ║
║ Este enlace expirará en 24 horas.                            ║
║                                                              ║
║ Si no creaste esta cuenta, puedes ignorar este email.       ║
║                                                              ║
║ Saludos,                                                     ║
║ El equipo de MenuQR                                          ║
╚══════════════════════════════════════════════════════════════╝
    `);
    
    // Log adicional más visible para desarrollo
    this.logger.warn(`
🔗 ============================================================
🔗 ENLACE DE VERIFICACIÓN DE EMAIL (DESARROLLO)
🔗 ============================================================
🔗 Copia y pega este enlace en tu navegador:
🔗 
🔗 ${verificationUrl}
🔗 
🔗 ============================================================
    `);

    // TODO: Implementar envío real de email
    // Ejemplo con nodemailer o servicio de email:
    // await this.transporter.sendMail({
    //   to: email,
    //   subject: 'Verifica tu email en MenuQR',
    //   html: this.getVerificationEmailTemplate(firstName, verificationUrl),
    // });
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

