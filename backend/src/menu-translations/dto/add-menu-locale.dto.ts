import { Transform } from 'class-transformer';
import { IsString, IsOptional, Matches, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MENU_FLAG_CODE_MAX_LENGTH,
  MENU_FLAG_CODE_REGEX,
  MENU_LOCALE_BCP47_REGEX,
  MENU_LOCALE_MAX_LENGTH,
} from '../menu-locale.constants';

export class AddMenuLocaleDto {
  @ApiProperty({ example: 'en-US' })
  @IsString()
  @MaxLength(MENU_LOCALE_MAX_LENGTH)
  @Matches(MENU_LOCALE_BCP47_REGEX, {
    message: 'locale debe ser BCP-47 con subtag (ej. en-US, es-MX, zh-CN, zh-Hans-CN).',
  })
  locale!: string;

  @ApiProperty({ required: false, description: 'Etiqueta visible en el panel' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @ApiProperty({
    required: false,
    description: 'ISO país 2 letras para emoji regional (ES, US) o etiqueta corta (ej. CAT), 2–10 caracteres.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const t = value.trim().toUpperCase();
    return t.length === 0 ? undefined : t;
  })
  @IsString()
  @MaxLength(MENU_FLAG_CODE_MAX_LENGTH)
  @Matches(MENU_FLAG_CODE_REGEX, {
    message: 'flagCode: 2–10 letras o dígitos (ej. ES, CAT).',
  })
  flagCode?: string;

  @ApiProperty({ required: false, description: 'Si es false, no se muestra en el menú público' })
  @IsOptional()
  @IsBoolean()
  enabledPublic?: boolean;

  @ApiProperty({ required: false, description: 'Solo SUPER_ADMIN' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
