import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class PostAutoTranslateDto {
  @ApiProperty({ example: 'en-US' })
  @IsString()
  @Matches(/^[a-z]{2}-[A-Z]{2}$/)
  targetLocale!: string;

  @ApiProperty({ required: false, description: 'Si true, permite volver a traducir un menú ya procesado (consume un uso).' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @ApiProperty({ required: false, description: 'Solo SUPER_ADMIN' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
