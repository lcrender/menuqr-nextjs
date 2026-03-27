import { Module } from '@nestjs/common';
import { AdminMessagesController } from './admin-messages.controller';
import { AdminMessagesService } from './admin-messages.service';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [AdminMessagesController],
  providers: [AdminMessagesService],
  exports: [AdminMessagesService],
})
export class AdminMessagesModule {}

