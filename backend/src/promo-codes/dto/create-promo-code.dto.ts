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
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PROMO_PLAN_SLUGS } from '../promo-codes.constants';

@ValidatorConstraint({ name: 'grantInApplicable', async: false })
class GrantInApplicableConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as CreatePromoCodeDto;
    if (!obj.grantPlanSlug || !Array.isArray(obj.applicablePlanSlugs)) return false;
    return obj.applicablePlanSlugs.includes(obj.grantPlanSlug);
  }

  defaultMessage() {
    return 'El plan otorgado debe estar incluido en los planes aplicables';
  }
}

export class CreatePromoCodeDto {
  @IsString()
  @MinLength(3)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn([...PROMO_PLAN_SLUGS])
  grantPlanSlug!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn([...PROMO_PLAN_SLUGS], { each: true })
  applicablePlanSlugs!: string[];

  @Validate(GrantInApplicableConstraint)
  private readonly _grantCheck?: boolean;

  @IsDateString()
  validFrom!: string;

  @IsDateString()
  validUntil!: string;

  @IsInt()
  @Min(1)
  @Max(120)
  grantDurationMonths!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptionsPerUser?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
