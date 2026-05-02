import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../common/decorators/roles.decorator';
import { readEnvTrimmed } from '../common/config/read-env-trimmed';
import { AppSettingsService } from './app-settings.service';
import { UpdatePayPalModeDto } from './dto/update-paypal-mode.dto';

@ApiTags('admin-paypal')
@Controller('admin/paypal-config')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class PayPalConfigController {
  constructor(
    private readonly appSettings: AppSettingsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Modo PayPal (sandbox / live)' })
  @ApiResponse({ status: 200 })
  async getConfig() {
    const databaseMode = await this.appSettings.getStoredPayPalMode();
    const envRaw = this.config.get<string>('PAYPAL_MODE', 'sandbox');
    const environmentFallbackMode = envRaw === 'live' ? 'live' : 'sandbox';
    const effectiveMode = databaseMode ?? environmentFallbackMode;
    const clientId = readEnvTrimmed('PAYPAL_CLIENT_ID', this.config);
    const secret = readEnvTrimmed('PAYPAL_SECRET', this.config);
    return {
      mode: effectiveMode,
      databaseMode,
      environmentFallbackMode,
      savedInDatabase: databaseMode !== null,
      hasCredentialsConfigured: !!(clientId && secret),
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Cambiar modo PayPal' })
  @ApiResponse({ status: 200 })
  async updateMode(@Body() body: UpdatePayPalModeDto) {
    const databaseMode = await this.appSettings.setPayPalMode(body.mode);
    const envRaw = this.config.get<string>('PAYPAL_MODE', 'sandbox');
    const environmentFallbackMode = envRaw === 'live' ? 'live' : 'sandbox';
    const clientId = readEnvTrimmed('PAYPAL_CLIENT_ID', this.config);
    const secret = readEnvTrimmed('PAYPAL_SECRET', this.config);
    return {
      mode: databaseMode,
      databaseMode,
      environmentFallbackMode,
      savedInDatabase: true,
      hasCredentialsConfigured: !!(clientId && secret),
    };
  }
}
