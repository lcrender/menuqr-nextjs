import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MENU_FLAG_CODE_MAX_LENGTH,
  MENU_FLAG_CODE_REGEX,
  MENU_LOCALE_BCP47_REGEX,
  MENU_LOCALE_MAX_LENGTH,
} from '../menu-locale.constants';

export class RenameMenuLocaleDto {
  @ApiProperty({ example: 'it-IT' })
  @IsString()
  @MaxLength(MENU_LOCALE_MAX_LENGTH)
  @Matches(MENU_LOCALE_BCP47_REGEX)
  fromLocale!: string;

  @ApiProperty({ example: 'en-US' })
  @IsString()
  @MaxLength(MENU_LOCALE_MAX_LENGTH)
  @Matches(MENU_LOCALE_BCP47_REGEX)
  toLocale!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const t = value.trim().toUpperCase();
    return t.length === 0 ? undefined : t;
  })
  @IsString()
  @MaxLength(MENU_FLAG_CODE_MAX_LENGTH)
  @Matches(MENU_FLAG_CODE_REGEX)
  flagCode?: string;

  @ApiProperty({ required: false, description: 'Visibilidad en menú público para el locale destino' })
  @IsOptional()
  @IsBoolean()
  enabledPublic?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
