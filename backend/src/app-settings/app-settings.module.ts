import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database/database.module';
import { AppSettingsService } from './app-settings.service';
import { MercadoPagoConfigController } from './mercadopago-config.controller';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [MercadoPagoConfigController],
  providers: [AppSettingsService],
  exports: [AppSettingsService],
})
export class AppSettingsModule {}
