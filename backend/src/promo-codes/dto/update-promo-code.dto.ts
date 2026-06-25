import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PROMO_PLAN_SLUGS } from '../promo-codes.constants';

@ValidatorConstraint({ name: 'grantInApplicableUpdate', async: false })
class GrantInApplicableUpdateConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as UpdatePromoCodeDto;
    if (!obj.grantPlanSlug || !obj.applicablePlanSlugs) return true;
    return obj.applicablePlanSlugs.includes(obj.grantPlanSlug);
  }

  defaultMessage() {
    return 'El plan otorgado debe estar incluido en los planes aplicables';
  }
}

export class UpdatePromoCodeDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn([...PROMO_PLAN_SLUGS])
  grantPlanSlug?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn([...PROMO_PLAN_SLUGS], { each: true })
  applicablePlanSlugs?: string[];

  @Validate(GrantInApplicableUpdateConstraint)
  private readonly _grantCheck?: boolean;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  grantDurationMonths?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptionsPerUser?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
