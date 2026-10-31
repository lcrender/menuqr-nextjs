import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MenuTranslationsService } from './menu-translations.service';
import { AddMenuLocaleDto } from './dto/add-menu-locale.dto';
import { RenameMenuLocaleDto } from './dto/rename-menu-locale.dto';
import { SaveMenuLocaleWorkbenchDto } from './dto/save-menu-locale-workbench.dto';
import { PatchMenuTranslationSettingsDto } from './dto/patch-menu-translation-settings.dto';
import { PostAutoTranslateDto } from './dto/post-auto-translate.dto';
import { PostRestaurantAutoTranslateDto } from './dto/post-restaurant-auto-translate.dto';
import { SetDefaultLocaleDto } from './dto/set-default-locale.dto';
import { AutoTranslateService } from '../auto-translate/auto-translate.service';

@ApiTags('menu-translations')
@Controller('menu-translations')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class MenuTranslationsController {
  constructor(
    private readonly menuTranslationsService: MenuTranslationsService,
    private readonly autoTranslateService: AutoTranslateService,
  ) {}

  @Get('menus')
  @ApiOperation({ summary: 'Listar menús de un comercio con idiomas detectados (Pro / Pro Team / Super Admin)' })
  @ApiQuery({ name: 'restaurantId', required: true })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Solo SUPER_ADMIN' })
  async listMenus(
    @Query('restaurantId') restaurantId: string,
    @Query('tenantId') tenantIdQuery: string | undefined,
    @Request() req: any,
  ) {
    if (!restaurantId) {
      throw new BadRequestException('restaurantId es requerido');
    }
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, undefined, tenantIdQuery);
    return this.menuTranslationsService.listMenusForRestaurant(tenantId, restaurantId);
  }

  @Get('menus/:menuId/workbench')
  @ApiOperation({ summary: 'Obtener textos base (es-ES) y traducciones del locale para editar' })
  @ApiQuery({ name: 'locale', required: true, example: 'en-US' })
  @ApiQuery({ name: 'tenantId', required: false })
  async getWorkbench(
    @Param('menuId') menuId: string,
    @Query('locale') locale: string,
    @Query('tenantId') tenantIdQuery: string | undefined,
    @Request() req: any,
  ) {
    if (!locale) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, undefined, tenantIdQuery);
    return this.menuTranslationsService.getWorkbench(tenantId, menuId, locale);
  }

  @Put('menus/:menuId/workbench')
  @ApiOperation({ summary: 'Guardar traducciones del menú / secciones / productos para un locale' })
  @ApiQuery({ name: 'locale', required: true })
  async saveWorkbench(
    @Param('menuId') menuId: string,
    @Query('locale') locale: string,
    @Body() body: SaveMenuLocaleWorkbenchDto,
    @Request() req: any,
  ) {
    if (!locale) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    return this.menuTranslationsService.saveWorkbench(tenantId, menuId, locale, body);
  }

  @Post('menus/:menuId/locales')
  @ApiOperation({ summary: 'Agregar idioma (copia textos desde es-ES como punto de partida)' })
  async addLocale(
    @Param('menuId') menuId: string,
    @Body() body: AddMenuLocaleDto,
    @Request() req: any,
  ) {
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    return this.menuTranslationsService.addLocale(tenantId, menuId, body);
  }

  @Delete('menus/:menuId/locales')
  @ApiOperation({ summary: 'Quitar un idioma del menú (borra traducciones y manifest; no permite es-ES)' })
  @ApiQuery({ name: 'locale', required: true, example: 'en-US' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Solo SUPER_ADMIN' })
  async removeLocale(
    @Param('menuId') menuId: string,
    @Query('locale') locale: string,
    @Query('tenantId') tenantIdQuery: string | undefined,
    @Request() req: any,
  ) {
    if (!locale?.trim()) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, undefined, tenantIdQuery);
    return this.menuTranslationsService.removeLocale(tenantId, menuId, locale);
  }

  @Patch('menus/:menuId/locales/rename')
  @ApiOperation({ summary: 'Cambiar código BCP-47 del idioma (migra filas en translations + manifest)' })
  async renameLocale(
    @Param('menuId') menuId: string,
    @Body() body: RenameMenuLocaleDto,
    @Request() req: any,
  ) {
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    return this.menuTranslationsService.renameLocale(tenantId, menuId, body);
  }

  @Post('menus/:menuId/set-default-locale')
  @ApiOperation({
    summary: 'Definir idioma por defecto del menú (debe existir previamente como traducción)',
  })
  async setDefaultLocale(
    @Param('menuId') menuId: string,
    @Body() body: SetDefaultLocaleDto,
    @Request() req: any,
  ) {
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    return this.menuTranslationsService.setDefaultLocale(tenantId, menuId, body.locale);
  }

  @Patch('menus/:menuId/settings')
  @ApiOperation({ summary: 'Nombre del menú (canónico + es-ES) y/o manifest de idiomas extra' })
  async patchSettings(
    @Param('menuId') menuId: string,
    @Body() body: PatchMenuTranslationSettingsDto,
    @Request() req: any,
  ) {
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    return this.menuTranslationsService.patchMenuSettings(tenantId, menuId, body);
  }

  @Get('menus/:menuId/auto-translate/status')
  @ApiOperation({ summary: 'Estado para traducción automática (beta): límites, flags, configuración' })
  @ApiQuery({ name: 'locale', required: true, example: 'en-US' })
  @ApiQuery({ name: 'tenantId', required: false })
  async getAutoTranslateStatus(
    @Param('menuId') menuId: string,
    @Query('locale') locale: string,
    @Query('tenantId') tenantIdQuery: string | undefined,
    @Request() req: any,
  ) {
    if (!locale) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, undefined, tenantIdQuery);
    const userId = req.user?.id as string | undefined;
    if (!userId) throw new ForbiddenException();
    const plan = await this.menuTranslationsService.getTenantPlan(tenantId);
    return this.autoTranslateService.getStatus(tenantId, menuId, userId, locale, plan);
  }

  @Post('menus/:menuId/auto-translate')
  @ApiOperation({ summary: 'Traducción automática (beta) desde es-ES al locale indicado (Google Cloud, servidor)' })
  async postAutoTranslate(
    @Param('menuId') menuId: string,
    @Body() body: PostAutoTranslateDto,
    @Request() req: any,
  ) {
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    const userId = req.user?.id as string | undefined;
    if (!userId) throw new ForbiddenException();
    const plan = await this.menuTranslationsService.getTenantPlan(tenantId);
    if (!this.autoTranslateService.planAllowsAutoTranslateForTenantPlan(plan)) {
      throw new ForbiddenException('Disponible solo en planes Pro, Pro Team o Premium.');
    }
    return this.autoTranslateService.runForMenu({
      tenantId,
      menuId,
      userId,
      targetLocale: body.targetLocale,
      force: !!body.force,
      tenantPlan: plan,
    });
  }

  @Get('restaurants/:restaurantId/locale-coverage')
  @ApiOperation({
    summary: 'Cobertura de un idioma en todos los menús del comercio (faltantes / incompletos / listos)',
  })
  @ApiQuery({ name: 'locale', required: true, example: 'en-US' })
  @ApiQuery({ name: 'tenantId', required: false })
  async getRestaurantLocaleCoverage(
    @Param('restaurantId') restaurantId: string,
    @Query('locale') locale: string,
    @Query('tenantId') tenantIdQuery: string | undefined,
    @Request() req: any,
  ) {
    if (!restaurantId) throw new BadRequestException('restaurantId es requerido');
    if (!locale?.trim()) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, undefined, tenantIdQuery);
    return this.menuTranslationsService.getRestaurantLocaleCoverage(tenantId, restaurantId, locale);
  }

  @Post('restaurants/:restaurantId/set-default-locale')
  @ApiOperation({
    summary:
      'Definir un idioma por defecto en todos los menús del comercio que ya tengan ese idioma agregado',
  })
  async postRestaurantSetDefaultLocale(
    @Param('restaurantId') restaurantId: string,
    @Body() body: SetDefaultLocaleDto,
    @Request() req: any,
  ) {
    if (!restaurantId) throw new BadRequestException('restaurantId es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    return this.menuTranslationsService.setRestaurantDefaultLocale(tenantId, restaurantId, body.locale);
  }

  @Post('restaurants/:restaurantId/remove-locale')
  @ApiOperation({
    summary:
      'Quitar un idioma de todos los menús del comercio (borra traducciones y manifest; omite menús donde es el idioma base)',
  })
  async postRemoveRestaurantLocale(
    @Param('restaurantId') restaurantId: string,
    @Body() body: SetDefaultLocaleDto,
    @Request() req: any,
  ) {
    if (!restaurantId) throw new BadRequestException('restaurantId es requerido');
    if (!body?.locale?.trim()) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    return this.menuTranslationsService.removeRestaurantLocale(tenantId, restaurantId, body.locale);
  }

  /** Alias DELETE (mismo efecto que POST remove-locale). */
  @Delete('restaurants/:restaurantId/locales')
  @ApiOperation({
    summary:
      'Quitar un idioma de todos los menús del comercio (alias de POST …/remove-locale)',
  })
  @ApiQuery({ name: 'locale', required: true, example: 'en-US' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Solo SUPER_ADMIN' })
  async removeRestaurantLocale(
    @Param('restaurantId') restaurantId: string,
    @Query('locale') locale: string,
    @Query('tenantId') tenantIdQuery: string | undefined,
    @Request() req: any,
  ) {
    if (!restaurantId) throw new BadRequestException('restaurantId es requerido');
    if (!locale?.trim()) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, undefined, tenantIdQuery);
    return this.menuTranslationsService.removeRestaurantLocale(tenantId, restaurantId, locale);
  }

  @Post('restaurants/:restaurantId/auto-translate')
  @ApiOperation({
    summary:
      'Traducción automática del idioma destino en todos los menús del comercio que lo tengan. Consume un solo uso mensual.',
  })
  async postRestaurantAutoTranslate(
    @Param('restaurantId') restaurantId: string,
    @Body() body: PostRestaurantAutoTranslateDto,
    @Request() req: any,
  ) {
    if (!restaurantId) throw new BadRequestException('restaurantId es requerido');
    if (!body?.targetLocale) throw new BadRequestException('targetLocale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req, body.tenantId);
    const userId = req.user?.id as string | undefined;
    if (!userId) throw new ForbiddenException();
    const plan = await this.menuTranslationsService.getTenantPlan(tenantId);
    if (!this.autoTranslateService.planAllowsAutoTranslateForTenantPlan(plan)) {
      throw new ForbiddenException('Disponible solo en planes Pro, Pro Team o Premium.');
    }
    const menus = await this.menuTranslationsService.listMenusForRestaurant(tenantId, restaurantId);
    return this.autoTranslateService.runForRestaurant({
      tenantId,
      restaurantId,
      userId,
      targetLocale: body.targetLocale,
      force: !!body.force,
      tenantPlan: plan,
      menus: menus.map((m: { id: string; locales: string[]; sourceLocale?: string }) => ({
        id: m.id,
        locales: m.locales || [],
        sourceLocale: m.sourceLocale,
      })),
    });
  }
}
