import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { TENANT_PLAN_KEYS, TenantPlanKey } from '../plan-limits.constants';

const PLAN_KEY_LIST = [...TENANT_PLAN_KEYS];

export class PlanLimitItemDto {
  @ApiProperty({ enum: TENANT_PLAN_KEYS })
  @IsIn(PLAN_KEY_LIST)
  planKey!: TenantPlanKey;

  @ApiProperty({ description: '-1 = ilimitado (donde la app lo soporta)' })
  @IsInt()
  @Min(-1)
  restaurantLimit!: number;

  @ApiProperty()
  @IsInt()
  @Min(-1)
  menuLimit!: number;

  @ApiProperty()
  @IsInt()
  @Min(-1)
  productLimit!: number;

  @ApiProperty({
    description:
      'Máximo de traducciones automáticas (beta) por usuario al mes (todos los menús). 0 = desactivado; -1 = ilimitado.',
  })
  @IsInt()
  @Min(-1)
  autoTranslateMonthlyPerUser!: number;

  @ApiProperty()
  @IsBoolean()
  gourmetTemplate!: boolean;

  @ApiProperty()
  @IsBoolean()
  productPhotosAllowed!: boolean;

  @ApiProperty({ description: 'Habilita la opción "Destacar producto" al crear/editar productos.' })
  @IsBoolean()
  productHighlightAllowed!: boolean;

  @ApiProperty({ type: [String], example: ['gourmet'] })
  @IsArray()
  @IsString({ each: true })
  proOnlyTemplatesInAdmin!: string[];
}

export class PutPlanLimitsDto {
  @ApiProperty({ type: [PlanLimitItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PlanLimitItemDto)
  plans!: PlanLimitItemDto[];
}
