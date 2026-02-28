import { Controller, Get, Post, Patch, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { GeoService } from '../geo/geo.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly geoService: GeoService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async register(@Body() registerDto: RegisterDto, @Request() req: any) {
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (typeof v === 'string') headers[k] = v;
      else if (Array.isArray(v) && v[0]) headers[k] = v[0];
    }
    const registrationCountry = await this.geoService.getCountryFromRequest(req.ip || req.socket?.remoteAddress, headers);
    return this.authService.register(registerDto, registrationCountry ?? undefined);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refrescado exitosamente' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Email de recuperación enviado' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email con token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
      required: ['token'],
    },
  })
  @ApiResponse({ status: 200, description: 'Email verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('confirm-email-change')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar cambio de email con token del enlace' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { token: { type: 'string' } },
      required: ['token'],
    },
  })
  @ApiResponse({ status: 200, description: 'Email actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async confirmEmailChange(@Body() body: { token: string }) {
    return this.authService.confirmEmailChange(body.token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener mi perfil (usuario autenticado)' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return { user: null };
    const tenant = user.tenantId ? await this.tenantsService.findById(user.tenantId) : null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      registrationCountry: user.registrationCountry,
      declaredCountry: user.declaredCountry,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      tenant: tenant ? { id: tenant.id, name: tenant.name, plan: tenant.plan } : null,
    };
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña (usuario autenticado)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string' },
        revokeOtherSessions: { type: 'boolean', default: false },
      },
      required: ['currentPassword', 'newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean },
  ) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword, {
      revokeOtherSessions: body.revokeOtherSessions === true,
    });
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'Listar sesiones activas' })
  @ApiResponse({ status: 200, description: 'Lista de sesiones' })
  async getSessions(@Request() req: any) {
    return this.authService.getActiveSessions(req.user.id);
  }

  @Post('me/revoke-all-sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar todas las sesiones (excepto la actual)' })
  @ApiResponse({ status: 200, description: 'Sesiones revocadas' })
  async revokeAllSessions(@Request() req: any) {
    return this.authService.revokeAllSessions(req.user.id);
  }

  @Post('me/request-email-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar cambio de email (envía correo de confirmación al nuevo email)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newEmail: { type: 'string', format: 'email' },
        currentPassword: { type: 'string' },
      },
      required: ['newEmail', 'currentPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Email de confirmación enviado' })
  @ApiResponse({ status: 400, description: 'Contraseña incorrecta o email ya en uso' })
  async requestEmailChange(
    @Request() req: any,
    @Body() body: { newEmail: string; currentPassword: string },
  ) {
    return this.authService.changeEmailRequest(req.user.id, body.newEmail, body.currentPassword);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        declaredCountry: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado' })
  async updateMe(@Request() req: any, @Body() body: { firstName?: string; lastName?: string; declaredCountry?: string | null }) {
    const user = await this.usersService.updateProfile(req.user.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      declaredCountry: body.declaredCountry,
    });
    const tenant = user.tenantId ? await this.tenantsService.findById(user.tenantId) : null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      registrationCountry: user.registrationCountry,
      declaredCountry: user.declaredCountry,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      tenant: tenant ? { id: tenant.id, name: tenant.name, plan: tenant.plan } : null,
    };
  }
}

