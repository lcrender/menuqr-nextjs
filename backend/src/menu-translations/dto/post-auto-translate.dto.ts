import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { MENU_LOCALE_BCP47_REGEX, MENU_LOCALE_MAX_LENGTH } from '../menu-locale.constants';

export class PostAutoTranslateDto {
  @ApiProperty({ example: 'en-US' })
  @IsString()
  @MaxLength(MENU_LOCALE_MAX_LENGTH)
  @Matches(MENU_LOCALE_BCP47_REGEX)
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
