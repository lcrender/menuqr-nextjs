import { IsString, IsOptional, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SectionRowDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  name!: string;
}

class ItemRowDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;
}

class MenuRowDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;
}

export class SaveMenuLocaleWorkbenchDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => MenuRowDto)
  menu!: MenuRowDto;

  @ApiProperty({ type: [SectionRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRowDto)
  sections!: SectionRowDto[];

  @ApiProperty({ type: [ItemRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRowDto)
  items!: ItemRowDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
