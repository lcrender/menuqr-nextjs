import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsOptional, IsIn, IsBoolean, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiContraseña123!',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  lastName?: string;

  @ApiProperty({
    description: 'Nombre del tenant/empresa (opcional)',
    example: 'Mi Comercio S.A.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del tenant debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre del tenant debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre del tenant no puede exceder 100 caracteres' })
  tenantName?: string;

  @ApiProperty({
    description: 'Plan pendiente elegido antes del registro (flujo checkout tras verificación)',
    example: 'pro',
    required: false,
  })
  @IsOptional()
  @IsIn(['starter', 'pro', 'premium'])
  pendingPlan?: 'starter' | 'pro' | 'premium';

  @ApiProperty({
    description: 'Ciclo de facturación pendiente para el plan elegido',
    example: 'monthly',
    required: false,
  })
  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  pendingBillingCycle?: 'monthly' | 'yearly';

  @ApiProperty({
    description: 'Debe ser true: aceptación de Términos y Condiciones y Política de Privacidad',
    example: true,
  })
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean({ message: 'Debés aceptar los Términos y Condiciones y la Política de Privacidad.' })
  @Equals(true, { message: 'Debés aceptar los Términos y Condiciones y la Política de Privacidad.' })
  acceptTerms!: boolean;

  @ApiProperty({
    description: 'Opt-in para recibir novedades y consejos de MenuQR (opcional)',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    return value === true || value === 'true' || value === 1 || value === '1';
  })
  @IsBoolean()
  marketingOptIn?: boolean;

  @ApiProperty({
    description: 'Zona horaria IANA del navegador (ej. America/Argentina/Buenos_Aires)',
    example: 'America/Argentina/Buenos_Aires',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiProperty({
    description: 'Token reCAPTCHA v3 (obligatorio si el servidor tiene GOOGLE_RECAPTCHA_SECRET_KEY)',
    required: false,
  })
  @IsOptional()
  @IsString()
  recaptchaToken?: string;

  @ApiProperty({
    description: 'Idioma preferido de la interfaz (es|en)',
    example: 'es',
    required: false,
    enum: ['es', 'en'],
  })
  @IsOptional()
  @IsIn(['es', 'en'])
  preferredLanguage?: 'es' | 'en';
}

