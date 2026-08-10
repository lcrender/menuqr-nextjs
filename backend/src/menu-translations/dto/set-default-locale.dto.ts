import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { MENU_LOCALE_BCP47_REGEX } from '../menu-locale.constants';

export class SetDefaultLocaleDto {
  @ApiProperty({ example: 'en-US', description: 'Locale BCP-47 que pasará a ser el idioma base del menú' })
  @IsString()
  @Matches(MENU_LOCALE_BCP47_REGEX, { message: 'locale inválido' })
  locale!: string;

  @ApiPropertyOptional({ description: 'Solo SUPER_ADMIN' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
