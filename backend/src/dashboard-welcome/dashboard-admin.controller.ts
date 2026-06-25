import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateDashboardCtaCardsDto } from './dto/update-dashboard-cta-card.dto';
import { UpdateDashboardWelcomeDto } from './dto/update-dashboard-welcome.dto';
import { DashboardWelcomeService } from './dashboard-welcome.service';

@ApiTags('admin-dashboard')
@Controller('admin/dashboard')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class DashboardAdminController {
  constructor(private readonly dashboardWelcome: DashboardWelcomeService) {}

  @Get('welcome-messages')
  @ApiOperation({ summary: 'Mensajes de bienvenida del dashboard por plan (SUPER_ADMIN)' })
  getWelcomeSettings() {
    return this.dashboardWelcome.getAdminView();
  }

  @Patch('welcome-messages')
  @ApiOperation({ summary: 'Guardar mensajes de bienvenida del dashboard (SUPER_ADMIN)' })
  updateWelcomeSettings(@Body() body: UpdateDashboardWelcomeDto) {
    return this.dashboardWelcome.updateSettings(body);
  }

  @Get('cta-card')
  @ApiOperation({ summary: 'Contenido de la card promocional del dashboard (SUPER_ADMIN)' })
  getCtaCardSettings() {
    return this.dashboardWelcome.getCtaCardAdmin();
  }

  @Patch('cta-card')
  @ApiOperation({ summary: 'Guardar card promocional del dashboard (SUPER_ADMIN)' })
  updateCtaCardSettings(@Body() body: UpdateDashboardCtaCardsDto) {
    return this.dashboardWelcome.updateCtaCards(body);
  }
}
