import { Controller, Get, Param, Request, Query, Patch, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { BadRequestException } from '@nestjs/common';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios con estadísticas' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios con estadísticas' })
  async findAllWithStats(
    @Request() req,
    @Query('email') email?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;
    return this.usersService.findAllWithStats(email, limitNum, offsetNum);
  }

  @Delete('remove/:id')
  @ApiOperation({ summary: 'Eliminar usuario (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  async deleteUser(@Param('id') id: string, @Request() req) {
    if (req.user?.id === id) {
      throw new BadRequestException('No puedes eliminar tu propio usuario');
    }
    await this.usersService.deleteUser(id);
    return { message: 'Usuario eliminado' };
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Activar o desactivar usuario' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async setActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @Request() req,
  ) {
    if (req.user?.id === id) {
      throw new BadRequestException('No puedes desactivar tu propio usuario');
    }
    await this.usersService.setActive(id, body.isActive);
    return { message: body.isActive ? 'Usuario activado' : 'Usuario desactivado' };
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener detalles completos de un usuario' })
  @ApiResponse({ status: 200, description: 'Detalles del usuario con restaurantes, menús y productos' })
  async getUserDetails(@Param('id') id: string) {
    return this.usersService.getUserDetails(id);
  }
}

