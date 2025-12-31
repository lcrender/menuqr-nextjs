import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuSectionDto {
  @ApiProperty({ description: 'ID del menú' })
  @IsString()
  @IsNotEmpty()
  menuId: string;

  @ApiProperty({ description: 'Nombre de la sección' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Orden de la sección', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiProperty({ description: 'Estado activo', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

