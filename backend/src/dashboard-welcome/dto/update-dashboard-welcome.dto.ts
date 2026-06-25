import { Type } from 'class-transformer';
import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { TENANT_PLAN_KEYS } from '../../common/plan-limits/plan-limits.constants';

export class DashboardWelcomePlanMessageDto {
  @IsIn([...TENANT_PLAN_KEYS])
  planKey!: string;

  @IsString()
  html!: string;
}

export class UpdateDashboardWelcomeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardWelcomePlanMessageDto)
  plans!: DashboardWelcomePlanMessageDto[];
}
