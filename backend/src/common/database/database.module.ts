import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { PostgresService } from './postgres.service';
import { TenantContextService } from './tenant-context.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, PostgresService, TenantContextService],
  exports: [PrismaService, PostgresService, TenantContextService],
})
export class DatabaseModule {}

