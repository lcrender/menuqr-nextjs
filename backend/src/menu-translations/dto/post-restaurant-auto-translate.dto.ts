import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { MENU_LOCALE_BCP47_REGEX, MENU_LOCALE_MAX_LENGTH } from '../menu-locale.constants';

export class PostRestaurantAutoTranslateDto {
  @ApiProperty({ example: 'en-US', description: 'Idioma destino a traducir en todos los menús que lo tengan' })
  @IsString()
  @MaxLength(MENU_LOCALE_MAX_LENGTH)
  @Matches(MENU_LOCALE_BCP47_REGEX)
  targetLocale!: string;

  @ApiProperty({
    required: false,
    description:
      'Si true, vuelve a traducir idiomas ya auto-traducidos (sigue contando un solo uso del lote).',
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @ApiProperty({ required: false, description: 'Solo SUPER_ADMIN' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
