import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class PublicPremiumInquiryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  @MaxLength(120, { message: 'El nombre completo no puede superar 120 caracteres.' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio.' })
  @MaxLength(120, { message: 'El nombre del negocio no puede superar 120 caracteres.' })
  businessName: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @MaxLength(40, { message: 'El teléfono no puede superar 40 caracteres.' })
  phone: string;

  @IsEmail({}, { message: 'Ingresá un email válido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Contanos qué necesitás para tu carta digital.' })
  @MaxLength(3000, { message: 'El mensaje no puede superar 3000 caracteres.' })
  message: string;

  @IsString()
  @IsNotEmpty({ message: 'No se pudo validar reCAPTCHA.' })
  recaptchaToken: string;

  @IsOptional()
  @IsIn(['precios', 'plantillas', 'direct'], {
    message: 'Origen inválido para la consulta.',
  })
  sourcePage?: 'precios' | 'plantillas' | 'direct';
}
