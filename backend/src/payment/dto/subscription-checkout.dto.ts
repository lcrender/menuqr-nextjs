import { Equals, IsIn, IsString } from 'class-validator';

export class SubscriptionCheckoutDto {
  @IsIn(['starter', 'pro', 'premium'])
  planSlug: string;

  @IsIn(['monthly', 'yearly'])
  planType: 'monthly' | 'yearly';

  @IsString()
  returnUrl: string;

  @IsString()
  cancelUrl: string;

  @Equals(true, { message: 'Debés aceptar los términos y condiciones y la política de privacidad.' })
  acceptedTerms: boolean;
}
