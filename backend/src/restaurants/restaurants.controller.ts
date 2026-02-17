import { Controller, Get, Post, Put, Delete, Param, Body, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('restaurants')
@Controller('restaurants')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('config-state')
  @ApiOperation({ summary: 'Estado de configuración del restaurante seleccionado' })
  @ApiResponse({ status: 200, description: 'hasRestaurant, hasMenu, hasProductLinkedToMenu, isComplete, progressPercentage' })
  async getConfigState(@Request() req, @Query('restaurantId') restaurantId?: string) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? (req.query.tenantId as string) : req.user.tenantId;
    if (!tenantId) {
      return {
        hasRestaurant: false,
        hasMenu: false,
        hasProductLinkedToMenu: false,
        isComplete: false,
        progressPercentage: 0,
      };
    }
    return this.restaurantsService.getConfigState(tenantId, restaurantId || undefined);
  }

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes del tenant' })
  @ApiResponse({ status: 200, description: 'Lista de restaurantes' })
  async findAll(@Request() req) {
    // Si es SUPER_ADMIN y no hay tenantId en query, devolver todos los restaurantes
    // Si hay restaurantName en query, filtrar por nombre de restaurante
    if (req.user.role === 'SUPER_ADMIN' && !req.query.tenantId) {
      const restaurantName = req.query.restaurantName as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
      return this.restaurantsService.findAllForSuperAdmin(restaurantName, limit, offset);
    }
    
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.restaurantsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener restaurante por ID' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.restaurantsService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo restaurante' })
  @ApiResponse({ status: 201, description: 'Restaurante creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Límite de restaurantes alcanzado' })
  async create(@Body() createRestaurantDto: CreateRestaurantDto, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.body.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.restaurantsService.create(tenantId, createRestaurantDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ) {
    // Para SUPER_ADMIN, obtener tenantId del body o del query, sino del restaurante existente
    let tenantId: string;
    
    if (req.user.role === 'SUPER_ADMIN') {
      tenantId = updateRestaurantDto.tenantId || req.query.tenantId as string;
      
      // Si no está en el body ni en query, obtenerlo del restaurante (sin filtrar por tenant)
      if (!tenantId) {
        try {
          const restaurant = await this.restaurantsService.findById(id);
          tenantId = restaurant.tenantId || restaurant.tenant_id;
        } catch (error) {
          // Si falla, intentar sin tenantId
          tenantId = undefined as any;
        }
      }
    } else {
      tenantId = req.user.tenantId;
    }
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.restaurantsService.update(id, tenantId, updateRestaurantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante eliminado exitosamente' })
  async remove(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID es requerido');
    }

    return this.restaurantsService.delete(id, tenantId);
  }
}

