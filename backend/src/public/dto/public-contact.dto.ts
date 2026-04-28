import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PublicContactDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  @MaxLength(120, { message: 'El nombre completo no puede superar 120 caracteres.' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @MaxLength(40, { message: 'El teléfono no puede superar 40 caracteres.' })
  phone: string;

  @IsEmail({}, { message: 'Ingresá un email válido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje es obligatorio.' })
  @MaxLength(3000, { message: 'El mensaje no puede superar 3000 caracteres.' })
  message: string;

  @IsString()
  @IsNotEmpty({ message: 'No se pudo validar reCAPTCHA.' })
  recaptchaToken: string;

  @IsIn(['privacidad', 'cookies', 'terminos'], {
    message: 'Origen inválido para el formulario de contacto.',
  })
  sourcePage: 'privacidad' | 'cookies' | 'terminos';
}
