import { Controller, Get, Post, Put, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuSectionsService } from './menu-sections.service';
import { CreateMenuSectionDto } from './dto/create-menu-section.dto';
import { UpdateMenuSectionDto } from './dto/update-menu-section.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('menu-sections')
@Controller('menu-sections')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class MenuSectionsController {
  constructor(private readonly menuSectionsService: MenuSectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar secciones de menú' })
  @ApiResponse({ status: 200, description: 'Lista de secciones' })
  async findAll(@Query('menuId') menuId: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId || !menuId) {
      throw new Error('Tenant ID y Menu ID son requeridos');
    }

    return this.menuSectionsService.findAll(tenantId, menuId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sección por ID' })
  @ApiResponse({ status: 200, description: 'Sección encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.menuSectionsService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva sección de menú' })
  @ApiResponse({ status: 201, description: 'Sección creada exitosamente' })
  async create(@Body() createMenuSectionDto: CreateMenuSectionDto, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menuSectionsService.create(tenantId, createMenuSectionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar sección de menú' })
  @ApiResponse({ status: 200, description: 'Sección actualizada exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuSectionDto: UpdateMenuSectionDto,
    @Request() req,
  ) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menuSectionsService.update(id, tenantId, updateMenuSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sección de menú' })
  @ApiResponse({ status: 200, description: 'Sección eliminada exitosamente' })
  async remove(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menuSectionsService.delete(id, tenantId);
  }
}

