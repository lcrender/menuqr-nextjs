import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';

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

export interface AdminSubscriptionListFilters {
  userId?: string;
  paymentProvider?: PaymentProvider;
  status?: SubscriptionStatus;
  planSlug?: string;
  planType?: PlanType;
  limit?: number;
  offset?: number;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly planLimits: PlanLimitsService,
  ) {}

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

  /** Fallback cuando el pago de MP no trae preapproval_id. */
  async findActiveByUserAndProvider(
    userId: string,
    provider: PaymentProvider,
  ): Promise<SubscriptionRow | null> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, user_id as "userId", payment_provider as "paymentProvider", external_subscription_id as "externalSubscriptionId",
       billing_country as "billingCountry", currency, status, plan_type as "planType", subscription_plan as "subscriptionPlan",
       current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd", cancel_at_period_end as "cancelAtPeriodEnd",
       created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE user_id = $1
         AND payment_provider = $2::"PaymentProvider"
         AND status = 'active'::"SubscriptionStatus"
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1`,
      [userId, provider],
    );
    if (!rows[0]) return null;
    return this.mapRow(rows[0]);
  }

  /**
   * Suscripción de pago abierta: activa, en mora o checkout incompleto.
   * El primer cobro de Mercado Pago a veces llega con la fila todavía en incomplete.
   */
  async findOpenBillableByUserAndProvider(
    userId: string,
    provider: PaymentProvider,
  ): Promise<SubscriptionRow | null> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, user_id as "userId", payment_provider as "paymentProvider", external_subscription_id as "externalSubscriptionId",
       billing_country as "billingCountry", currency, status, plan_type as "planType", subscription_plan as "subscriptionPlan",
       current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd", cancel_at_period_end as "cancelAtPeriodEnd",
       created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE user_id = $1
         AND payment_provider = $2::"PaymentProvider"
         AND status IN ('active'::"SubscriptionStatus", 'past_due'::"SubscriptionStatus", 'incomplete'::"SubscriptionStatus")
         AND COALESCE(subscription_plan, '') <> 'free'
       ORDER BY CASE status
         WHEN 'active' THEN 0
         WHEN 'past_due' THEN 1
         ELSE 2
       END, created_at DESC
       LIMIT 1`,
      [userId, provider],
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

  async listForAdmin(filters: AdminSubscriptionListFilters = {}) {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    const add = (cond: string, value: any) => {
      where.push(cond.replace('$X', `$${i}`));
      params.push(value);
      i++;
    };

    if (filters.userId) add('s.user_id = $X::text', filters.userId);
    if (filters.paymentProvider) add('s.payment_provider = $X::"PaymentProvider"', filters.paymentProvider);
    if (filters.status) add('s.status = $X::"SubscriptionStatus"', filters.status);
    if (filters.planSlug) add('s.subscription_plan = $X', filters.planSlug);
    if (filters.planType) add('s.plan_type = $X::"PlanType"', filters.planType);

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    const rows = await this.postgres.queryRaw<any>(
      `SELECT
         s.id,
         s.user_id as "userId",
         u.email as "userEmail",
         s.payment_provider as "paymentProvider",
         s.external_subscription_id as "externalSubscriptionId",
         s.billing_country as "billingCountry",
         s.currency,
         s.status,
         s.plan_type as "planType",
         s.subscription_plan as "subscriptionPlan",
         s.current_period_start as "currentPeriodStart",
         s.current_period_end as "currentPeriodEnd",
         s.cancel_at_period_end as "cancelAtPeriodEnd",
         s.created_at as "createdAt",
         s.updated_at as "updatedAt"
       FROM subscriptions s
       LEFT JOIN users u ON u.id = s.user_id
       ${whereSql}
       ORDER BY s.updated_at DESC, s.created_at DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return rows.map((r: any) => ({
      ...this.mapRow(r),
      userEmail: r.userEmail ?? null,
    }));
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

  async cancelActiveInternalSubscriptions(
    userId: string,
    exceptExternalId?: string,
  ): Promise<void> {
    await this.postgres.executeRaw(
      `UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
       WHERE user_id = $1 AND payment_provider = 'internal'::"PaymentProvider" AND status = 'active'::"SubscriptionStatus"
       AND ($2::text IS NULL OR external_subscription_id != $2)`,
      [userId, exceptExternalId ?? null],
    );
  }

  /** Estima fin de ciclo si falta current_period_end (mensual/anual desde el inicio). */
  estimatePeriodEnd(
    currentPeriodStart: Date | null | undefined,
    planType: PlanType | string | null | undefined,
  ): Date | null {
    if (!currentPeriodStart) return null;
    const start = new Date(currentPeriodStart);
    if (Number.isNaN(start.getTime())) return null;
    const end = new Date(start);
    if (planType === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  }

  async expireDuePromoSubscriptions(): Promise<number> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, user_id as "userId", external_subscription_id as "externalSubscriptionId"
       FROM subscriptions
       WHERE status = 'active'::"SubscriptionStatus"
         AND payment_provider = 'internal'::"PaymentProvider"
         AND external_subscription_id LIKE 'promo-%'
         AND current_period_end IS NOT NULL
         AND current_period_end < NOW()`,
    );

    for (const row of rows) {
      await this.postgres.executeRaw(
        `UPDATE subscriptions SET status = 'expired'::"SubscriptionStatus", updated_at = NOW() WHERE id = $1`,
        [row.id],
      );
      await this.syncTenantPlanFromSubscription(row.userId);
      this.logger.log(`Promo subscription expired: ${row.externalSubscriptionId} user=${row.userId}`);
    }
    return rows.length;
  }

  /**
   * Baja a Free las suscripciones con cancel_at_period_end cuyo ciclo pagado ya venció.
   * El cobro ya se canceló en el proveedor al programar la cancelación.
   */
  async expireDueCanceledAtPeriodEnd(): Promise<number> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, user_id as "userId", external_subscription_id as "externalSubscriptionId",
              payment_provider as "paymentProvider"
       FROM subscriptions
       WHERE status = 'active'::"SubscriptionStatus"
         AND cancel_at_period_end = true
         AND current_period_end IS NOT NULL
         AND current_period_end < NOW()`,
    );

    for (const row of rows) {
      await this.postgres.executeRaw(
        `UPDATE subscriptions
         SET status = 'canceled'::"SubscriptionStatus",
             cancel_at_period_end = false,
             updated_at = NOW()
         WHERE id = $1`,
        [row.id],
      );
      await this.syncTenantPlanFromSubscription(row.userId);
      this.logger.log(
        `Cancel-at-period-end applied: ${row.paymentProvider}/${row.externalSubscriptionId} user=${row.userId}`,
      );
    }
    return rows.length;
  }

  /**
   * Si el período pago ya venció y el cobro falló (o la suscripción está en mora),
   * la marca canceled. No borra comercios, menús ni productos.
   */
  async expireUnpaidSubscriptionsPastPeriod(): Promise<
    Array<{
      id: string;
      userId: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      previousPlan: string;
      paymentProvider: PaymentProvider;
      externalSubscriptionId: string;
      periodEnd: Date | null;
    }>
  > {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT s.id,
              s.user_id as "userId",
              s.subscription_plan as "previousPlan",
              s.payment_provider as "paymentProvider",
              s.external_subscription_id as "externalSubscriptionId",
              s.current_period_end as "periodEnd",
              u.email,
              u.first_name as "firstName",
              u.last_name as "lastName"
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL
       WHERE s.payment_provider IN ('mercadopago'::"PaymentProvider", 'paypal'::"PaymentProvider")
         AND COALESCE(s.subscription_plan, '') NOT IN ('', 'free')
         AND s.cancel_at_period_end = false
         AND s.current_period_end IS NOT NULL
         AND s.current_period_end < NOW()
         AND (
           s.status = 'past_due'::"SubscriptionStatus"
           OR (
             s.status = 'active'::"SubscriptionStatus"
             AND EXISTS (
               SELECT 1 FROM payment_attempts p
               WHERE p.subscription_id = s.id
                 AND p.status = 'failed'::"PaymentAttemptStatus"
                 AND p.occurred_at >= COALESCE(s.current_period_start, s.current_period_end)
             )
             AND NOT EXISTS (
               SELECT 1 FROM payment_attempts p
               WHERE p.subscription_id = s.id
                 AND p.status = 'completed'::"PaymentAttemptStatus"
                 AND p.occurred_at >= s.current_period_end
             )
           )
         )`,
    );

    const expired: Array<{
      id: string;
      userId: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      previousPlan: string;
      paymentProvider: PaymentProvider;
      externalSubscriptionId: string;
      periodEnd: Date | null;
    }> = [];

    for (const row of rows) {
      const updated = await this.postgres.queryRaw<{ id: string }>(
        `UPDATE subscriptions
         SET status = 'canceled'::"SubscriptionStatus",
             cancel_at_period_end = false,
             updated_at = NOW()
         WHERE id = $1
           AND status IN ('active'::"SubscriptionStatus", 'past_due'::"SubscriptionStatus")
         RETURNING id`,
        [row.id],
      );
      if (!updated[0]) continue;
      await this.syncTenantPlanFromSubscription(row.userId);
      expired.push({
        id: row.id,
        userId: row.userId,
        email: row.email,
        firstName: row.firstName ?? null,
        lastName: row.lastName ?? null,
        previousPlan: row.previousPlan,
        paymentProvider: row.paymentProvider,
        externalSubscriptionId: row.externalSubscriptionId,
        periodEnd: row.periodEnd ? new Date(row.periodEnd) : null,
      });
      this.logger.log(
        `Unpaid subscription canceled after period end: ${row.paymentProvider}/${row.externalSubscriptionId} user=${row.userId}`,
      );
    }
    return expired;
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
   * Sincroniza el plan del tenant con la suscripción de pago.
   * Una suscripción activa de pago define el plan. Si está en mora pero el período ya pago
   * no venció, se mantiene ese plan. Si no hay cobertura, baja a free.
   * No borra comercios, menús ni productos. No pisa pro_team (asignado a mano).
   */
  async syncTenantPlanFromSubscription(userId: string): Promise<void> {
    const user = await this.postgres.queryRaw<any>(
      'SELECT tenant_id FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [userId]
    );
    const tenantId = user[0]?.tenant_id;
    if (!tenantId) return;

    const [tenantRow] = await this.postgres.queryRaw<any>(
      'SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [tenantId]
    );
    // Algunos tenants pueden tener el plan escrito como "pro team" (con espacio) u otra variante.
    const rawPlan: string = String(tenantRow?.plan ?? '').trim();
    const normalizedPlan = rawPlan
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_');
    const normalizedProTeam = normalizedPlan === 'proteam' || normalizedPlan === 'pro_team' ? 'pro_team' : normalizedPlan;

    if (normalizedProTeam === 'pro_team') {
      this.logger.log(`Tenant ${tenantId} has plan pro_team (manual), skipping sync (raw: "${rawPlan}")`);
      return;
    }

    const subs = await this.findByUserId(userId);
    const now = Date.now();
    const isPaid = (s: SubscriptionRow) =>
      s.paymentProvider !== 'internal' &&
      String(s.subscriptionPlan || '').toLowerCase() !== 'free' &&
      String(s.subscriptionPlan || '').trim() !== '';
    const activePaid = subs.find((s) => s.status === 'active' && isPaid(s));
    const stillCovered = subs.find(
      (s) =>
        isPaid(s) &&
        s.status === 'past_due' &&
        s.currentPeriodEnd != null &&
        new Date(s.currentPeriodEnd).getTime() > now,
    );
    const newPlan = activePaid?.subscriptionPlan ?? stillCovered?.subscriptionPlan ?? 'free';

    await this.postgres.executeRaw(
      'UPDATE tenants SET plan = $1, updated_at = NOW() WHERE id = $2',
      [newPlan, tenantId]
    );
    this.logger.log(`Synced tenant ${tenantId} plan to ${newPlan} for user ${userId}`);

    // Si se activó un plan de pago, limpiar pendingPlan del flujo registro/verificación.
    if (activePaid && newPlan !== 'free') {
      await this.postgres.executeRaw(
        'UPDATE users SET pending_plan = NULL, pending_billing_cycle = NULL, updated_at = NOW() WHERE id = $1',
        [userId],
      );
    }

    if (newPlan === 'free' || newPlan === 'starter') {
      await this.planLimits.resetTemplatesIncompatibleWithPlan(tenantId, newPlan);
    }
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

  async listWebhookEventsForAdmin(filters: {
    provider?: PaymentProvider;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;
    const add = (cond: string, value: any) => {
      where.push(cond.replace('$X', `$${i}`));
      params.push(value);
      i++;
    };
    if (filters.provider) add('provider = $X::text', filters.provider);
    if (filters.from) add('processed_at >= $X::timestamptz', filters.from);
    if (filters.to) add('processed_at <= $X::timestamptz', filters.to);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    return this.postgres.queryRaw<any>(
      `SELECT provider, event_id as "eventId", processed_at as "processedAt"
       FROM webhook_events
       ${whereSql}
       ORDER BY processed_at DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );
  }

  /** Registro de checkout antes de redirigir a Mercado Pago / PayPal (precio y términos). */
  async createCheckoutSession(data: {
    userId: string;
    planSlug: string;
    billingCycle: PlanType;
    priceAmount: number;
    currency: string;
    paymentProvider: PaymentProvider;
    firstName: string;
    lastName: string;
    documentType?: string | null;
    documentNumber?: string | null;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<string> {
    const id = `cko_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO subscription_checkout_sessions (
         id, user_id, plan_slug, billing_cycle, price_amount, currency, payment_provider, status, terms_accepted_at,
         first_name, last_name, document_type, document_number, street, city, state, postal_code, country, created_at
       )
       VALUES (
         $1, $2, $3, $4::"PlanType", $5, $6, $7::"PaymentProvider", 'pending', NOW(),
         $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
       )`,
      [
        id,
        data.userId,
        data.planSlug,
        data.billingCycle,
        data.priceAmount,
        data.currency,
        data.paymentProvider,
        data.firstName,
        data.lastName,
        data.documentType ?? null,
        data.documentNumber ?? null,
        data.street,
        data.city,
        data.state,
        data.postalCode,
        data.country,
      ]
    );
    return id;
  }

  async getLatestCheckoutBillingProfile(userId: string): Promise<{
    firstName: string;
    lastName: string;
    documentType: string | null;
    documentNumber: string | null;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT first_name as "firstName", last_name as "lastName",
              document_type as "documentType", document_number as "documentNumber",
              street, city, state, postal_code as "postalCode", country
       FROM subscription_checkout_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );
    return rows[0] ?? null;
  }

  async updateCheckoutSession(
    sessionId: string,
    data: { subscriptionId?: string; status: 'redirected' | 'failed' | 'completed' },
  ): Promise<void> {
    if (data.subscriptionId) {
      await this.postgres.executeRaw(
        `UPDATE subscription_checkout_sessions SET status = $1, subscription_id = $2 WHERE id = $3`,
        [data.status, data.subscriptionId, sessionId]
      );
    } else {
      await this.postgres.executeRaw(
        `UPDATE subscription_checkout_sessions SET status = $1 WHERE id = $2`,
        [data.status, sessionId]
      );
    }
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
