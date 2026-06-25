import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import {
  addMonths,
  formatDateEsAr,
  formatPlanList,
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
  grantDurationMonths: number;
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
  grantDurationMonths: number;
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
  ) {}

  private mapRow(row: any): PromoCodeRow {
    const applicable =
      typeof row.applicablePlanSlugs === 'string'
        ? JSON.parse(row.applicablePlanSlugs)
        : row.applicablePlanSlugs;
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
    max_redemptions as "maxRedemptions", max_redemptions_per_user as "maxRedemptionsPerUser",
    redemption_count as "redemptionCount", is_active as "isActive",
    created_by_user_id as "createdByUserId", created_at as "createdAt", updated_at as "updatedAt"
  `;

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

    const id = `pc_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO promo_codes (
         id, code, description, discount_type, discount_percent, grant_plan_slug, applicable_plan_slugs,
         valid_from, valid_until, grant_duration_months, max_redemptions, max_redemptions_per_user,
         redemption_count, is_active, created_by_user_id, created_at, updated_at
       ) VALUES (
         $1, $2, $3, 'free', 100, $4, $5::jsonb, $6, $7, $8, $9, $10, 0, $11, $12, NOW(), NOW()
       )`,
      [
        id,
        code,
        dto.description ?? null,
        dto.grantPlanSlug,
        JSON.stringify(dto.applicablePlanSlugs),
        validFrom,
        validUntil,
        dto.grantDurationMonths,
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
    if (dto.grantDurationMonths !== undefined) add('grant_duration_months', dto.grantDurationMonths);
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

    const benefitEndsAt = valid && !planMismatch ? addMonths(now, promo.grantDurationMonths) : null;

    return {
      valid: valid && !planMismatch,
      code: promo.code,
      grantPlan: promo.grantPlanSlug,
      grantPlanLabel: PLAN_LABELS[promo.grantPlanSlug] ?? promo.grantPlanSlug,
      applicablePlans: promo.applicablePlanSlugs,
      applicablePlanLabels: promo.applicablePlanSlugs.map((s) => PLAN_LABELS[s] ?? s),
      grantDurationMonths: promo.grantDurationMonths,
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
  ): Promise<{ subscriptionId: string; grantPlan: string; expiresAt: string }> {
    const preview = await this.validateCode(code, contextPlanSlug);
    if (!preview.valid) {
      throw new BadRequestException(preview.message ?? 'No se puede canjear este código');
    }

    const promo = await this.findByCode(code);
    if (!promo) throw new NotFoundException('Código promocional no encontrado');

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

    const userRows = await this.postgres.queryRaw<any>(
      `SELECT tenant_id as "tenantId" FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [userId],
    );
    const tenantId = userRows[0]?.tenantId ?? null;

    const now = new Date();
    const expiresAt = addMonths(now, promo.grantDurationMonths);
    const redemptionId = `pcr_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const externalSubscriptionId = `promo-${redemptionId}`;

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

    return {
      subscriptionId: subscription.id,
      grantPlan: promo.grantPlanSlug,
      expiresAt: expiresAt.toISOString(),
    };
  }

  assertPlanSlug(slug: string) {
    if (!PROMO_PLAN_SLUGS.includes(slug as any)) {
      throw new BadRequestException(`Plan no válido: ${slug}`);
    }
  }
}
