import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { PROMO_PLAN_SLUGS } from '../promo-codes.constants';

export class ValidatePromoCodeDto {
  @IsString()
  @MinLength(3)
  code!: string;

  @IsOptional()
  @IsIn([...PROMO_PLAN_SLUGS])
  contextPlanSlug?: string;
}

export class RedeemPromoCodeDto extends ValidatePromoCodeDto {}
