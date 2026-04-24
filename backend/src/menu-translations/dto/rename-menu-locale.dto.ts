import { IsString, Matches, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RenameMenuLocaleDto {
  @ApiProperty({ example: 'it-IT' })
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-z]{2}-[A-Z]{2}$/)
  fromLocale!: string;

  @ApiProperty({ example: 'en-US' })
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-z]{2}-[A-Z]{2}$/)
  toLocale!: string;

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

  @ApiProperty({ required: false, description: 'Visibilidad en menú público para el locale destino' })
  @IsOptional()
  @IsBoolean()
  enabledPublic?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
