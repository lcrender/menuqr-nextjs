import { Controller, Get, Post, Put, Delete, Param, Body, Request, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { DashboardWelcomeService } from '../dashboard-welcome/dashboard-welcome.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { TransferRestaurantOwnerDto } from './dto/transfer-restaurant-owner.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { preferredLanguageToContentLocale } from '../common/i18n/content-locale';

@ApiTags('restaurants')
@Controller('restaurants')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly dashboardWelcome: DashboardWelcomeService,
    private readonly usersService: UsersService,
  ) {}

  @Get('config-state')
  @ApiOperation({ summary: 'Estado de configuración del comercio seleccionado' })
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

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Conteos y límites del plan para el dashboard (comercios, menús, productos)' })
  @ApiResponse({ status: 200, description: 'totalRestaurants, totalMenus, totalProducts, restaurantLimit, productLimit, plan' })
  async getDashboardStats(@Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? (req.query.tenantId as string) : req.user.tenantId;
    if (!tenantId) {
      return {
        totalRestaurants: 0,
        totalMenus: 0,
        totalProducts: 0,
        restaurantLimit: 1,
        productLimit: 30,
        plan: 'free',
      };
    }
    return this.restaurantsService.getDashboardStats(tenantId);
  }

  @Get('dashboard-welcome')
  @ApiOperation({ summary: 'Mensaje de bienvenida del dashboard según plan del tenant' })
  async getDashboardWelcome(@Request() req: any, @Query('plan') plan?: string) {
    return this.dashboardWelcome.resolveForUser(req.user.id, plan);
  }

  @Get('dashboard-cta-card')
  @ApiOperation({ summary: 'Contenido de la card promocional del dashboard según plan' })
  async getDashboardCtaCard(@Request() req: any, @Query('plan') plan?: string) {
    return this.dashboardWelcome.getCtaCardForUser(req.user.id, plan);
  }

  @Get('dashboard-cards')
  @ApiOperation({ summary: 'Fichas de todos los comercios del tenant para el dashboard (una por comercio)' })
  @ApiResponse({ status: 200, description: 'Array de estado de configuración por comercio' })
  async getDashboardCards(@Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? (req.query.tenantId as string) : req.user.tenantId;
    if (!tenantId) return [];
    return this.restaurantsService.getDashboardCards(tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar comercios del tenant' })
  @ApiResponse({ status: 200, description: 'Lista de comercios' })
  async findAll(@Request() req) {
    // Si es SUPER_ADMIN y no hay tenantId en query, devolver todos los comercios
    // Si hay restaurantName en query, filtrar por nombre de comercio
    if (req.user.role === 'SUPER_ADMIN' && !req.query.tenantId) {
      const restaurantName = req.query.restaurantName as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
      return this.restaurantsService.findAllForSuperAdmin(restaurantName, limit, offset);
    }
    
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID es requerido');
    }

    return this.restaurantsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comercio por ID' })
  @ApiResponse({ status: 200, description: 'Comercio encontrado' })
  @ApiResponse({ status: 404, description: 'Comercio no encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.restaurantsService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo comercio' })
  @ApiResponse({ status: 201, description: 'Comercio creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Límite de comercios alcanzado' })
  async create(@Body() createRestaurantDto: CreateRestaurantDto, @Request() req) {
    const { tenantId: tenantIdFromBody, ...payload } = createRestaurantDto;
    const tenantId =
      req.user.role === 'SUPER_ADMIN' ? tenantIdFromBody : req.user.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        req.user.role === 'SUPER_ADMIN'
          ? 'Indicá la cuenta (tenantId) donde crear el comercio.'
          : 'Tenant ID es requerido',
      );
    }

    const me = await this.usersService.findById(req.user.id);
    const sourceLocale = preferredLanguageToContentLocale((me as any)?.preferredLanguage);
    return this.restaurantsService.create(tenantId, { ...payload, sourceLocale });
  }

  @Post(':id/transfer-ownership')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Transferir comercio (con menús/productos) a otro usuario/tenant' })
  @ApiResponse({ status: 200, description: 'Comercio transferido exitosamente' })
  async transferOwnership(
    @Param('id') id: string,
    @Body() dto: TransferRestaurantOwnerDto,
    @Request() req,
  ) {
    return this.restaurantsService.transferOwnershipToUser(id, dto.targetUserId, req.user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar comercio' })
  @ApiResponse({ status: 200, description: 'Comercio actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ) {
    // Para SUPER_ADMIN, obtener tenantId del body o del query, sino del comercio existente
    let tenantId: string;
    
    if (req.user.role === 'SUPER_ADMIN') {
      tenantId = updateRestaurantDto.tenantId || req.query.tenantId as string;
      
      // Si no está en el body ni en query, obtenerlo del comercio (sin filtrar por tenant)
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
      throw new BadRequestException('No se pudo determinar el tenant para actualizar el comercio.');
    }

    const me = await this.usersService.findById(req.user.id);
    const sourceLocale = preferredLanguageToContentLocale((me as any)?.preferredLanguage);
    const { tenantId: _tenantId, ...payload } = updateRestaurantDto as UpdateRestaurantDto & {
      tenantId?: string;
    };
    return this.restaurantsService.update(
      id,
      tenantId,
      { ...payload, sourceLocale },
      { userRole: req.user.role },
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comercio' })
  @ApiResponse({ status: 200, description: 'Comercio eliminado exitosamente' })
  async remove(@Param('id') id: string, @Request() req) {
    let tenantId: string | undefined;

    if (req.user.role === 'SUPER_ADMIN') {
      tenantId = (req.query.tenantId as string) || undefined;
      if (!tenantId) {
        try {
          const restaurant = await this.restaurantsService.findById(id);
          tenantId = restaurant.tenantId || restaurant.tenant_id;
        } catch {
          tenantId = undefined;
        }
      }
    } else {
      tenantId = req.user.tenantId;
    }

    if (!tenantId) {
      throw new BadRequestException(
        'No se pudo determinar el tenant del comercio para eliminarlo.',
      );
    }

    return this.restaurantsService.delete(id, tenantId);
  }
}

