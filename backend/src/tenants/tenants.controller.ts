import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('tenants')
@Controller('tenants')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los tenants (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de tenants' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.tenantsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas del sistema (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Métricas del sistema' })
  async getMetrics() {
    return this.tenantsService.getMetrics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tenant por ID (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado' })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tenant (Solo Super Admin)' })
  @ApiResponse({ status: 201, description: 'Tenant creado exitosamente' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar tenant (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Tenant actualizado exitosamente' })
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Put(':id/block')
  @ApiOperation({ summary: 'Bloquear tenant (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Tenant bloqueado exitosamente' })
  async block(@Param('id') id: string) {
    return this.tenantsService.block(id);
  }

  @Put(':id/unblock')
  @ApiOperation({ summary: 'Desbloquear tenant (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Tenant desbloqueado exitosamente' })
  async unblock(@Param('id') id: string) {
    return this.tenantsService.unblock(id);
  }

  @Put(':id/suspend')
  @ApiOperation({ summary: 'Suspender tenant (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Tenant suspendido exitosamente' })
  async suspend(@Param('id') id: string) {
    return this.tenantsService.suspend(id);
  }
}

