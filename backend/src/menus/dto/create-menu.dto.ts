import { IsString, IsNotEmpty, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ description: 'ID del restaurante', required: false })
  @IsString()
  @IsOptional()
  restaurantId?: string;

  @ApiProperty({ description: 'Nombre del menú' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del menú', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Fecha de inicio de validez', required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty({ description: 'Fecha de fin de validez', required: false })
  @IsDateString()
  @IsOptional()
  validTo?: string;
}

