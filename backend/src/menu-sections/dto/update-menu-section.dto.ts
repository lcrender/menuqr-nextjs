import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuSectionDto {
  @ApiProperty({ description: 'Nombre de la sección', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Orden de la sección', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiProperty({ description: 'Estado activo', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

