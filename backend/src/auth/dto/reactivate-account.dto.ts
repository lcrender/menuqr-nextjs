import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReactivateAccountDto {
  @ApiProperty({ description: 'Token del email de reactivación' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token: string;
}
