import { Module } from '@nestjs/common';
import { EmailTemplatesController } from './email-templates.controller';
import { EmailTemplatesService } from './email-templates.service';

/**
 * No importa EmailModule a propósito: EmailService depende de este módulo para
 * resolver el contenido de los emails y una dependencia cruzada sería circular.
 */
@Module({
  controllers: [EmailTemplatesController],
  providers: [EmailTemplatesService],
  exports: [EmailTemplatesService],
})
export class EmailTemplatesModule {}
