import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../common/decorators/roles.decorator';
import { AppSettingsService } from './app-settings.service';
import { UpdateMercadoPagoModeDto } from './dto/update-mercadopago-mode.dto';

@ApiTags('admin-mercadopago')
@Controller('admin/mercadopago-config')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class MercadoPagoConfigController {
  constructor(
    private readonly appSettings: AppSettingsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Modo Mercado Pago (prueba / producción)' })
  @ApiResponse({ status: 200 })
  async getConfig() {
    const mode = await this.appSettings.getMercadoPagoMode();
    const prod = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN')?.trim();
    const test = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN_TEST')?.trim();
    return {
      mode,
      hasProductionTokenConfigured: !!prod,
      hasTestTokenConfigured: !!test,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Cambiar modo Mercado Pago' })
  @ApiResponse({ status: 200 })
  async updateMode(@Body() body: UpdateMercadoPagoModeDto) {
    const mode = await this.appSettings.setMercadoPagoMode(body.mode);
    const prod = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN')?.trim();
    const test = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN_TEST')?.trim();
    return {
      mode,
      hasProductionTokenConfigured: !!prod,
      hasTestTokenConfigured: !!test,
    };
  }
}
