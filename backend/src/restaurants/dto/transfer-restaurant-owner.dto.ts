import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TransferRestaurantOwnerDto {
  @ApiProperty({ description: 'ID del usuario destino (debe pertenecer a un tenant válido)' })
  @IsString()
  targetUserId!: string;
}

