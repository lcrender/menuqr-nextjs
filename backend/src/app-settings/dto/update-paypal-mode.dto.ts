import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdatePayPalModeDto {
  @ApiProperty({
    enum: ['sandbox', 'live'],
    description: 'sandbox = pruebas (PayPal Sandbox); live = cobros reales',
  })
  @IsIn(['sandbox', 'live'])
  mode!: 'sandbox' | 'live';
}
