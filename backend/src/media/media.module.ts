import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { DatabaseModule } from '../common/database/database.module';
import { MinioModule } from '../common/minio/minio.module';

@Module({
  imports: [DatabaseModule, MinioModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}

