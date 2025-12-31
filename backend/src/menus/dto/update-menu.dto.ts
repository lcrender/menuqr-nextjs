import { IsString, IsOptional, IsDateString, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiProperty({ description: 'ID del restaurante', required: false })
  @IsString()
  @IsOptional()
  restaurantId?: string;

  @ApiProperty({ description: 'Nombre del menú', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Descripción del menú', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Estado del menú', 
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    required: false 
  })
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Fecha de inicio de validez', required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty({ description: 'Fecha de fin de validez', required: false })
  @IsDateString()
  @IsOptional()
  validTo?: string;

  @ApiProperty({ description: 'Estado activo', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

