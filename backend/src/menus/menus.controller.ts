import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { MenusCsvImportService } from './menus-csv-import.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('menus')
@Controller('menus')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly menusCsvImportService: MenusCsvImportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar menús del tenant' })
  @ApiResponse({ status: 200, description: 'Lista de menús' })
  async findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('menuName') menuName: string,
    @Query('restaurantName') restaurantName: string,
    @Query('tenantName') tenantName: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Request() req
  ) {
    // Si es SUPER_ADMIN y no hay tenantId en query, devolver todos los menús
    if (req.user.role === 'SUPER_ADMIN' && !req.query.tenantId) {
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const offsetNum = offset ? parseInt(offset, 10) : undefined;
      const restaurantIdQuery = req.query.restaurantId as string | undefined;
      return this.menusService.findAllForSuperAdmin(
        menuName,
        restaurantName,
        tenantName,
        limitNum,
        offsetNum,
        restaurantIdQuery,
      );
    }
    
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menusService.findAll(tenantId, restaurantId, menuName);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Actualizar orden de los menús' })
  @ApiBody({
    description: 'Array de menús con su nuevo orden',
    schema: {
      type: 'object',
      properties: {
        menuOrders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              sort: { type: 'number' },
            },
          },
        },
        tenantId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Orden actualizado exitosamente' })
  async reorder(@Body() body: any, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID es requerido');
    }

    // Validación manual
    if (!body.menuOrders || !Array.isArray(body.menuOrders) || body.menuOrders.length === 0) {
      throw new BadRequestException('Se requiere un array de menuOrders con al menos un elemento');
    }

    // Validar cada elemento del array
    for (const menuOrder of body.menuOrders) {
      if (!menuOrder.id || typeof menuOrder.id !== 'string') {
        throw new BadRequestException('Cada menuOrder debe tener un id válido (string)');
      }
      if (typeof menuOrder.sort !== 'number' && typeof menuOrder.sort !== 'string') {
        throw new BadRequestException('Cada menuOrder debe tener un sort válido (number)');
      }
    }

    // Normalizar los datos
    const menuOrders = body.menuOrders.map((mo: any) => ({
      id: mo.id,
      sort: typeof mo.sort === 'string' ? parseInt(mo.sort, 10) : mo.sort,
    }));

    try {
      return await this.menusService.updateOrder(menuOrders, tenantId);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al actualizar el orden de los menús');
    }
  }

  @Get('assignable')
  @ApiOperation({ summary: 'Menús del tenant asignables a un restaurante (sin local u otro local)' })
  async findAssignable(
    @Query('targetRestaurantId') targetRestaurantId: string,
    @Query('tenantId') tenantIdQuery: string,
    @Request() req: any,
  ) {
    if (!targetRestaurantId) {
      throw new BadRequestException('Query targetRestaurantId es requerido');
    }
    const tenantId = req.user.role === 'SUPER_ADMIN' ? tenantIdQuery : req.user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId en query es requerido para super admin');
    }
    return this.menusService.findAssignableMenus(tenantId, targetRestaurantId);
  }

  @Post('import-csv')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 3 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Importar un menú completo desde CSV (un menú por archivo)' })
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('targetRestaurantId') targetRestaurantId: string,
    @Body('tenantId') tenantIdBody: string | undefined,
    @Body('menuName') menuNameBody: string | undefined,
    @Body('menuDescription') menuDescriptionBody: string | undefined,
    @Request() req: any,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Archivo CSV requerido (campo multipart "file")');
    }
    if (!targetRestaurantId) {
      throw new BadRequestException('targetRestaurantId es requerido');
    }
    const tenantId = req.user.role === 'SUPER_ADMIN' ? tenantIdBody : req.user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId en body es requerido para super admin');
    }
    const menuName = typeof menuNameBody === 'string' ? menuNameBody.trim() : '';
    const menuDescription =
      typeof menuDescriptionBody === 'string' ? menuDescriptionBody.trim() : '';
    const menuFromForm = menuName
      ? { menuName, menuDescription: menuDescription || undefined }
      : undefined;
    return this.menusCsvImportService.importFromCsvBuffer(
      tenantId,
      targetRestaurantId,
      file.buffer,
      menuFromForm,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener menú por ID' })
  @ApiResponse({ status: 200, description: 'Menú encontrado' })
  @ApiResponse({ status: 404, description: 'Menú no encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.menusService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo menú' })
  @ApiResponse({ status: 201, description: 'Menú creado exitosamente' })
  async create(@Body() createMenuDto: CreateMenuDto, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menusService.create(tenantId, {
      restaurantId: createMenuDto.restaurantId || null,
      name: createMenuDto.name,
      description: createMenuDto.description,
      validFrom: createMenuDto.validFrom ? new Date(createMenuDto.validFrom) : undefined,
      validTo: createMenuDto.validTo ? new Date(createMenuDto.validTo) : undefined,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar menú' })
  @ApiResponse({ status: 200, description: 'Menú actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @Request() req,
  ) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menusService.update(id, tenantId, {
      ...updateMenuDto,
      validFrom: updateMenuDto.validFrom ? new Date(updateMenuDto.validFrom) : undefined,
      validTo: updateMenuDto.validTo ? new Date(updateMenuDto.validTo) : undefined,
    });
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publicar menú' })
  @ApiResponse({ status: 200, description: 'Menú publicado exitosamente' })
  async publish(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.menusService.publish(id, tenantId);
  }

  @Put(':id/unpublish')
  @ApiOperation({ summary: 'Despublicar menú' })
  @ApiResponse({ status: 200, description: 'Menú despublicado exitosamente' })
  async unpublish(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.menusService.unpublish(id, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar menú' })
  @ApiResponse({ status: 200, description: 'Menú eliminado exitosamente' })
  async remove(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menusService.delete(id, tenantId);
  }
}

