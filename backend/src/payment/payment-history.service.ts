import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import type { PlanType, PaymentProvider } from '../subscription/subscription.service';

export type PaymentAttemptStatus = 'completed' | 'failed' | 'pending';

export interface PaymentAttemptListFilters {
  userId?: string;
  status?: PaymentAttemptStatus;
  paymentProvider?: PaymentProvider;
  planSlug?: string;
  planType?: PlanType;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class PaymentHistoryService {
  private readonly logger = new Logger(PaymentHistoryService.name);

  constructor(private readonly postgres: PostgresService) {}

  async recordPaymentAttempt(input: {
    userId: string;
    subscriptionId?: string | null;
    paymentProvider: PaymentProvider; // paypal | mercadopago | internal
    externalPaymentId: string;
    providerEventId?: string | null;
    providerStatus?: string | null;
    status: PaymentAttemptStatus;
    planSlug?: string | null;
    planType?: PlanType | null;
    amount?: number | string | null;
    currency?: string | null;
    occurredAt?: Date | null;
    failureReason?: string | null;
    rawData?: unknown;
  }): Promise<void> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const occurredAt = input.occurredAt ?? new Date();

    try {
      await this.postgres.executeRaw(
        `INSERT INTO payment_attempts (
          id,
          user_id,
          subscription_id,
          payment_provider,
          external_payment_id,
          provider_event_id,
          provider_status,
          status,
          plan_slug,
          plan_type,
          amount,
          currency,
          occurred_at,
          failure_reason,
          raw_data,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3,
          $4::"PaymentProvider",
          $5,
          $6,
          $7,
          $8::"PaymentAttemptStatus",
          $9,
          $10::"PlanType",
          $11,
          $12,
          $13,
          $14,
          $15::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT ("payment_provider", "external_payment_id") DO NOTHING`,
        [
          id,
          input.userId,
          input.subscriptionId ?? null,
          input.paymentProvider,
          input.externalPaymentId,
          input.providerEventId ?? null,
          input.providerStatus ?? null,
          input.status,
          input.planSlug ?? null,
          input.planType ?? null,
          input.amount ?? null,
          input.currency ?? null,
          occurredAt,
          input.failureReason ?? null,
          JSON.stringify(input.rawData ?? null),
        ]
      );
    } catch (err) {
      // No rompemos el flujo de activación/cancelación por un fallo de persistencia del historial.
      this.logger.warn(`No se pudo registrar payment_attempt: ${(err as Error)?.message ?? err}`);
    }
  }

  private async list({
    where,
    params,
    limit,
    offset,
  }: {
    where: string[];
    params: any[];
    limit: number;
    offset: number;
  }): Promise<
    Array<{
      date: string;
      amount: string | number | null;
      currency: string | null;
      status: string;
      externalId: string;
    }>
  > {
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await this.postgres.queryRaw<any>(
      `SELECT
        occurred_at as "date",
        amount,
        currency,
        status,
        external_payment_id as "externalId"
      FROM payment_attempts
      ${whereSql}
      ORDER BY occurred_at DESC NULLS LAST, created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return rows.map((r: any) => ({
      date: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
      amount: r.amount ?? null,
      currency: r.currency ?? null,
      status: r.status ?? 'pending',
      externalId: r.externalId ?? '',
    }));
  }

  async listPaymentsByUserId(userId: string, filters: Omit<PaymentAttemptListFilters, 'userId'> = {}) {
    const where: string[] = ['user_id = $1::text'];
    const params: any[] = [userId];
    let i = 2;

    if (filters.status) {
      where.push(`status = $${i}::"PaymentAttemptStatus"`);
      params.push(filters.status);
      i++;
    }
    if (filters.paymentProvider) {
      where.push(`payment_provider = $${i}::"PaymentProvider"`);
      params.push(filters.paymentProvider);
      i++;
    }
    if (filters.planSlug) {
      where.push(`plan_slug = $${i}`);
      params.push(filters.planSlug);
      i++;
    }
    if (filters.planType) {
      where.push(`plan_type = $${i}::"PlanType"`);
      params.push(filters.planType);
      i++;
    }
    if (filters.from) {
      where.push(`occurred_at >= $${i}::timestamptz`);
      params.push(filters.from);
      i++;
    }
    if (filters.to) {
      where.push(`occurred_at <= $${i}::timestamptz`);
      params.push(filters.to);
      i++;
    }

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    return this.list({ where, params, limit, offset });
  }

  async listPaymentsForAdmin(filters: PaymentAttemptListFilters) {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    const add = (cond: string, value: any) => {
      where.push(cond.replace('$X', `$${i}`));
      params.push(value);
      i++;
    };

    if (filters.userId) add('user_id = $X::text', filters.userId);
    if (filters.status) add('status = $X::"PaymentAttemptStatus"', filters.status);
    if (filters.paymentProvider) add('payment_provider = $X::"PaymentProvider"', filters.paymentProvider);
    if (filters.planSlug) add('plan_slug = $X', filters.planSlug);
    if (filters.planType) add('plan_type = $X::"PlanType"', filters.planType);
    if (filters.from) add('occurred_at >= $X::timestamptz', filters.from);
    if (filters.to) add('occurred_at <= $X::timestamptz', filters.to);

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    return this.list({ where, params, limit, offset });
  }

  async listEventsForAdmin(filters: PaymentAttemptListFilters) {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    const add = (cond: string, value: any) => {
      where.push(cond.replace('$X', `$${i}`));
      params.push(value);
      i++;
    };

    if (filters.userId) add('pa.user_id = $X::text', filters.userId);
    if (filters.status) add('pa.status = $X::"PaymentAttemptStatus"', filters.status);
    if (filters.paymentProvider) add('pa.payment_provider = $X::"PaymentProvider"', filters.paymentProvider);
    if (filters.planSlug) add('pa.plan_slug = $X', filters.planSlug);
    if (filters.planType) add('pa.plan_type = $X::"PlanType"', filters.planType);
    if (filters.from) add('pa.occurred_at >= $X::timestamptz', filters.from);
    if (filters.to) add('pa.occurred_at <= $X::timestamptz', filters.to);

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    return this.postgres.queryRaw<any>(
      `SELECT
        pa.id,
        pa.occurred_at as "date",
        pa.user_id as "userId",
        u.email as "userEmail",
        pa.payment_provider as "paymentProvider",
        pa.external_payment_id as "externalPaymentId",
        pa.provider_event_id as "providerEventId",
        pa.provider_status as "providerStatus",
        pa.status,
        pa.plan_slug as "planSlug",
        pa.plan_type as "planType",
        pa.amount,
        pa.currency,
        pa.failure_reason as "failureReason"
      FROM payment_attempts pa
      LEFT JOIN users u ON u.id = pa.user_id
      ${whereSql}
      ORDER BY pa.occurred_at DESC NULLS LAST, pa.created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );
  }
}

