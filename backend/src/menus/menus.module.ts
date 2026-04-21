import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { MenusCsvImportService } from './menus-csv-import.service';
import { DatabaseModule } from '../common/database/database.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { QRModule } from '../qr/qr.module';
import { I18nModule } from '../common/i18n/i18n.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuSectionsModule } from '../menu-sections/menu-sections.module';

@Module({
  imports: [DatabaseModule, QRModule, PlanLimitsModule, I18nModule, MenuItemsModule, MenuSectionsModule],
  controllers: [MenusController],
  providers: [MenusService, MenusCsvImportService],
  exports: [MenusService],
})
export class MenusModule {}

