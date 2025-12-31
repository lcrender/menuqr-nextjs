import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    // TODO: Implementar envío de email
    this.logger.log(`Email de recuperación de contraseña para ${email} (token: ${resetToken})`);
  }
}

