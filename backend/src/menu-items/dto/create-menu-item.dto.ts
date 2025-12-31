import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PriceDto {
  @ApiProperty({ description: 'Moneda', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Etiqueta del precio', example: 'Regular', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ description: 'Monto', example: 10.99 })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateMenuItemDto {
  @ApiProperty({ description: 'ID del menú (opcional - puede crearse sin menú para asignarlo después)', required: false })
  @IsString()
  @IsOptional()
  menuId?: string;

  @ApiProperty({ description: 'ID de la sección (requerido si se proporciona menuId)', required: false })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiProperty({ description: 'Nombre del item' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del item', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Estado activo', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ description: 'Precios del item', type: [PriceDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceDto)
  @IsOptional()
  prices?: PriceDto[];

  @ApiProperty({ description: 'Códigos de iconos', example: ['celiaco', 'vegetariano'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  iconCodes?: string[];
}

