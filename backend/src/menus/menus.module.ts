import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { DatabaseModule } from '../common/database/database.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { QRModule } from '../qr/qr.module';

@Module({
  imports: [DatabaseModule, QRModule, PlanLimitsModule],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}

