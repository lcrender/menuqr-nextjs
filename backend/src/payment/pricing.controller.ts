import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { PricingService } from './pricing.service';
import { UsersService } from '../users/users.service';
import { SubscriptionService } from '../subscription/subscription.service';

/**
 * GET /pricing: precios según la región del usuario.
 * Si está autenticado (Bearer token), usa billing_country (suscripción activa), declared_country o registration_country.
 * Si no está autenticado, devuelve precios GLOBAL (USD / PayPal).
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
  @ApiOperation({ summary: 'Obtener precios por región (opcional: usuario autenticado)' })
  async getPricing(@Request() req: any) {
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
