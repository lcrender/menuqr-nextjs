import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database/database.module';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentService } from './payment.service';
import { PricingService } from './pricing.service';
import { PayPalService } from './providers/paypal.service';
import { MercadoPagoService } from './providers/mercadopago.service';
import { WebhooksController } from './webhooks.controller';
import { SubscriptionController } from './subscription.controller';
import { PricingController } from './pricing.controller';
import { AdminPlanCatalogController } from './admin-plan-catalog.controller';
import { AdminPlanCatalogService } from './admin-plan-catalog.service';
import { AppSettingsModule } from '../app-settings/app-settings.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    SubscriptionModule,
    AppSettingsModule,
    PlanLimitsModule,
  ],
  controllers: [
    WebhooksController,
    SubscriptionController,
    PricingController,
    AdminPlanCatalogController,
  ],
  providers: [
    PaymentProviderService,
    PaymentService,
    PricingService,
    PayPalService,
    MercadoPagoService,
    AdminPlanCatalogService,
  ],
  exports: [PaymentService, PaymentProviderService, PricingService],
})
export class PaymentModule {}
