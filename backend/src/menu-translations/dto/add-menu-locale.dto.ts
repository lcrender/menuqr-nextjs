import { IsString, IsOptional, Matches, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MENU_LOCALE_BCP47_REGEX, MENU_LOCALE_MAX_LENGTH } from '../menu-locale.constants';

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

  @ApiProperty({ required: false, description: 'ISO 3166-1 alpha-2 para bandera (ej. US, ES)' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  @Matches(/^[A-Z]{2}$/, { message: 'flagCode debe ser 2 letras mayúsculas' })
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
