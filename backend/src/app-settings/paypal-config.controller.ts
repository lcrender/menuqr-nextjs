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
    const liveId = readEnvTrimmed('PAYPAL_CLIENT_ID', this.config);
    const liveSec = readEnvTrimmed('PAYPAL_SECRET', this.config);
    const sbId = readEnvTrimmed('PAYPAL_CLIENT_ID_SANDBOX', this.config);
    const sbSec = readEnvTrimmed('PAYPAL_SECRET_SANDBOX', this.config);
    const hasLiveCredentialsConfigured = !!(liveId && liveSec);
    const hasSandboxCredentialsConfigured =
      !!(sbId && sbSec) || (!(sbId && sbSec) && !!(liveId && liveSec));
    const hasCredentialsConfigured =
      effectiveMode === 'live' ? hasLiveCredentialsConfigured : hasSandboxCredentialsConfigured;
    return {
      mode: effectiveMode,
      databaseMode,
      environmentFallbackMode,
      savedInDatabase: databaseMode !== null,
      hasLiveCredentialsConfigured,
      hasSandboxCredentialsConfigured,
      hasCredentialsConfigured,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Cambiar modo PayPal' })
  @ApiResponse({ status: 200 })
  async updateMode(@Body() body: UpdatePayPalModeDto) {
    const databaseMode = await this.appSettings.setPayPalMode(body.mode);
    const envRaw = this.config.get<string>('PAYPAL_MODE', 'sandbox');
    const environmentFallbackMode = envRaw === 'live' ? 'live' : 'sandbox';
    const liveId = readEnvTrimmed('PAYPAL_CLIENT_ID', this.config);
    const liveSec = readEnvTrimmed('PAYPAL_SECRET', this.config);
    const sbId = readEnvTrimmed('PAYPAL_CLIENT_ID_SANDBOX', this.config);
    const sbSec = readEnvTrimmed('PAYPAL_SECRET_SANDBOX', this.config);
    const hasLiveCredentialsConfigured = !!(liveId && liveSec);
    const hasSandboxCredentialsConfigured =
      !!(sbId && sbSec) || (!(sbId && sbSec) && !!(liveId && liveSec));
    const hasCredentialsConfigured =
      databaseMode === 'live' ? hasLiveCredentialsConfigured : hasSandboxCredentialsConfigured;
    return {
      mode: databaseMode,
      databaseMode,
      environmentFallbackMode,
      savedInDatabase: true,
      hasLiveCredentialsConfigured,
      hasSandboxCredentialsConfigured,
      hasCredentialsConfigured,
    };
  }
}
