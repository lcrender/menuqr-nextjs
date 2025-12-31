import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUrl, ValidateIf, IsIn, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'Nombre del restaurante' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del restaurante', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Calle y número', required: false })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ description: 'Ciudad', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Estado/Provincia', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'Código postal', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ description: 'País', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Dirección completa (alternativa a campos individuales)', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Teléfono del restaurante', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'WhatsApp del restaurante', required: false })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiProperty({ description: 'Email del restaurante', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Sitio web del restaurante', required: false })
  @ValidateIf((o) => o.website && o.website.trim() !== '')
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Zona horaria', default: 'UTC', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ 
    description: 'Template de diseño del restaurante', 
    enum: ['classic', 'minimalist', 'foodie', 'burgers', 'italianFood'],
    default: 'classic',
    required: false 
  })
  @IsString()
  @IsIn(['classic', 'minimalist', 'foodie', 'burgers', 'italianFood'])
  @IsOptional()
  template?: string;

  @ApiProperty({ 
    description: 'Moneda de pago por defecto', 
    default: 'USD',
    required: false 
  })
  @IsString()
  @IsOptional()
  defaultCurrency?: string;

  @ApiProperty({ 
    description: 'Monedas adicionales de pago', 
    type: [String],
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additionalCurrencies?: string[];

  @ApiProperty({ 
    description: 'Color primario de marca (hex)', 
    default: '#007bff',
    required: false 
  })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ 
    description: 'Color secundario de marca (hex)', 
    default: '#0056b3',
    required: false 
  })
  @IsString()
  @IsOptional()
  secondaryColor?: string;
}

