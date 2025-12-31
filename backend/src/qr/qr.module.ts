import { Module } from '@nestjs/common';
import { QRService } from './qr.service';
import { DatabaseModule } from '../common/database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [QRService],
  exports: [QRService],
})
export class QRModule {}

