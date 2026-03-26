import { Module } from '@nestjs/common';
import { MenuSectionsController } from './menu-sections.controller';
import { MenuSectionsService } from './menu-sections.service';
import { DatabaseModule } from '../common/database/database.module';
import { I18nModule } from '../common/i18n/i18n.module';

@Module({
  imports: [DatabaseModule, I18nModule],
  controllers: [MenuSectionsController],
  providers: [MenuSectionsService],
  exports: [MenuSectionsService],
})
export class MenuSectionsModule {}

