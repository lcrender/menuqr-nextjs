import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplatesService } from './email-templates.service';

@ApiTags('admin-email-templates')
@Controller('admin/email-templates')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class EmailTemplatesController {
  constructor(private readonly emailTemplates: EmailTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar plantillas de email del sistema (SUPER_ADMIN)' })
  @ApiResponse({ status: 200 })
  async list() {
    return this.emailTemplates.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una plantilla con su contenido efectivo (SUPER_ADMIN)' })
  @ApiResponse({ status: 200 })
  async getOne(@Param('id') id: string) {
    return this.emailTemplates.getOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Guardar el contenido de una plantilla (SUPER_ADMIN)' })
  @ApiResponse({ status: 200 })
  async update(@Param('id') id: string, @Body() body: UpdateEmailTemplateDto) {
    return this.emailTemplates.update(id, body);
  }

  @Post(':id/reset')
  @ApiOperation({ summary: 'Restaurar una plantilla al contenido por defecto (SUPER_ADMIN)' })
  @ApiResponse({ status: 200 })
  async reset(@Param('id') id: string) {
    return this.emailTemplates.reset(id);
  }
}
