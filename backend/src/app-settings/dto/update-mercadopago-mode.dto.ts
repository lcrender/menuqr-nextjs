import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateMercadoPagoModeDto {
  @ApiProperty({ enum: ['sandbox', 'production'], description: 'sandbox = prueba (token de test), production = cobros reales' })
  @IsIn(['sandbox', 'production'])
  mode!: 'sandbox' | 'production';
}
