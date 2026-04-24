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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MenuTranslationsService } from './menu-translations.service';
import { AddMenuLocaleDto } from './dto/add-menu-locale.dto';
import { RenameMenuLocaleDto } from './dto/rename-menu-locale.dto';
import { SaveMenuLocaleWorkbenchDto } from './dto/save-menu-locale-workbench.dto';
import { PatchMenuTranslationSettingsDto } from './dto/patch-menu-translation-settings.dto';

@ApiTags('menu-translations')
@Controller('menu-translations')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class MenuTranslationsController {
  constructor(private readonly menuTranslationsService: MenuTranslationsService) {}

  @Get('menus')
  @ApiOperation({ summary: 'Listar menús de un restaurante con idiomas detectados (Pro / Pro Team / Super Admin)' })
  @ApiQuery({ name: 'restaurantId', required: true })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Solo SUPER_ADMIN' })
  async listMenus(@Query('restaurantId') restaurantId: string, @Request() req: any) {
    if (!restaurantId) {
      throw new BadRequestException('restaurantId es requerido');
    }
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req);
    return this.menuTranslationsService.listMenusForRestaurant(tenantId, restaurantId);
  }

  @Get('menus/:menuId/workbench')
  @ApiOperation({ summary: 'Obtener textos base (es-ES) y traducciones del locale para editar' })
  @ApiQuery({ name: 'locale', required: true, example: 'en-US' })
  @ApiQuery({ name: 'tenantId', required: false })
  async getWorkbench(
    @Param('menuId') menuId: string,
    @Query('locale') locale: string,
    @Request() req: any,
  ) {
    if (!locale) throw new BadRequestException('locale es requerido');
    const tenantId = await this.menuTranslationsService.assertTranslationsFeature(req);
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
}
