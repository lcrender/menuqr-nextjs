import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class LinkSupportTicketDto {
  @ApiProperty({
    description: 'Número visible del ticket principal al que se desea unir este ticket',
    example: 1042,
  })
  @Type(() => Number)
  @IsInt({ message: 'El número de ticket destino debe ser un entero.' })
  @Min(1, { message: 'El número de ticket destino debe ser mayor a 0.' })
  targetTicketNumber!: number;
}

