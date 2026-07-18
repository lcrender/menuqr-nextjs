import { Module } from '@nestjs/common';
import { MenusModule } from '../menus/menus.module';
import { MenuPhotoImportController } from './menu-photo-import.controller';
import { MenuPhotoImportService } from './menu-photo-import.service';
import { OpenAiMenuVisionService } from './openai-menu-vision.service';

@Module({
  imports: [MenusModule],
  controllers: [MenuPhotoImportController],
  providers: [MenuPhotoImportService, OpenAiMenuVisionService],
})
export class MenuPhotoImportModule {}
