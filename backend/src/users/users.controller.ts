import { Controller, Get, Param, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';

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

  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener detalles completos de un usuario' })
  @ApiResponse({ status: 200, description: 'Detalles del usuario con restaurantes, menús y productos' })
  async getUserDetails(@Param('id') id: string) {
    return this.usersService.getUserDetails(id);
  }
}

