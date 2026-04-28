import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'No puedo publicar un menú', maxLength: 200 })
  @IsString()
  @MinLength(3, { message: 'El asunto debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'El asunto no puede superar los 200 caracteres.' })
  subject!: string;

  @ApiProperty({ example: 'Pasos: ...', maxLength: 8000 })
  @IsString()
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres.' })
  @MaxLength(8000, { message: 'El mensaje no puede superar los 8000 caracteres.' })
  message!: string;
}
