import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplySupportTicketDto {
  @ApiProperty({ maxLength: 8000 })
  @IsString()
  @MinLength(1, { message: 'El mensaje no puede estar vacío.' })
  @MaxLength(8000, { message: 'El mensaje no puede superar los 8000 caracteres.' })
  message!: string;
}
