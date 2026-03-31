import { Equals, IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class SubscriptionCheckoutDto {
  @IsIn(['starter', 'pro', 'premium'])
  planSlug: string;

  @IsIn(['monthly', 'yearly'])
  planType: 'monthly' | 'yearly';

  @IsString()
  returnUrl: string;

  @IsString()
  cancelUrl: string;

  @Equals(true, { message: 'Debés aceptar los términos y condiciones y la política de privacidad.' })
  acceptedTerms: boolean;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  lastName: string;

  @ValidateIf((o) =>
    ['argentina', 'ar', 'arg'].includes(String(o?.country || '').trim().toLowerCase()),
  )
  @IsIn(['DNI', 'CUIT', 'CUIL', 'PASAPORTE'], {
    message: 'Para Argentina, el tipo de documento debe ser DNI, CUIT, CUIL o PASAPORTE.',
  })
  documentType?: 'DNI' | 'CUIT' | 'CUIL' | 'PASAPORTE';

  @ValidateIf((o) =>
    ['argentina', 'ar', 'arg'].includes(String(o?.country || '').trim().toLowerCase()),
  )
  @IsString()
  @IsNotEmpty({ message: 'Para Argentina, el número de documento es obligatorio.' })
  documentNumber?: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  street: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria.' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'La provincia o estado es obligatoria.' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'El código postal es obligatorio.' })
  postalCode: string;

  @IsString()
  @IsNotEmpty({ message: 'El país es obligatorio.' })
  country: string;
}
