import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionNotificationService } from '../payment/subscription-notification.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import {
  addMonths,
  formatDateEsAr,
  formatPlanList,
  isPromoUnlimitedDuration,
  normalizePromoCode,
  PLAN_LABELS,
  PROMO_PLAN_SLUGS,
} from './promo-codes.constants';

export type PromoCodeRow = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountPercent: number | null;
  grantPlanSlug: string;
  applicablePlanSlugs: string[];
  validFrom: Date;
  validUntil: Date;
  grantDurationMonths: number | null;
  freeTrialDays: number | null;
  maxRedemptions: number | null;
  maxRedemptionsPerUser: number;
  redemptionCount: number;
  isActive: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PromoValidateResult = {
  valid: boolean;
  code: string;
  grantPlan: string;
  grantPlanLabel: string;
  applicablePlans: string[];
  applicablePlanLabels: string[];
  grantDurationMonths: number | null;
  freeTrialDays: number | null;
  /** free_grant = canje interno sin pago; mp_free_trial = checkout Mercado Pago con free_trial */
  benefitKind: 'free_grant' | 'mp_free_trial';
  unlimitedDuration: boolean;
  benefitEndsAt: string | null;
  codeValidUntil: string;
  planMismatch: boolean;
  contextPlanSlug?: string;
  message?: string;
};

@Injectable()
export class PromoCodesService {
  private readonly logger = new Logger(PromoCodesService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionNotifications: SubscriptionNotificationService,
  ) {}

