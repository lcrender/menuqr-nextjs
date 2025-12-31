import { IsArray, ValidateNested, IsString, IsNumber, ArrayMinSize, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MenuOrderDto {
  @ApiProperty({ description: 'ID del menú' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Orden del menú' })
  @Transform(({ value }) => typeof value === 'string' ? parseInt(value, 10) : value)
  @IsNumber()
  sort: number;
}

export class ReorderMenusDto {
  @ApiProperty({ 
    description: 'Array de menús con su nuevo orden',
    type: [MenuOrderDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuOrderDto)
  menuOrders: MenuOrderDto[];

  @ApiProperty({ description: 'ID del tenant (solo para SUPER_ADMIN)', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}

