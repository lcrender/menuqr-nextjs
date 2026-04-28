import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { EmailModule } from '../common/email/email.module';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
