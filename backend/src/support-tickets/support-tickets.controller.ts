import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminListSupportTicketsQueryDto } from './dto/admin-list-support-tickets.query.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('support-tickets')
@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportTicketsController {
  constructor(private readonly supportTickets: SupportTicketsService) {}

  // --- Super Admin (rutas estáticas antes de :id) ---

  @Get('admin')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar todos los tickets (Super Admin)' })
  async adminList(@Query() query: AdminListSupportTicketsQueryDto) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return this.supportTickets.listAdmin({
      status: query.status,
      userEmail: query.userEmail,
      from: from && !isNaN(from.getTime()) ? from : undefined,
      to: to && !isNaN(to.getTime()) ? to : undefined,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get('admin/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Detalle de ticket con usuario y suscripciones (Super Admin)' })
  async adminGet(@Param('id') id: string) {
    return this.supportTickets.getAdmin(id);
  }

  @Patch('admin/:id/status')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Cambiar estado del ticket (Super Admin)' })
  async adminPatchStatus(@Request() req: any, @Param('id') id: string, @Body() body: UpdateTicketStatusDto) {
    return this.supportTickets.updateStatusAdmin(req.user.role as UserRole, id, body.status);
  }

  @Post('admin/:id/messages')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Responder ticket como Super Admin' })
  async adminReply(@Request() req: any, @Param('id') id: string, @Body() body: ReplySupportTicketDto) {
    return this.supportTickets.replyAdmin(req.user.id, req.user.role as UserRole, id, body);
  }

  // --- Usuario (ADMIN / SUPER_ADMIN de la app) ---

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear ticket de soporte' })
  async create(@Request() req: any, @Body() body: CreateSupportTicketDto) {
    return this.supportTickets.create(req.user.id, req.user.role as UserRole, body);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar mis tickets' })
  async listMine(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : undefined;
    const o = offset ? parseInt(offset, 10) : undefined;
    return this.supportTickets.listMine(req.user.id, l, o);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Ver detalle de un ticket propio' })
  async getMine(@Request() req: any, @Param('id') id: string) {
    return this.supportTickets.getMine(req.user.id, id);
  }

  @Post(':id/messages')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Responder un ticket propio' })
  async replyMine(@Request() req: any, @Param('id') id: string, @Body() body: ReplySupportTicketDto) {
    return this.supportTickets.replyMine(req.user.id, req.user.role as UserRole, id, body);
  }
}
