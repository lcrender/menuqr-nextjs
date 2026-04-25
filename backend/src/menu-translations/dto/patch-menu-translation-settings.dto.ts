import { IsString, IsOptional, MaxLength, Matches, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MENU_LOCALE_BCP47_REGEX, MENU_LOCALE_MAX_LENGTH } from '../menu-locale.constants';

class ManifestEntryDto {
  @ApiProperty({ example: 'en-US' })
  @IsString()
  @MaxLength(MENU_LOCALE_MAX_LENGTH)
  @Matches(MENU_LOCALE_BCP47_REGEX)
  locale!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  @Matches(/^[A-Z]{2}$/)
  flagCode?: string;

  @ApiProperty({ required: false, description: 'Si es false, el idioma no aparece en el menú público' })
  @IsOptional()
  @IsBoolean()
  enabledPublic?: boolean;
}

export class PatchMenuTranslationSettingsDto {
  @ApiProperty({ required: false, description: 'Nombre canónico del menú (también actualiza traducción es-ES)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  name?: string;

  @ApiProperty({
    type: [ManifestEntryDto],
    description:
      'Metadatos por idioma (etiqueta, bandera en panel y menú público). Incluye es-ES para la etiqueta del idioma base (ej. «Español»). Reemplaza el manifest completo.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManifestEntryDto)
  translationManifest?: ManifestEntryDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
