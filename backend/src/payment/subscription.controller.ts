import { Controller, Get, Post, Body, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionCheckoutDto } from './dto/subscription-checkout.dto';
import { PaymentHistoryService } from './payment-history.service';
import type { PaymentAttemptStatus } from './payment-history.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class SubscriptionController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentHistoryService: PaymentHistoryService,
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
  @ApiOperation({ summary: 'Historial de pagos (aprobados y fallidos)' })
  async listMyPayments(
    @Request() req: any,
    @Query()
    query: {
      status?: string;
      paymentProvider?: 'paypal' | 'mercadopago' | 'internal' | string;
      planSlug?: string;
      planType?: 'monthly' | 'yearly' | string;
      from?: string;
      to?: string;
      limit?: string;
      offset?: string;
    },
  ) {
    const allowedStatuses = new Set<PaymentAttemptStatus>(['completed', 'failed', 'pending']);
    const status = typeof query.status === 'string' && allowedStatuses.has(query.status as PaymentAttemptStatus)
      ? (query.status as PaymentAttemptStatus)
      : undefined;

    const allowedProviders = new Set<('paypal' | 'mercadopago' | 'internal')>(['paypal', 'mercadopago', 'internal']);
    const paymentProvider =
      typeof query.paymentProvider === 'string' && allowedProviders.has(query.paymentProvider as any)
        ? (query.paymentProvider as any)
        : undefined;

    const planType =
      query.planType === 'monthly' || query.planType === 'yearly' ? (query.planType as any) : undefined;

    const fromRaw = query.from ? new Date(query.from) : undefined;
    const toRaw = query.to ? new Date(query.to) : undefined;
    const from = fromRaw && !isNaN(fromRaw.getTime()) ? fromRaw : undefined;
    const to = toRaw && !isNaN(toRaw.getTime()) ? toRaw : undefined;
    const limit = query.limit ? parseInt(query.limit, 10) : undefined;
    const offset = query.offset ? parseInt(query.offset, 10) : undefined;

    return this.paymentHistoryService.listPaymentsByUserId(req.user.id, {
      status,
      paymentProvider,
      planSlug: query.planSlug,
      planType,
      from,
      to,
      limit,
      offset,
    });
  }

  @Get('admin/payments')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Historial de pagos de todos los usuarios (Super Admin) con filtros' })
  async listAdminPayments(
    @Request() req: any,
    @Query()
    query: {
      userId?: string;
      status?: string;
      paymentProvider?: 'paypal' | 'mercadopago' | 'internal' | string;
      planSlug?: string;
      planType?: 'monthly' | 'yearly' | string;
      from?: string;
      to?: string;
      limit?: string;
      offset?: string;
    },
  ) {
    const allowedStatuses = new Set<PaymentAttemptStatus>(['completed', 'failed', 'pending']);
    const status = typeof query.status === 'string' && allowedStatuses.has(query.status as PaymentAttemptStatus)
      ? (query.status as PaymentAttemptStatus)
      : undefined;

    const allowedProviders = new Set<('paypal' | 'mercadopago' | 'internal')>(['paypal', 'mercadopago', 'internal']);
    const paymentProvider =
      typeof query.paymentProvider === 'string' && allowedProviders.has(query.paymentProvider as any)
        ? (query.paymentProvider as any)
        : undefined;

    const planType =
      query.planType === 'monthly' || query.planType === 'yearly' ? (query.planType as any) : undefined;

    const fromRaw = query.from ? new Date(query.from) : undefined;
    const toRaw = query.to ? new Date(query.to) : undefined;
    const from = fromRaw && !isNaN(fromRaw.getTime()) ? fromRaw : undefined;
    const to = toRaw && !isNaN(toRaw.getTime()) ? toRaw : undefined;
    const limit = query.limit ? parseInt(query.limit, 10) : undefined;
    const offset = query.offset ? parseInt(query.offset, 10) : undefined;

    return this.paymentHistoryService.listPaymentsForAdmin({
      userId: query.userId,
      status,
      paymentProvider,
      planSlug: query.planSlug,
      planType,
      from,
      to,
      limit,
      offset,
    });
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
      firstName: body.firstName,
      lastName: body.lastName,
      documentType: body.documentType,
      documentNumber: body.documentNumber,
      street: body.street,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
    });
  }

  @Get('checkout-profile')
  @ApiOperation({ summary: 'Obtener último perfil de facturación usado en checkout' })
  async getCheckoutProfile(@Request() req: any) {
    return this.subscriptionService.getLatestCheckoutBillingProfile(req.user.id);
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
