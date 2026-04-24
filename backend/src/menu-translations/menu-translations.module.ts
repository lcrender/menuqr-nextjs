import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { I18nModule } from '../common/i18n/i18n.module';
import { MenuTranslationsController } from './menu-translations.controller';
import { MenuTranslationsService } from './menu-translations.service';

@Module({
  imports: [DatabaseModule, I18nModule],
  controllers: [MenuTranslationsController],
  providers: [MenuTranslationsService],
})
export class MenuTranslationsModule {}
