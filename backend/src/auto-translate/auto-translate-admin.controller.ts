import { Body, Controller, Get, Param, Patch, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsIn } from 'class-validator';

import { Roles } from '../common/decorators/roles.decorator';
import { AutoTranslateService } from './auto-translate.service';

class PutAutoTranslateGlobalDto {
  @IsBoolean()
  enabled!: boolean;
}

class PatchUserAutoTranslateDto {
  /** inherit = null en BD; on = true; off = false */
  @IsIn(['inherit', 'on', 'off'])
  mode!: 'inherit' | 'on' | 'off';
}

@ApiTags('admin-auto-translate')
@Controller('admin/auto-translate')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class AutoTranslateAdminController {
  constructor(private readonly autoTranslate: AutoTranslateService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Estado global de traducción automática, proveedor activo (Microsoft) y estado de Google (reservado)',
  })
  async getSettings() {
    const globalEnabled = await this.autoTranslate.getAppSettingGlobalEnabled();
    return this.autoTranslate.getAdminSettingsSnapshot(globalEnabled);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Activar o desactivar traducción automática en todo el sistema' })
  async putSettings(@Body() body: PutAutoTranslateGlobalDto) {
    await this.autoTranslate.setAppSettingGlobalEnabled(body.enabled);
    return this.getSettings();
  }

  @Get('usage')
  @ApiOperation({ summary: 'Historial de usos y resumen mensual por usuario' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO timestamptz' })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUsage(
    @Query('userId') userId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.autoTranslate.listUsageForAdmin({
      userId,
      tenantId,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Política por usuario: inherit | on | off' })
  async patchUser(@Param('userId') userId: string, @Body() body: PatchUserAutoTranslateDto) {
    const v = body.mode === 'inherit' ? null : body.mode === 'on';
    await this.autoTranslate.setUserAutoTranslateEnabled(userId, v);
    return { ok: true, userId, mode: body.mode };
  }
}
