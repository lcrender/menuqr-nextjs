import { Controller, Get, Param, HttpCode, HttpStatus, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public')
@Controller('public')
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('restaurants/:slug')
  @Public()
  @CacheTTL(300) // Cache por 5 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener restaurante público por slug (cacheable)' })
  @ApiParam({ name: 'slug', description: 'Slug del restaurante' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma (es-ES, en-US, etc.)', example: 'es-ES' })
  @ApiResponse({
    status: 200,
    description: 'Restaurante encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante no encontrado',
  })
  async getRestaurantBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.publicService.getRestaurantBySlug(slug, locale || 'es-ES');
  }

  @Get('restaurants/:restaurantSlug/menus/:menuSlug')
  @Public()
  @CacheTTL(300) // Cache por 5 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener menú público por slug (cacheable)' })
  @ApiParam({ name: 'restaurantSlug', description: 'Slug del restaurante' })
  @ApiParam({ name: 'menuSlug', description: 'Slug del menú' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma (es-ES, en-US, etc.)', example: 'es-ES' })
  @ApiResponse({
    status: 200,
    description: 'Menú encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Menú no encontrado',
  })
  async getMenuBySlug(
    @Param('restaurantSlug') restaurantSlug: string,
    @Param('menuSlug') menuSlug: string,
    @Query('locale') locale?: string,
  ) {
    return this.publicService.getMenuBySlug(restaurantSlug, menuSlug, locale || 'es-ES');
  }

  @Get('menus/:id')
  @Public()
  @CacheTTL(300) // Cache por 5 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener menú público por ID (cacheable, deprecated - usar slug)' })
  @ApiParam({ name: 'id', description: 'ID del menú' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma (es-ES, en-US, etc.)', example: 'es-ES' })
  @ApiResponse({
    status: 200,
    description: 'Menú encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Menú no encontrado',
  })
  async getMenuById(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ) {
    return this.publicService.getMenuById(id, locale || 'es-ES');
  }
}

