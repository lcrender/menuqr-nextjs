import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, Min, IsNotEmpty } from 'class-validator';
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

export class UpdateMenuItemDto {
  @ApiProperty({ description: 'Nombre del item', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Descripción del item', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Estado activo', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ description: 'ID de la sección', required: false })
  @IsString()
  @IsOptional()
  sectionId?: string;

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

