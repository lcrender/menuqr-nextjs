import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { DatabaseModule } from '../common/database/database.module';
import { I18nModule } from '../common/i18n/i18n.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { EmailModule } from '../common/email/email.module';
import { RecaptchaModule } from '../common/recaptcha/recaptcha.module';

@Module({
  imports: [
    DatabaseModule,
    I18nModule,
    PlanLimitsModule,
    EmailModule,
    RecaptchaModule,
    CacheModule.register(),
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}

