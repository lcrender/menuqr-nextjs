import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { DatabaseModule } from '../common/database/database.module';
import { QRModule } from '../qr/qr.module';

@Module({
  imports: [DatabaseModule, QRModule],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}

