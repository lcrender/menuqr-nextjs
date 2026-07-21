import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { PricingService } from './pricing.service';
import { UsersService } from '../users/users.service';
import { SubscriptionService } from '../subscription/subscription.service';

/**
 * GET /pricing: precios según región.
 * - ?country=AR|GLOBAL fuerza precios de landing (/ar, /es) aunque haya sesión.
 * - Sin query y autenticado: billing_country / declared_country / registration_country.
 * - Sin query y anónimo: GLOBAL (USD / PayPal).
 */
@ApiTags('pricing')
@Controller('pricing')
/** Sin esto, el JwtAuthGuard global devuelve 401 con token expirado y el front (landing) redirige a /login. */
@Public()
@UseGuards(OptionalJwtAuthGuard)
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly usersService: UsersService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener precios por región (opcional: usuario autenticado o ?country=)' })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Forzar país de precios para anónimos: AR o GLOBAL',
  })
  async getPricing(@Request() req: any, @Query('country') countryQuery?: string) {
    const forced = String(countryQuery || '')
      .trim()
      .toUpperCase();
    if (forced === 'AR' || forced === 'GLOBAL') {
      return this.pricingService.getPricesForCountry(forced === 'GLOBAL' ? null : forced);
    }

    let country: string | null = null;
    if (req.user?.id) {
      const user = await this.usersService.findById(req.user.id);
      if (user) {
        const subs = await this.subscriptionService.findByUserId(user.id);
        const activeSub = subs.find((s) => s.status === 'active');
        country =
          (activeSub?.billingCountry ?? null) ||
          user.declaredCountry ||
          user.registrationCountry ||
          null;
      }
    }
    return this.pricingService.getPricesForCountry(country);
  }
}
