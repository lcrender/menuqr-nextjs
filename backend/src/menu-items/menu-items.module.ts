import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { DatabaseModule } from '../common/database/database.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';

@Module({
  imports: [DatabaseModule, PlanLimitsModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}

