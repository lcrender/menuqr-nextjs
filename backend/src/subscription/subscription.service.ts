import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'expired';
export type PlanType = 'monthly' | 'yearly';
export type PaymentProvider = 'paypal' | 'mercadopago' | 'internal';

export interface SubscriptionRow {
  id: string;
  userId: string;
  paymentProvider: PaymentProvider;
  externalSubscriptionId: string;
  billingCountry: string | null;
  currency: string | null;
  status: SubscriptionStatus;
  planType: PlanType;
  subscriptionPlan: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly postgres: PostgresService) {}

  async findByExternalId(provider: PaymentProvider, externalSubscriptionId: string): Promise<SubscriptionRow | null> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, user_id as "userId", payment_provider as "paymentProvider", external_subscription_id as "externalSubscriptionId",
       billing_country as "billingCountry", currency, status, plan_type as "planType", subscription_plan as "subscriptionPlan",
       current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd", cancel_at_period_end as "cancelAtPeriodEnd",
       created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions WHERE payment_provider = $1 AND external_subscription_id = $2 LIMIT 1`,
      [provider, externalSubscriptionId]
    );
    if (!rows[0]) return null;
    return this.mapRow(rows[0]);
  }

  async findByUserId(userId: string): Promise<SubscriptionRow[]> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, user_id as "userId", payment_provider as "paymentProvider", external_subscription_id as "externalSubscriptionId",
       billing_country as "billingCountry", currency, status, plan_type as "planType", subscription_plan as "subscriptionPlan",
       current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd", cancel_at_period_end as "cancelAtPeriodEnd",
       created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map((r: any) => this.mapRow(r));
  }

  async create(data: {
    userId: string;
    paymentProvider: PaymentProvider;
    externalSubscriptionId: string;
    billingCountry?: string | null;
    currency?: string | null;
    status: SubscriptionStatus;
    planType: PlanType;
    subscriptionPlan?: string | null;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }): Promise<SubscriptionRow> {
    const id = `sub_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO subscriptions (id, user_id, payment_provider, external_subscription_id, billing_country, currency, status, plan_type, subscription_plan, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at)
       VALUES ($1, $2, $3::"PaymentProvider", $4, $5, $6, $7::"SubscriptionStatus", $8::"PlanType", $9, $10, $11, $12, NOW(), NOW())`,
      [
        id,
        data.userId,
        data.paymentProvider,
        data.externalSubscriptionId,
        data.billingCountry ?? null,
        data.currency ?? null,
        data.status,
        data.planType,
        data.subscriptionPlan ?? null,
        data.currentPeriodStart ?? null,
        data.currentPeriodEnd ?? null,
        data.cancelAtPeriodEnd ?? false,
      ]
    );
    const sub = await this.findByExternalId(data.paymentProvider, data.externalSubscriptionId);
    if (!sub) throw new NotFoundException('Subscription not found after create');
    return sub;
  }

  async updateStatus(
    provider: PaymentProvider,
    externalSubscriptionId: string,
    updates: {
      status?: SubscriptionStatus;
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
      cancelAtPeriodEnd?: boolean;
      billingCountry?: string | null;
    }
  ): Promise<void> {
    const sets: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let i = 1;
    if (updates.status !== undefined) {
      sets.push(`status = $${i}::"SubscriptionStatus"`);
      params.push(updates.status);
      i++;
    }
    if (updates.currentPeriodStart !== undefined) {
      sets.push(`current_period_start = $${i}`);
      params.push(updates.currentPeriodStart);
      i++;
    }
    if (updates.currentPeriodEnd !== undefined) {
      sets.push(`current_period_end = $${i}`);
      params.push(updates.currentPeriodEnd);
      i++;
    }
    if (updates.cancelAtPeriodEnd !== undefined) {
      sets.push(`cancel_at_period_end = $${i}`);
      params.push(updates.cancelAtPeriodEnd);
      i++;
    }
    if (updates.billingCountry !== undefined) {
      sets.push(`billing_country = $${i}`);
      params.push(updates.billingCountry);
      i++;
    }
    if (params.length === 0) return;
    params.push(provider, externalSubscriptionId);
    const whereA = i;
    const whereB = i + 1;
    await this.postgres.executeRaw(
      `UPDATE subscriptions SET ${sets.join(', ')} WHERE payment_provider = $${whereA} AND external_subscription_id = $${whereB}`,
      params
    );
  }

  /**
   * Sincroniza el plan del tenant con la suscripción activa del usuario.
   * Si la suscripción está active y tiene subscription_plan, actualiza tenant.plan.
   * Si está canceled/expired/past_due, baja a 'free'.
   */
  async syncTenantPlanFromSubscription(userId: string): Promise<void> {
    const user = await this.postgres.queryRaw<any>(
      'SELECT tenant_id FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [userId]
    );
    const tenantId = user[0]?.tenant_id;
    if (!tenantId) return;

    const subs = await this.findByUserId(userId);
    const active = subs.find((s) => s.status === 'active');
    const newPlan = active?.subscriptionPlan ?? 'free';

    await this.postgres.executeRaw(
      'UPDATE tenants SET plan = $1, updated_at = NOW() WHERE id = $2',
      [newPlan, tenantId]
    );
    this.logger.log(`Synced tenant ${tenantId} plan to ${newPlan} for user ${userId}`);
  }

  async recordWebhookProcessed(provider: string, eventId: string): Promise<boolean> {
    try {
      const id = `wh_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      await this.postgres.executeRaw(
        'INSERT INTO webhook_events (id, provider, event_id, processed_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (provider, event_id) DO NOTHING',
        [id, provider, eventId]
      );
      const check = await this.postgres.queryRaw<any>(
        'SELECT 1 FROM webhook_events WHERE provider = $1 AND event_id = $2 LIMIT 1',
        [provider, eventId]
      );
      return !!check[0];
    } catch {
      return false;
    }
  }

  async wasWebhookProcessed(provider: string, eventId: string): Promise<boolean> {
    const rows = await this.postgres.queryRaw<any>(
      'SELECT 1 FROM webhook_events WHERE provider = $1 AND event_id = $2 LIMIT 1',
      [provider, eventId]
    );
    return !!rows[0];
  }

  private mapRow(row: any): SubscriptionRow {
    return {
      id: row.id,
      userId: row.userId,
      paymentProvider: row.paymentProvider,
      externalSubscriptionId: row.externalSubscriptionId,
      billingCountry: row.billingCountry ?? null,
      currency: row.currency ?? null,
      status: row.status,
      planType: row.planType,
      subscriptionPlan: row.subscriptionPlan ?? null,
      currentPeriodStart: row.currentPeriodStart ?? null,
      currentPeriodEnd: row.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd ?? false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
