import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { DatabaseModule } from '../common/database/database.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { QRModule } from '../qr/qr.module';
import { I18nModule } from '../common/i18n/i18n.module';

@Module({
  imports: [DatabaseModule, QRModule, PlanLimitsModule, I18nModule],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}

