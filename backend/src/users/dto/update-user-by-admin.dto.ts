import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserByAdminDto {
  @ApiProperty({
    description: 'Región/país de facturación (AR = Argentina, null/vacío = resto del mundo, USD/PayPal)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  declaredCountry?: string | null;
}
