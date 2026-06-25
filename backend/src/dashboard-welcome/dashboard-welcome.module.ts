import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { DashboardAdminController } from './dashboard-admin.controller';
import { DashboardWelcomeService } from './dashboard-welcome.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardAdminController],
  providers: [DashboardWelcomeService],
  exports: [DashboardWelcomeService],
})
export class DashboardWelcomeModule {}
