import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { UpdatePromoReminderSettingsDto } from './dto/promo-reminder-settings.dto';
import { PromoCodesService } from './promo-codes.service';
import { PromoReminderService } from './promo-reminder.service';

@ApiTags('admin-promo-codes')
@Controller('admin/promo-codes')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class PromoCodesAdminController {
  constructor(
    private readonly promoCodes: PromoCodesService,
    private readonly promoReminder: PromoReminderService,
  ) {}

  @Get('reminder-settings')
  @ApiOperation({ summary: 'Configuración de recordatorios por email (SUPER_ADMIN)' })
  getReminderSettings() {
    return this.promoReminder.getSettings();
  }

  @Patch('reminder-settings')
  @ApiOperation({ summary: 'Guardar recordatorios por email (SUPER_ADMIN)' })
  updateReminderSettings(@Body() body: UpdatePromoReminderSettingsDto) {
    return this.promoReminder.updateSettings(body);
  }

  @Post('reminder-settings/test')
  @ApiOperation({ summary: 'Enviar email de prueba de recordatorio (SUPER_ADMIN)' })
  async testReminderEmail(@Request() req: any) {
    const email = req.user?.email;
    if (!email) throw new BadRequestException('No se pudo determinar el email del super admin');
    try {
      return await this.promoReminder.sendTestEmail(email);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'No se pudo enviar el email de prueba');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar códigos promocionales' })
  list(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('plan') plan?: string,
  ) {
    return this.promoCodes.list({
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      plan,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Crear código promocional' })
  create(@Request() req: any, @Body() body: CreatePromoCodeDto) {
    return this.promoCodes.create(body, req.user.id);
  }

  @Get(':id/redemptions')
  @ApiOperation({ summary: 'Historial de canjes de un código' })
  redemptions(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.promoCodes.listRedemptions(
      id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de código promocional' })
  findOne(@Param('id') id: string) {
    return this.promoCodes.findById(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar código promocional' })
  deactivate(@Param('id') id: string) {
    return this.promoCodes.deactivate(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar código promocional' })
  update(@Param('id') id: string, @Body() body: UpdatePromoCodeDto) {
    return this.promoCodes.update(id, body);
  }
}
