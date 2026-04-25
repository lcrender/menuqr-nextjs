import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database/database.module';
import { I18nModule } from '../common/i18n/i18n.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { AutoTranslateAdminController } from './auto-translate-admin.controller';
import { AutoTranslateService } from './auto-translate.service';

@Module({
  imports: [DatabaseModule, I18nModule, PlanLimitsModule, ConfigModule],
  controllers: [AutoTranslateAdminController],
  providers: [AutoTranslateService],
  exports: [AutoTranslateService],
})
export class AutoTranslateModule {}
