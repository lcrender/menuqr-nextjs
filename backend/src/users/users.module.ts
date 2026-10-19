import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailModule } from '../common/email/email.module';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';

@Module({
  imports: [EmailModule, EmailTemplatesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

