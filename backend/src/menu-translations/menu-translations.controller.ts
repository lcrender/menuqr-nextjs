import {
  Body,
  Controller,
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
  @ApiOperation({ summary: 'Listar menús de un restaurante con idiomas detectados (Pro / Pro Team / Super Admin)' })
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
}
