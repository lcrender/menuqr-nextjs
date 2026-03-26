import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionCheckoutDto } from './dto/subscription-checkout.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class SubscriptionController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Listar mis suscripciones' })
  async listMine(@Request() req: any) {
    const subs = await this.subscriptionService.findByUserId(req.user.id);
    return subs.map((s) => ({
      id: s.id,
      paymentProvider: s.paymentProvider,
      externalSubscriptionId: s.externalSubscriptionId,
      status: s.status,
      planType: s.planType,
      subscriptionPlan: s.subscriptionPlan,
      currency: s.currency,
      currentPeriodStart: s.currentPeriodStart,
      currentPeriodEnd: s.currentPeriodEnd,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    }));
  }

  @Get('me/payments')
  @ApiOperation({ summary: 'Historial de pagos (escenario futuro: tabla payments desde webhooks)' })
  async listMyPayments(@Request() req: any) {
    // Por ahora vacío; cuando exista tabla payments, filtrar por userId/subscriptionId
    return [];
  }

  @Post('create')
  @ApiOperation({
    summary:
      'Crear suscripción directo (sin paso checkout). Preferí POST /subscriptions/checkout desde la UI.',
  })
  async create(
    @Request() req: any,
    @Body() body: { planType: 'monthly' | 'yearly'; planSlug: string; returnUrl: string; cancelUrl: string },
  ) {
    const result = await this.paymentService.createSubscription({
      userId: req.user.id,
      planType: body.planType,
      planSlug: body.planSlug,
      returnUrl: body.returnUrl,
      cancelUrl: body.cancelUrl,
    });
    return result;
  }

  @Post('checkout')
  @ApiOperation({
    summary:
      'Confirmar checkout (términos aceptados), registrar sesión y crear suscripción en el proveedor (URL de pago).',
  })
  async checkout(@Request() req: any, @Body() body: SubscriptionCheckoutDto) {
    return this.paymentService.checkoutSubscription({
      userId: req.user.id,
      planSlug: body.planSlug,
      planType: body.planType,
      returnUrl: body.returnUrl,
      cancelUrl: body.cancelUrl,
      acceptedTerms: body.acceptedTerms,
    });
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Solicitar cancelación en el proveedor' })
  async cancel(
    @Request() req: any,
    @Body() body: { externalSubscriptionId?: string; cancelAtPeriodEnd?: boolean },
  ) {
    const result = await this.paymentService.cancelSubscription({
      userId: req.user.id,
      externalSubscriptionId: body.externalSubscriptionId,
      cancelAtPeriodEnd: body.cancelAtPeriodEnd,
    });
    return result;
  }
}
