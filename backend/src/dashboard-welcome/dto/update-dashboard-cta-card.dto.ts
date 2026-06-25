import { Type } from 'class-transformer';
import { IsArray, IsIn, IsString, MinLength, ValidateNested } from 'class-validator';
import { TENANT_PLAN_KEYS } from '../../common/plan-limits/plan-limits.constants';

export class DashboardCtaCardContentDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsString()
  @MinLength(1)
  buttonLink!: string;

  @IsString()
  @MinLength(1)
  buttonText!: string;
}

export class DashboardCtaCardPlanDto extends DashboardCtaCardContentDto {
  @IsIn([...TENANT_PLAN_KEYS])
  planKey!: string;
}

export class UpdateDashboardCtaCardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardCtaCardPlanDto)
  plans!: DashboardCtaCardPlanDto[];
}
