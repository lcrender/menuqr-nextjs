import { Controller, Get, Post, Put, Delete, Param, Body, Query, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('menu-items')
@Controller('menu-items')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post('reorder')
  @ApiOperation({ summary: 'Actualizar orden de los productos' })
  @ApiBody({
    description: 'Array de productos con su nuevo orden',
    schema: {
      type: 'object',
      properties: {
        itemOrders: {
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
    if (!body.itemOrders || !Array.isArray(body.itemOrders) || body.itemOrders.length === 0) {
      throw new BadRequestException('Se requiere un array de itemOrders con al menos un elemento');
    }

    // Validar cada elemento del array
    for (const itemOrder of body.itemOrders) {
      if (!itemOrder.id || typeof itemOrder.id !== 'string') {
        throw new BadRequestException('Cada itemOrder debe tener un id válido (string)');
      }
      if (typeof itemOrder.sort !== 'number' && typeof itemOrder.sort !== 'string') {
        throw new BadRequestException('Cada itemOrder debe tener un sort válido (number)');
      }
    }

    // Normalizar los datos
    const itemOrders = body.itemOrders.map((io: any) => ({
      id: io.id,
      sort: typeof io.sort === 'string' ? parseInt(io.sort, 10) : io.sort,
    }));

    try {
      return await this.menuItemsService.updateOrder(itemOrders, tenantId);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al actualizar el orden de los productos');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar items de menú' })
  @ApiResponse({ status: 200, description: 'Lista de items' })
  async findAll(
    @Query('menuId') menuId: string,
    @Query('sectionId') sectionId: string,
    @Query('productName') productName: string,
    @Query('menuName') menuName: string,
    @Query('restaurantName') restaurantName: string,
    @Query('tenantName') tenantName: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Request() req,
  ) {
    // Si es SUPER_ADMIN y no hay tenantId en query, devolver todos los productos
    if (req.user.role === 'SUPER_ADMIN' && !req.query.tenantId) {
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const offsetNum = offset ? parseInt(offset, 10) : undefined;
      return this.menuItemsService.findAllForSuperAdmin(productName, menuName, restaurantName, tenantName, limitNum, offsetNum);
    }
    
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menuItemsService.findAll(tenantId, menuId, sectionId, productName);
  }

  @Post(':id/copy-to-menu')
  @ApiOperation({ summary: 'Copiar producto a otro menú y sección' })
  @ApiResponse({ status: 201, description: 'Producto clonado en el menú indicado' })
  @ApiResponse({ status: 404, description: 'Item o menú/sección no encontrado' })
  async copyToMenu(
    @Param('id') id: string,
    @Body() body: { menuId: string; sectionId: string; tenantId?: string },
    @Request() req,
  ) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? body.tenantId : req.user.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID es requerido');
    if (!body.menuId || !body.sectionId) throw new BadRequestException('menuId y sectionId son requeridos');
    return this.menuItemsService.copyToMenu(id, tenantId, { menuId: body.menuId, sectionId: body.sectionId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener item por ID' })
  @ApiResponse({ status: 200, description: 'Item encontrado' })
  @ApiResponse({ status: 404, description: 'Item no encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.menuItemsService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo item de menú' })
  @ApiResponse({ status: 201, description: 'Item creado exitosamente' })
  async create(@Body() createMenuItemDto: CreateMenuItemDto, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menuItemsService.create(tenantId, createMenuItemDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar item de menú' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @Request() req,
  ) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menuItemsService.update(id, tenantId, updateMenuItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar item de menú' })
  @ApiResponse({ status: 200, description: 'Item eliminado exitosamente' })
  async remove(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.menuItemsService.delete(id, tenantId);
  }

  @Post(':id/prices')
  @ApiOperation({ summary: 'Agregar precio a un item' })
  @ApiResponse({ status: 200, description: 'Precio agregado exitosamente' })
  async addPrice(
    @Param('id') id: string,
    @Body() priceData: { currency: string; label?: string; amount: number },
    @Request() req,
  ) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    return this.menuItemsService.addPrice(tenantId, id, priceData);
  }

  @Delete(':id/prices/:priceId')
  @ApiOperation({ summary: 'Eliminar precio de un item' })
  @ApiResponse({ status: 200, description: 'Precio eliminado exitosamente' })
  async removePrice(
    @Param('id') id: string,
    @Param('priceId') priceId: string,
    @Request() req,
  ) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.menuItemsService.removePrice(tenantId, id, priceId);
  }
}

