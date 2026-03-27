import { Body, Controller, Get, Patch, Post, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateAdminMessagesSettingsDto } from './dto/update-admin-messages-settings.dto';
import { AdminMessagesService } from './admin-messages.service';

@ApiTags('admin-messages')
@Controller('admin/messages')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class AdminMessagesController {
  constructor(private readonly adminMessages: AdminMessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración de alertas por email (SUPER_ADMIN)' })
  @ApiResponse({ status: 200 })
  async getSettings() {
    return this.adminMessages.getCurrentSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Guardar configuración de alertas por email (SUPER_ADMIN)' })
  @ApiResponse({ status: 200 })
  async updateSettings(@Body() body: UpdateAdminMessagesSettingsDto) {
    const patch: any = { receiverEmail: body.receiverEmail };
    const eventsPatch: any = {};
    if (body.notifyUserCreated !== undefined) eventsPatch.user_created = body.notifyUserCreated;
    if (body.notifyUserEmailVerified !== undefined) eventsPatch.user_email_verified = body.notifyUserEmailVerified;
    if (body.notifySubscriptionCreated !== undefined) eventsPatch.subscription_created = body.notifySubscriptionCreated;
    if (body.notifySubscriptionPaymentSucceeded !== undefined)
      eventsPatch.subscription_payment_succeeded = body.notifySubscriptionPaymentSucceeded;
    if (body.notifySubscriptionPaymentFailed !== undefined)
      eventsPatch.subscription_payment_failed = body.notifySubscriptionPaymentFailed;

    return this.adminMessages.updateSettings({ ...patch, events: eventsPatch });
  }

  @Post('test')
  @ApiOperation({ summary: 'Enviar email de prueba a la casilla configurada (SUPER_ADMIN)' })
  @ApiResponse({ status: 200 })
  async sendTest() {
    try {
      return await this.adminMessages.sendTestEmail();
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'No se pudo enviar el email de prueba');
    }
  }
}

