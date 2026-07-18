import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class MenuPhotoImportPriceDto {
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsOptional()
  @IsString()
  label?: string | null;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class MenuPhotoImportItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuPhotoImportPriceDto)
  prices!: MenuPhotoImportPriceDto[];

  @IsOptional()
  @IsString()
  confidence?: string | null;
}

export class MenuPhotoImportSectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuPhotoImportItemDto)
  items!: MenuPhotoImportItemDto[];
}

export class MenuPhotoImportPreviewDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuPhotoImportSectionDto)
  sections!: MenuPhotoImportSectionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warnings?: string[];
}

export class ImportMenuFromPhotoDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsString()
  @IsNotEmpty()
  menuName!: string;

  @IsOptional()
  @IsString()
  menuDescription?: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ValidateNested()
  @Type(() => MenuPhotoImportPreviewDto)
  preview!: MenuPhotoImportPreviewDto;
}
