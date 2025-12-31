import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class TenantContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.setTenantContext(tenantId);
  }

  async clearTenantContext(): Promise<void> {
    await this.prisma.clearRequestContext();
  }
}

