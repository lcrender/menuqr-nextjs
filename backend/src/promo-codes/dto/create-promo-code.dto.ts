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
  ValidateIf,
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

@ValidatorConstraint({ name: 'promoBenefitConstraint', async: false })
class PromoBenefitConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as CreatePromoCodeDto;
    const trial = typeof obj.freeTrialDays === 'number' && obj.freeTrialDays >= 1;
    if (trial) return true;
    if (obj.unlimitedDuration === true) return true;
    return typeof obj.grantDurationMonths === 'number' && obj.grantDurationMonths >= 1;
  }

  defaultMessage() {
    return 'Indicá días de prueba gratis (Mercado Pago), meses de beneficio, o duración ilimitada';
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

  /**
   * Prueba gratis vía Mercado Pago (free_trial). Si está definido, el cupón no se canjea
   * como plan interno gratis: se aplica en el checkout de pago.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  freeTrialDays?: number;

  @IsOptional()
  @IsBoolean()
  unlimitedDuration?: boolean;

  @ValidateIf(
    (o: CreatePromoCodeDto) =>
      !o.unlimitedDuration && !(typeof o.freeTrialDays === 'number' && o.freeTrialDays >= 1),
  )
  @IsInt()
  @Min(1)
  @Max(120)
  grantDurationMonths?: number;

  @Validate(PromoBenefitConstraint)
  private readonly _benefitCheck?: boolean;

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
