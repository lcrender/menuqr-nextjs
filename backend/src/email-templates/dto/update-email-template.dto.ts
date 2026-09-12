import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class EmailTemplateLocaleContentDto {
  @ApiPropertyOptional({ description: 'Asunto del email.' })
  @IsString()
  @IsNotEmpty({ message: 'El asunto no puede estar vacío.' })
  subject!: string;

  @ApiPropertyOptional({ description: 'Cuerpo HTML del email (admite variables {{x}}).' })
  @IsString()
  @IsNotEmpty({ message: 'El cuerpo del email no puede estar vacío.' })
  bodyHtml!: string;
}

export class UpdateEmailTemplateDto {
  @ApiPropertyOptional({ type: EmailTemplateLocaleContentDto, description: 'Contenido en español.' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateLocaleContentDto)
  es?: EmailTemplateLocaleContentDto;

  @ApiPropertyOptional({ type: EmailTemplateLocaleContentDto, description: 'Contenido en inglés.' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateLocaleContentDto)
  en?: EmailTemplateLocaleContentDto;
}
