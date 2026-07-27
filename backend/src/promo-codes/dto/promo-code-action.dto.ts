import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { PROMO_PLAN_SLUGS } from '../promo-codes.constants';

export class ValidatePromoCodeDto {
  @IsString()
  @MinLength(3)
  code!: string;

  @IsOptional()
  @IsIn([...PROMO_PLAN_SLUGS])
  contextPlanSlug?: string;
}

/** Canje: desde checkout envía facturación; cupones Pro Team pueden omitirla. */
export class RedeemPromoCodeDto extends ValidatePromoCodeDto {
  @IsOptional()
  @IsBoolean()
  acceptedTerms?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  street?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  country?: string;

  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  billingCycle?: 'monthly' | 'yearly';
}