  private mapRow(row: any): PromoCodeRow {
    const applicable =
      typeof row.applicablePlanSlugs === 'string'
        ? JSON.parse(row.applicablePlanSlugs)
        : row.applicablePlanSlugs;
    const freeTrialRaw = row.freeTrialDays;
    const freeTrialDays =
      freeTrialRaw != null && Number.isFinite(Number(freeTrialRaw)) && Number(freeTrialRaw) > 0
        ? Number(freeTrialRaw)
        : null;
    return {
      id: row.id,
      code: row.code,
      description: row.description ?? null,
      discountType: row.discountType ?? 'free',
      discountPercent: row.discountPercent ?? null,
      grantPlanSlug: row.grantPlanSlug,
      applicablePlanSlugs: Array.isArray(applicable) ? applicable : [],
      validFrom: row.validFrom,
      validUntil: row.validUntil,
      grantDurationMonths: row.grantDurationMonths,
      freeTrialDays,
      maxRedemptions: row.maxRedemptions ?? null,
      maxRedemptionsPerUser: row.maxRedemptionsPerUser ?? 1,
      redemptionCount: row.redemptionCount ?? 0,
      isActive: row.isActive ?? true,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private selectFields = `
    id, code, description, discount_type as "discountType", discount_percent as "discountPercent",
    grant_plan_slug as "grantPlanSlug", applicable_plan_slugs as "applicablePlanSlugs",
    valid_from as "validFrom", valid_until as "validUntil", grant_duration_months as "grantDurationMonths",
    free_trial_days as "freeTrialDays",
    max_redemptions as "maxRedemptions", max_redemptions_per_user as "maxRedemptionsPerUser",
    redemption_count as "redemptionCount", is_active as "isActive",
    created_by_user_id as "createdByUserId", created_at as "createdAt", updated_at as "updatedAt"
  `;

  private isMpFreeTrial(promo: PromoCodeRow): boolean {
    return promo.freeTrialDays != null && promo.freeTrialDays > 0;
  }

  async list(filters: {
    search?: string;
    isActive?: boolean;
    plan?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (filters.search) {
      where.push(`code ILIKE $${i}`);
      params.push(`%${normalizePromoCode(filters.search)}%`);
      i++;
    }
    if (filters.isActive !== undefined) {
      where.push(`is_active = $${i}`);
      params.push(filters.isActive);
      i++;
    }
    if (filters.plan) {
      where.push(`grant_plan_slug = $${i}`);
      params.push(filters.plan);
      i++;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    const rows = await this.postgres.queryRaw<any>(
      `SELECT ${this.selectFields} FROM promo_codes ${whereSql}
       ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findById(id: string): Promise<PromoCodeRow> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT ${this.selectFields} FROM promo_codes WHERE id = $1 LIMIT 1`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('Código promocional no encontrado');
    return this.mapRow(rows[0]);
  }

  async findByCode(code: string): Promise<PromoCodeRow | null> {
    const normalized = normalizePromoCode(code);
    const rows = await this.postgres.queryRaw<any>(
      `SELECT ${this.selectFields} FROM promo_codes WHERE code = $1 LIMIT 1`,
      [normalized],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async create(dto: CreatePromoCodeDto, createdByUserId: string): Promise<PromoCodeRow> {
    const code = normalizePromoCode(dto.code);
    const existing = await this.findByCode(code);
    if (existing) throw new ConflictException('Ya existe un código con ese nombre');

    const validFrom = new Date(dto.validFrom);
    const validUntil = new Date(dto.validUntil);
    if (validUntil <= validFrom) {
      throw new BadRequestException('La fecha de expiración debe ser posterior a la fecha de inicio');
    }

    const freeTrialDays =
      typeof dto.freeTrialDays === 'number' && dto.freeTrialDays >= 1 ? dto.freeTrialDays : null;
    const unlimited = !freeTrialDays && dto.unlimitedDuration === true;
    const grantMonths = freeTrialDays || unlimited ? null : (dto.grantDurationMonths ?? null);
    if (!freeTrialDays && !unlimited && grantMonths == null) {
      throw new BadRequestException(
        'Indicá días de prueba gratis, meses de beneficio o activá duración ilimitada',
      );
    }

    const discountType = freeTrialDays ? 'mp_free_trial' : 'free';
    const discountPercent = freeTrialDays ? null : 100;

    const id = `pc_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO promo_codes (
         id, code, description, discount_type, discount_percent, grant_plan_slug, applicable_plan_slugs,
         valid_from, valid_until, grant_duration_months, free_trial_days, max_redemptions, max_redemptions_per_user,
         redemption_count, is_active, created_by_user_id, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, 0, $14, $15, NOW(), NOW()
       )`,
      [
        id,
        code,
        dto.description ?? null,
        discountType,
        discountPercent,
        dto.grantPlanSlug,
        JSON.stringify(dto.applicablePlanSlugs),
        validFrom,
        validUntil,
        grantMonths,
        freeTrialDays,
        dto.maxRedemptions ?? null,
        dto.maxRedemptionsPerUser ?? 1,
        dto.isActive !== false,
        createdByUserId,
      ],
    );
    return this.findById(id);
  }

  async update(id: string, dto: UpdatePromoCodeDto): Promise<PromoCodeRow> {
    const current = await this.findById(id);
    if (current.redemptionCount > 0 && (dto.grantPlanSlug || dto.applicablePlanSlugs)) {
      throw new BadRequestException(
        'No se puede cambiar el plan de un código que ya tiene canjes',
      );
    }

    const sets: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let i = 1;

    const add = (col: string, val: any, cast?: string) => {
      sets.push(`${col} = $${i}${cast ?? ''}`);
      params.push(val);
      i++;
    };

    if (dto.description !== undefined) add('description', dto.description);
    if (dto.grantPlanSlug !== undefined) add('grant_plan_slug', dto.grantPlanSlug);
    if (dto.applicablePlanSlugs !== undefined) {
      add('applicable_plan_slugs', JSON.stringify(dto.applicablePlanSlugs), '::jsonb');
    }
    if (dto.validFrom !== undefined) add('valid_from', new Date(dto.validFrom));
    if (dto.validUntil !== undefined) add('valid_until', new Date(dto.validUntil));

    const switchingToTrial =
      dto.freeTrialDays !== undefined &&
      dto.freeTrialDays != null &&
      Number(dto.freeTrialDays) >= 1;
    const clearingTrial = dto.freeTrialDays === null;

    if (switchingToTrial) {
      add('free_trial_days', Number(dto.freeTrialDays));
      add('grant_duration_months', null);
      add('discount_type', 'mp_free_trial');
      add('discount_percent', null);
    } else if (clearingTrial) {
      add('free_trial_days', null);
      add('discount_type', 'free');
      add('discount_percent', 100);
      if (dto.unlimitedDuration === true) {
        add('grant_duration_months', null);
      } else if (dto.grantDurationMonths !== undefined) {
        add('grant_duration_months', dto.grantDurationMonths);
      }
    } else {
      if (dto.unlimitedDuration === true) {
        add('grant_duration_months', null);
        add('free_trial_days', null);
        add('discount_type', 'free');
        add('discount_percent', 100);
      } else if (dto.grantDurationMonths !== undefined) {
        add('grant_duration_months', dto.grantDurationMonths);
        add('free_trial_days', null);
        add('discount_type', 'free');
        add('discount_percent', 100);
      }
    }

    if (dto.maxRedemptions !== undefined) add('max_redemptions', dto.maxRedemptions);
    if (dto.maxRedemptionsPerUser !== undefined) add('max_redemptions_per_user', dto.maxRedemptionsPerUser);
    if (dto.isActive !== undefined) add('is_active', dto.isActive);

    if (dto.validFrom && dto.validUntil) {
      if (new Date(dto.validUntil) <= new Date(dto.validFrom)) {
        throw new BadRequestException('La fecha de expiración debe ser posterior a la fecha de inicio');
      }
    }

    params.push(id);
    await this.postgres.executeRaw(
      `UPDATE promo_codes SET ${sets.join(', ')} WHERE id = $${i}`,
      params,
    );
    return this.findById(id);
  }

  async deactivate(id: string): Promise<PromoCodeRow> {
    return this.update(id, { isActive: false });
  }

  async listRedemptions(promoCodeId: string, limit = 50, offset = 0) {
    await this.findById(promoCodeId);
    return this.postgres.queryRaw<any>(
      `SELECT r.id, r.user_id as "userId", u.email as "userEmail",
              r.grant_plan_slug as "grantPlanSlug", r.duration_months as "durationMonths",
              r.redeemed_at as "redeemedAt", r.expires_at as "expiresAt"
       FROM promo_code_redemptions r
       JOIN users u ON u.id = r.user_id
       WHERE r.promo_code_id = $1
       ORDER BY r.redeemed_at DESC
       LIMIT $2 OFFSET $3`,
      [promoCodeId, limit, offset],
    );
  }

  private assertCodeRedeemable(promo: PromoCodeRow, now = new Date()): void {
    if (!promo.isActive) {
      throw new BadRequestException('Este código promocional está desactivado');
    }
    if (now < promo.validFrom) {
      throw new BadRequestException(
        `Este código aún no está vigente. Podés usarlo desde el ${formatDateEsAr(promo.validFrom)}`,
      );
    }
    if (now > promo.validUntil) {
      throw new BadRequestException(
        `Este código expiró el ${formatDateEsAr(promo.validUntil)}`,
      );
    }
    if (promo.maxRedemptions != null && promo.redemptionCount >= promo.maxRedemptions) {
      throw new BadRequestException('Este código alcanzó el límite de usos');
    }
  }

  private buildPlanMismatchMessage(promo: PromoCodeRow, contextPlanSlug: string): string {
    const applicableLabels = formatPlanList(promo.applicablePlanSlugs);
    const contextLabel = PLAN_LABELS[contextPlanSlug] ?? contextPlanSlug;
    if (promo.applicablePlanSlugs.length === 1) {
      return `Este cupón es válido para el plan ${applicableLabels}. Estás en el checkout del plan ${contextLabel}.`;
    }
    return `Este cupón aplica a los planes: ${applicableLabels}. Estás en el checkout del plan ${contextLabel}.`;
  }

  async validateCode(code: string, contextPlanSlug?: string): Promise<PromoValidateResult> {
    const promo = await this.findByCode(code);
    if (!promo) {
      throw new NotFoundException('Código promocional no encontrado');
    }

    const now = new Date();
    let valid = true;
    let message: string | undefined;

    try {
      this.assertCodeRedeemable(promo, now);
    } catch (e: any) {
      valid = false;
      message = e?.message ?? 'Código no válido';
    }

    const planMismatch =
      !!contextPlanSlug &&
      valid &&
      !promo.applicablePlanSlugs.includes(contextPlanSlug);

    if (planMismatch) {
      message = this.buildPlanMismatchMessage(promo, contextPlanSlug!);
    }

    const unlimited = !this.isMpFreeTrial(promo) && isPromoUnlimitedDuration(promo.grantDurationMonths);
    const benefitEndsAt =
      valid && !planMismatch && this.isMpFreeTrial(promo)
        ? (() => {
            const end = new Date(now);
            end.setDate(end.getDate() + (promo.freeTrialDays as number));
            return end;
          })()
        : valid && !planMismatch && !unlimited && promo.grantDurationMonths != null
          ? addMonths(now, promo.grantDurationMonths)
          : null;

    return {
      valid: valid && !planMismatch,
      code: promo.code,
      grantPlan: promo.grantPlanSlug,
      grantPlanLabel: PLAN_LABELS[promo.grantPlanSlug] ?? promo.grantPlanSlug,
      applicablePlans: promo.applicablePlanSlugs,
      applicablePlanLabels: promo.applicablePlanSlugs.map((s) => PLAN_LABELS[s] ?? s),
      grantDurationMonths: promo.grantDurationMonths,
      freeTrialDays: promo.freeTrialDays,
      benefitKind: this.isMpFreeTrial(promo) ? 'mp_free_trial' : 'free_grant',
      unlimitedDuration: unlimited,
      benefitEndsAt: benefitEndsAt ? benefitEndsAt.toISOString() : null,
      codeValidUntil: promo.validUntil.toISOString(),
      planMismatch,
      contextPlanSlug,
      message,
    };
  }

  async redeemCode(
    userId: string,
    code: string,
    contextPlanSlug?: string,
    billing?: {
      acceptedTerms: boolean;
      firstName: string;
      lastName: string;
      documentType?: string | null;
      documentNumber?: string | null;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      billingCycle?: 'monthly' | 'yearly';
    },
  ): Promise<{ subscriptionId: string; grantPlan: string; expiresAt: string | null }> {
    if (billing && !billing.acceptedTerms) {
      throw new BadRequestException(
        'Debés aceptar los términos y condiciones y la política de privacidad.',
      );
    }

    const preview = await this.validateCode(code, contextPlanSlug);
    if (!preview.valid) {
      throw new BadRequestException(preview.message ?? 'No se puede canjear este código');
    }

    const promo = await this.findByCode(code);
    if (!promo) throw new NotFoundException('Código promocional no encontrado');

    if (this.isMpFreeTrial(promo)) {
      throw new BadRequestException(
        `Este código otorga ${promo.freeTrialDays} días de prueba gratis en Mercado Pago. Usalo en el checkout del plan ${PLAN_LABELS[promo.grantPlanSlug] ?? promo.grantPlanSlug} y continuá al pago (no se canjea como plan gratis interno).`,
      );
    }

    const subs = await this.subscriptionService.findByUserId(userId);
    const paidActive = subs.find(
      (s) =>
        s.status === 'active' &&
        (s.paymentProvider === 'mercadopago' || s.paymentProvider === 'paypal') &&
        s.subscriptionPlan !== 'free',
    );
    if (paidActive) {
      throw new BadRequestException(
        'Ya tenés una suscripción de pago activa. Cancelala o esperá a que finalice antes de usar un código promocional.',
      );
    }

    const existingRedemption = await this.postgres.queryRaw<any>(
      `SELECT id FROM promo_code_redemptions WHERE promo_code_id = $1 AND user_id = $2 LIMIT 1`,
      [promo.id, userId],
    );
    if (existingRedemption[0]) {
      throw new BadRequestException('Ya canjeaste este código promocional');
    }

    const userRows = await this.postgres.queryRaw<{
      tenantId: string | null;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string | null;
      emailVerified: boolean | null;
    }>(
      `SELECT tenant_id as "tenantId", email, first_name as "firstName", last_name as "lastName",
              role::text as role, email_verified as "emailVerified"
       FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [userId],
    );
    const userRow = userRows[0];
    const tenantId = userRow?.tenantId ?? null;

    const now = new Date();
    const unlimited = isPromoUnlimitedDuration(promo.grantDurationMonths);
    const expiresAt =
      unlimited || promo.grantDurationMonths == null
        ? null
        : addMonths(now, promo.grantDurationMonths);
    const redemptionId = `pcr_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const externalSubscriptionId = `promo-${redemptionId}`;

    let checkoutSessionId: string | null = null;
    if (billing) {
      checkoutSessionId = await this.subscriptionService.createCheckoutSession({
        userId,
        planSlug: promo.grantPlanSlug,
        billingCycle: billing.billingCycle === 'yearly' ? 'yearly' : 'monthly',
        priceAmount: 0,
        currency: 'USD',
        paymentProvider: 'internal',
        firstName: billing.firstName.trim(),
        lastName: billing.lastName.trim(),
        documentType: billing.documentType ?? null,
        documentNumber: billing.documentNumber ?? null,
        street: billing.street.trim(),
        city: billing.city.trim(),
        state: billing.state.trim(),
        postalCode: billing.postalCode.trim(),
        country: billing.country.trim(),
      });
    }

    await this.subscriptionService.cancelActiveInternalSubscriptions(userId, externalSubscriptionId);

    const subscription = await this.subscriptionService.create({
      userId,
      paymentProvider: 'internal',
      externalSubscriptionId,
      status: 'active',
      planType: 'monthly',
      subscriptionPlan: promo.grantPlanSlug,
      currentPeriodStart: now,
      currentPeriodEnd: expiresAt,
      cancelAtPeriodEnd: false,
    });

    if (checkoutSessionId) {
      await this.subscriptionService.updateCheckoutSession(checkoutSessionId, {
        status: 'completed',
        subscriptionId: subscription.id,
      });
    }

    await this.postgres.executeRaw(
      `INSERT INTO promo_code_redemptions (
         id, promo_code_id, user_id, tenant_id, subscription_id,
         grant_plan_slug, duration_months, redeemed_at, expires_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
      [
        redemptionId,
        promo.id,
        userId,
        tenantId,
        subscription.id,
        promo.grantPlanSlug,
        promo.grantDurationMonths,
        expiresAt,
      ],
    );

    await this.postgres.executeRaw(
      `UPDATE promo_codes SET redemption_count = redemption_count + 1, updated_at = NOW() WHERE id = $1`,
      [promo.id],
    );

    await this.subscriptionService.syncTenantPlanFromSubscription(userId);

    this.logger.log(`Promo ${promo.code} canjeado por user ${userId} → plan ${promo.grantPlanSlug}`);

    try {
      if (userRow?.email) {
        await this.subscriptionNotifications.notifyPromoActivated({
          userId,
          userEmail: userRow.email,
          firstName: userRow.firstName ?? null,
          lastName: userRow.lastName ?? null,
          role: userRow.role ?? null,
          tenantId,
          emailVerified: userRow.emailVerified ?? null,
          subscriptionId: subscription.id,
          externalSubscriptionId,
          planSlug: promo.grantPlanSlug,
          planType: 'monthly',
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
          promoCode: promo.code,
          promoCodeId: promo.id,
          grantDurationMonths: promo.grantDurationMonths,
          unlimitedDuration: unlimited,
          redeemedAt: now,
        });
      }
    } catch (e) {
      this.logger.warn(`No se pudo notificar al admin la promo ${promo.code} de user ${userId}: ${e}`);
    }

    return {
      subscriptionId: subscription.id,
      grantPlan: promo.grantPlanSlug,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
    };
  }

  /**
   * Resuelve un cupón de prueba gratis MP para el checkout de pago.
   * No consume el canje: eso ocurre en recordMpTrialRedemption tras crear la suscripción.
   */
  async resolveMpTrialPromoForCheckout(params: {
    userId: string;
    code: string;
    planSlug: string;
  }): Promise<{ promo: PromoCodeRow; freeTrialDays: number }> {
    const preview = await this.validateCode(params.code, params.planSlug);
    if (!preview.valid) {
      throw new BadRequestException(preview.message ?? 'Código promocional no válido');
    }
    const promo = await this.findByCode(params.code);
    if (!promo || !this.isMpFreeTrial(promo)) {
      throw new BadRequestException(
        'Este código no es de prueba gratis. Si otorga plan sin cobro, usá «Activar código promocional».',
      );
    }
    if (promo.grantPlanSlug !== params.planSlug) {
      throw new BadRequestException(
        `Este cupón otorga ${PLAN_LABELS[promo.grantPlanSlug] ?? promo.grantPlanSlug}. Elegí ese plan en el checkout.`,
      );
    }

    const existingRedemption = await this.postgres.queryRaw<any>(
      `SELECT id FROM promo_code_redemptions WHERE promo_code_id = $1 AND user_id = $2 LIMIT 1`,
      [promo.id, params.userId],
    );
    if (existingRedemption[0]) {
      throw new BadRequestException('Ya usaste este código promocional');
    }

    return { promo, freeTrialDays: promo.freeTrialDays as number };
  }

  async recordMpTrialRedemption(params: {
    userId: string;
    promoId: string;
    grantPlanSlug: string;
    freeTrialDays: number;
    subscriptionId: string;
  }): Promise<void> {
    const existing = await this.postgres.queryRaw<any>(
      `SELECT id FROM promo_code_redemptions WHERE promo_code_id = $1 AND user_id = $2 LIMIT 1`,
      [params.promoId, params.userId],
    );
    if (existing[0]) return;

    const userRows = await this.postgres.queryRaw<{ tenantId: string | null }>(
      `SELECT tenant_id as "tenantId" FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [params.userId],
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + params.freeTrialDays);
    const redemptionId = `pcr_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    await this.postgres.executeRaw(
      `INSERT INTO promo_code_redemptions (
         id, promo_code_id, user_id, tenant_id, subscription_id,
         grant_plan_slug, duration_months, redeemed_at, expires_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NULL, NOW(), $7)`,
      [
        redemptionId,
        params.promoId,
        params.userId,
        userRows[0]?.tenantId ?? null,
        params.subscriptionId,
        params.grantPlanSlug,
        expiresAt,
      ],
    );
    await this.postgres.executeRaw(
      `UPDATE promo_codes SET redemption_count = redemption_count + 1, updated_at = NOW() WHERE id = $1`,
      [params.promoId],
    );
  }

  assertPlanSlug(slug: string) {
    if (!PROMO_PLAN_SLUGS.includes(slug as any)) {
      throw new BadRequestException(`Plan no válido: ${slug}`);
    }
  }
}
