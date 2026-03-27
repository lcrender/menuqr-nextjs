import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, ValidateIf } from 'class-validator';

export class UpdateAdminMessagesSettingsDto {
  @ApiPropertyOptional({ description: 'Email destino para recibir notificaciones del panel (solo SUPER_ADMIN).' })
  @IsOptional()
  @ValidateIf((o) => o.receiverEmail !== undefined && String(o.receiverEmail).trim() !== '')
  @IsEmail()
  receiverEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyUserCreated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyUserEmailVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifySubscriptionCreated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifySubscriptionPaymentSucceeded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifySubscriptionPaymentFailed?: boolean;
}

