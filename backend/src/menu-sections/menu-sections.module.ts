import { Module } from '@nestjs/common';
import { MenuSectionsController } from './menu-sections.controller';
import { MenuSectionsService } from './menu-sections.service';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MenuSectionsController],
  providers: [MenuSectionsService],
  exports: [MenuSectionsService],
})
export class MenuSectionsModule {}

