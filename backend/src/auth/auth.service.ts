import { Injectable, UnauthorizedException, BadRequestException, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// DTOs
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// Servicios
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { EmailService } from '../common/email/email.service';

// Entidades
import { User, UserRole } from '@prisma/client';

// Tipo extendido para incluir campos de verificación de email
type UserWithVerification = User & {
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerifiedAt: Date | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  // ========================================
  // AUTENTICACIÓN
  // ========================================

  /**
   * Valida las credenciales del usuario
   */
  async validateUser(email: string, password: string): Promise<UserWithVerification> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Verificar que el email esté verificado
      if (!user.emailVerified) {
        throw new UnauthorizedException('Por favor, verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Actualizar último login
      await this.usersService.updateLastLogin(user.id);

      return user;
    } catch (error) {
      this.logger.error(`Error validando usuario ${email}:`, error);
      throw error;
    }
  }

  /**
   * Login del usuario
   */
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Validar credenciales
      const user = await this.validateUser(email, password);

      // Generar tokens
      const tokens = await this.generateTokens(user);

      // Obtener información del tenant si aplica
      let tenant = null;
      if (user.tenantId) {
        tenant = await this.tenantsService.findById(user.tenantId);
      }

      this.logger.log(`Usuario ${email} autenticado exitosamente`);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId,
          tenant: tenant ? {
            id: tenant.id,
            name: tenant.name,
            plan: tenant.plan,
          } : null,
        },
        ...tokens,
      };
    } catch (error) {
      this.logger.error(`Error en login para ${loginDto.email}:`, error);
      throw error;
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    try {
      const { email, password, firstName, lastName, tenantName } = registerDto;

      // Verificar si el email ya existe
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('El email ya está registrado');
      }

      // Validar contraseña
      this.validatePassword(password);

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(
        password,
        parseInt(this.configService.get('BCRYPT_ROUNDS', '12'))
      );

      // Crear tenant automáticamente para cada nuevo usuario con plan "free"
      // Si se especifica un nombre, usarlo; si no, usar el email como nombre
      const tenantNameToUse = tenantName || `${firstName} ${lastName}`.trim() || email.split('@')[0];
      
      const tenant = await this.tenantsService.create({
        name: tenantNameToUse,
        plan: 'free',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          language: 'es-ES',
        },
      });

      // Generar token de verificación de email
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Crear usuario con rol ADMIN y tenant asignado (email no verificado inicialmente)
      const user = await this.usersService.create({
        email,
        passwordHash,
        firstName,
        lastName,
        role: UserRole.ADMIN,
        tenantId: tenant.id,
        isActive: true,
        emailVerified: false,
        emailVerificationToken,
      });

      // Enviar email de verificación
      try {
        await this.emailService.sendEmailVerification(
          email,
          firstName || 'Usuario',
          emailVerificationToken,
        );
      } catch (emailError) {
        this.logger.error(`Error enviando email de verificación a ${email}:`, emailError);
        // No fallar el registro si el email falla, solo loguear el error
      }

      this.logger.log(`Usuario ${email} registrado exitosamente. Email de verificación enviado.`);

      // NO generar tokens de acceso hasta que el email esté verificado
      // Retornar mensaje indicando que debe verificar el email
      return {
        message: 'Usuario registrado exitosamente. Por favor, verifica tu email para activar tu cuenta.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId,
          emailVerified: false,
        },
        requiresEmailVerification: true,
      };
    } catch (error: any) {
      this.logger.error('Error en registro:', error?.message ?? error);
      if (error?.stack) this.logger.debug(error.stack);
      if (error?.code) this.logger.error(`Código error (DB/otro): ${error.code}`);
      if (error?.detail) this.logger.error(`Detalle: ${error.detail}`);
      // Reenviar excepciones HTTP (4xx) tal cual
      if (error?.statusCode && error?.statusCode >= 400 && error?.statusCode < 500) throw error;
      throw new InternalServerErrorException(
        'No se pudo completar el registro. Revisá los logs del backend para más detalle.',
      );
    }
  }

  /**
   * Verificar email con token
   */
  async verifyEmail(token: string) {
    try {
      const user = await this.usersService.verifyEmail(token);

      // Generar tokens después de verificar el email
      const tokens = await this.generateTokens(user);

      this.logger.log(`Email verificado exitosamente para ${user.email}`);

      return {
        message: 'Email verificado exitosamente. Tu cuenta ha sido activada.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId,
          emailVerified: true,
        },
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Error verificando email:', error);
      throw error;
    }
  }

  /**
   * Refresh del token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken } = refreshTokenDto;

      // Verificar refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Obtener usuario
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no válido');
      }

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`Token refrescado para usuario ${user.email}`);

      return tokens;
    } catch (error) {
      this.logger.error('Error refrescando token:', error);
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;

      const user = await this.usersService.findByEmail(email);
      if (!user || !user.isActive) {
        // Por seguridad, no revelar si el email existe o no
        this.logger.log(`Solicitud de recuperación de contraseña para ${email} (usuario no encontrado)`);
        return { message: 'Si el email está registrado, recibirás un enlace de recuperación' };
      }

      // Generar token de reset
      const resetToken = await this.generateResetToken(user.id);

      // Enviar email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName || 'Usuario',
        resetToken
      );

      this.logger.log(`Email de recuperación enviado a ${email}`);

      return { message: 'Si el email está registrado, recibirás un enlace de recuperación' };
    } catch (error) {
      this.logger.error(`Error en forgot password para ${forgotPasswordDto.email}:`, error);
      // Por seguridad, siempre retornar el mismo mensaje
      return { message: 'Si el email está registrado, recibirás un enlace de recuperación' };
    }
  }

  /**
   * Reset de contraseña
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, newPassword } = resetPasswordDto;

      // Verificar token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Validar nueva contraseña
      this.validatePassword(newPassword);

      // Hash de la nueva contraseña
      const passwordHash = await bcrypt.hash(
        newPassword,
        parseInt(this.configService.get('BCRYPT_ROUNDS', '12'))
      );

      // Actualizar contraseña
      await this.usersService.updatePassword(payload.sub, passwordHash);

      this.logger.log(`Contraseña actualizada para usuario ${payload.sub}`);

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      this.logger.error('Error en reset password:', error);
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  /**
   * Logout del usuario
   */
  async logout(userId: string) {
    try {
      // En una implementación real, aquí podrías invalidar el refresh token
      // Por ahora, solo logueamos la acción
      this.logger.log(`Usuario ${userId} ha cerrado sesión`);
      
      return { message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      this.logger.error(`Error en logout para usuario ${userId}:`, error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Genera tokens JWT
   */
  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    };
  }

  /**
   * Genera token de reset de contraseña
   */
  private async generateResetToken(userId: string) {
    const payload = {
      sub: userId,
      type: 'password_reset',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h', // Token de reset expira en 1 hora
    });
  }

  /**
   * Valida la contraseña según las políticas
   */
  private validatePassword(password: string) {
    const minLength = parseInt(this.configService.get('PASSWORD_MIN_LENGTH', '8'));
    const requireUppercase = this.configService.get('PASSWORD_REQUIRE_UPPERCASE', 'true') === 'true';
    const requireLowercase = this.configService.get('PASSWORD_REQUIRE_LOWERCASE', 'true') === 'true';
    const requireNumbers = this.configService.get('PASSWORD_REQUIRE_NUMBERS', 'true') === 'true';
    const requireSpecialChars = this.configService.get('PASSWORD_REQUIRE_SPECIAL_CHARS', 'true') === 'true';

    if (password.length < minLength) {
      throw new BadRequestException(`La contraseña debe tener al menos ${minLength} caracteres`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new BadRequestException('La contraseña debe contener al menos una mayúscula');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new BadRequestException('La contraseña debe contener al menos una minúscula');
    }

    if (requireNumbers && !/\d/.test(password)) {
      throw new BadRequestException('La contraseña debe contener al menos un número');
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new BadRequestException('La contraseña debe contener al menos un carácter especial');
    }
  }
}

