import { Module } from '@nestjs/common';
import { I18nService } from './i18n.service';
import { PostgresService } from '../database/postgres.service';

@Module({
  providers: [I18nService, PostgresService],
  exports: [I18nService],
})
export class I18nModule {}

