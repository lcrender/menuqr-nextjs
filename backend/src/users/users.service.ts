import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { EmailService } from '../common/email/email.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';
import { defaultEmailDisplayName, normalizeEmailLang } from '../common/email/email-i18n';
import { TENANT_PLAN_KEYS, type TenantPlanKey } from '../common/plan-limits/plan-limits.constants';
import { PLAN_DISPLAY_LABELS } from '../dashboard-welcome/dashboard-welcome.constants';
import type { SendMarketingNewsletterDto } from './dto/send-marketing-newsletter.dto';

// Tipo extendido para incluir campos de verificación de email y sesiones
type UserWithVerification = User & {
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerifiedAt: Date | null;
  pendingPlan?: string | null;
  pendingBillingCycle?: 'monthly' | 'yearly' | null;
  revokedSessionsBefore?: Date | null;
  excludeFromMetrics?: boolean;
  preferredLanguage?: string | null;
  accountCancelledAt?: Date | null;
  accountCancelReason?: string | null;
  accountCancelReasonDetail?: string | null;
  accountReactivationToken?: string | null;
  accountReactivationExpiresAt?: Date | null;
};

type MarketingRecipient = {
  id: string;
  email: string;
  firstName: string | null;
  preferredLanguage: string | null;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private static readonly MARKETING_TEMPLATE_ID = 'marketing.newsletter';

  constructor(
    private readonly postgres: PostgresService,
    private readonly emailService: EmailService,
    private readonly emailTemplates: EmailTemplatesService,
  ) {}

  async findByEmail(email: string): Promise<UserWithVerification | null> {
    const result = await this.postgres.queryRaw<any>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL LIMIT 1',
      [email]
    );
    if (!result[0]) return null;
    return this.mapUserFromDb(result[0]);
  }
  
  private mapUserFromDb(row: any): UserWithVerification {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      isActive: row.is_active,
      emailVerified: row.email_verified || false,
      emailVerificationToken: row.email_verification_token || null,
      emailVerifiedAt: row.email_verified_at || null,
      pendingEmail: row.pending_email ?? null,
      emailChangeToken: row.email_change_token ?? null,
      emailChangeExpiresAt: row.email_change_expires_at ?? null,
      autoTranslateEnabled: row.auto_translate_enabled ?? null,
      pendingPlan: row.pending_plan ?? null,
      pendingBillingCycle: row.pending_billing_cycle ?? null,
      lastLoginAt: row.last_login_at,
      revokedSessionsBefore: row.revoked_sessions_before ?? null,
      registrationCountry: row.registration_country ?? null,
      declaredCountry: row.declared_country ?? null,
      preferredLanguage: row.preferred_language === 'en' ? 'en' : 'es',
      excludeFromMetrics: row.exclude_from_metrics === true,
      accountCancelledAt: row.account_cancelled_at ?? null,
      accountCancelReason: row.account_cancel_reason ?? null,
      accountCancelReasonDetail: row.account_cancel_reason_detail ?? null,
      accountReactivationToken: row.account_reactivation_token ?? null,
      accountReactivationExpiresAt: row.account_reactivation_expires_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    } as UserWithVerification;
  }

  async findById(id: string): Promise<UserWithVerification | null> {
    const result = await this.postgres.queryRaw<any>(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [id]
    );
    if (!result[0]) return null;
    return this.mapUserFromDb(result[0]);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    role: string;
    tenantId?: string | null;
    isActive: boolean;
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
    pendingPlan?: string | null;
    pendingBillingCycle?: 'monthly' | 'yearly' | null;
    registrationCountry?: string | null;
    declaredCountry?: string | null;
      acceptedTermsAt?: Date | null;
    marketingOptIn?: boolean;
    marketingOptInAt?: Date | null;
    preferredLanguage?: string | null;
  }): Promise<User> {
    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const marketingOptIn = data.marketingOptIn === true;
    const preferredLanguage =
      String(data.preferredLanguage || 'es').trim().toLowerCase() === 'en' ? 'en' : 'es';
    await this.postgres.executeRaw(
      `INSERT INTO users (
         id, email, password_hash, first_name, last_name, role, tenant_id, is_active,
         email_verified, email_verification_token, pending_plan, pending_billing_cycle,
         registration_country, declared_country, accepted_terms_at, marketing_opt_in, marketing_opt_in_at,
         preferred_language, created_at, updated_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6::"UserRole", $7, $8,
         $9, $10, $11, $12::"PlanType",
         $13, $14, $15, $16, $17,
         $18, NOW(), NOW()
       )`,
      [
        id,
        data.email,
        data.passwordHash,
        data.firstName || null,
        data.lastName || null,
        data.role,
        data.tenantId || null,
        data.isActive,
        data.emailVerified || false,
        data.emailVerificationToken || null,
        data.pendingPlan ?? null,
        data.pendingBillingCycle ?? null,
        data.registrationCountry ?? null,
        data.declaredCountry ?? null,
        data.acceptedTermsAt ?? null,
        marketingOptIn,
        marketingOptIn ? (data.marketingOptInAt ?? new Date()) : null,
        preferredLanguage,
      ]
    );
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`Usuario insertado pero no encontrado por id: ${id}`);
      throw new InternalServerErrorException('Error creando usuario. Por favor, intentá de nuevo.');
    }
    return user as UserWithVerification;
  }

  async verifyEmail(token: string): Promise<UserWithVerification> {
    const result = await this.postgres.queryRaw<any>(
      'SELECT * FROM users WHERE email_verification_token = $1 AND deleted_at IS NULL LIMIT 1',
      [token]
    );
    
    if (!result[0]) {
      throw new NotFoundException('Token de verificación inválido o expirado');
    }

    const user = this.mapUserFromDb(result[0]);

    if (user.emailVerified === true) {
      throw new BadRequestException('El email ya ha sido verificado');
    }

    // Verificar que el token no tenga más de 24 horas
    const tokenAge = Date.now() - new Date(user.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (tokenAge > maxAge) {
      throw new BadRequestException('El token de verificación ha expirado. Por favor, solicita uno nuevo.');
    }

    // Actualizar usuario como verificado
    await this.postgres.executeRaw(
      `UPDATE users 
       SET email_verified = true, 
           email_verified_at = NOW(), 
           email_verification_token = NULL,
           updated_at = NOW() 
       WHERE id = $1`,
      [user.id]
    );

    return this.findById(user.id) as Promise<UserWithVerification>;
  }

  async getPendingPlan(userId: string): Promise<{ plan: string; billingCycle: 'monthly' | 'yearly' } | null> {
    const rows = await this.postgres.queryRaw<any>(
      'SELECT pending_plan, pending_billing_cycle FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [userId],
    );
    const plan = rows[0]?.pending_plan ? String(rows[0].pending_plan).toLowerCase() : '';
    const billing = rows[0]?.pending_billing_cycle ? String(rows[0].pending_billing_cycle).toLowerCase() : '';
    if (!plan || !billing) return null;
    if (!['starter', 'pro', 'premium'].includes(plan)) return null;
    if (billing !== 'monthly' && billing !== 'yearly') return null;
    return { plan, billingCycle: billing as 'monthly' | 'yearly' };
  }

  async clearPendingPlan(userId: string): Promise<void> {
    await this.postgres.executeRaw(
      'UPDATE users SET pending_plan = NULL, pending_billing_cycle = NULL, updated_at = NOW() WHERE id = $1',
      [userId],
    );
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.postgres.executeRaw(
      'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.postgres.executeRaw(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, id]
    );
  }

  /** Invalida todas las sesiones (refresh tokens) emitidas antes de ahora. */
  async setRevokedSessionsBefore(id: string): Promise<void> {
    await this.postgres.executeRaw(
      'UPDATE users SET revoked_sessions_before = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    );
  }

  /**
   * Solicitud de cambio de email: valida que el nuevo email no esté en uso, genera token seguro
   * y guarda pending_email, email_change_token (hash), email_change_expires_at.
   * Retorna el token en claro para enviarlo por email (no se guarda en DB).
   */
  async requestEmailChange(userId: string, newEmail: string): Promise<{ token: string; pendingEmail: string }> {
    const normalized = newEmail.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('El email no es válido.');
    }
    const existing = await this.findByEmail(normalized);
    if (existing && existing.id !== userId) {
      throw new BadRequestException('Este correo ya está registrado en el sistema.');
    }
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.email.toLowerCase() === normalized) {
      throw new BadRequestException('El nuevo email es igual al actual.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.postgres.executeRaw(
      `UPDATE users SET pending_email = $1, email_change_token = $2, email_change_expires_at = $3, updated_at = NOW() WHERE id = $4`,
      [normalized, tokenHash, expiresAt, userId]
    );
    this.logger.log(`Solicitud de cambio de email para usuario ${userId} -> ${normalized}`);
    return { token, pendingEmail: normalized };
  }

  /**
   * Confirma el cambio de email con el token del link. Valida token y expiración,
   * actualiza email, limpia pending_* e invalida el token. Retorna oldEmail para notificación.
   */
  async confirmEmailChange(
    token: string,
  ): Promise<{ oldEmail: string; newEmail: string; preferredLanguage: 'es' | 'en' }> {
    if (!token || token.length < 32) {
      throw new BadRequestException('Enlace inválido o expirado.');
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, email, pending_email, preferred_language FROM users WHERE email_change_token = $1 AND email_change_expires_at > NOW() AND deleted_at IS NULL LIMIT 1`,
      [tokenHash]
    );
    if (!rows[0]) {
      throw new BadRequestException('Enlace inválido o expirado.');
    }
    const { id, email: oldEmail, pending_email: newEmail, preferred_language } = rows[0];
    if (!newEmail) {
      throw new BadRequestException('Enlace inválido o expirado.');
    }
    // Rechequear que el nuevo email no haya sido tomado entretanto
    const existing = await this.findByEmail(newEmail);
    if (existing && existing.id !== id) {
      await this.postgres.executeRaw(
        `UPDATE users SET pending_email = NULL, email_change_token = NULL, email_change_expires_at = NULL, updated_at = NOW() WHERE id = $1`,
        [id]
      );
      throw new BadRequestException('Este correo ya está registrado. Solicita un nuevo cambio de email.');
    }
    await this.postgres.executeRaw(
      `UPDATE users SET email = $1, pending_email = NULL, email_change_token = NULL, email_change_expires_at = NULL, updated_at = NOW() WHERE id = $2`,
      [newEmail, id]
    );
    this.logger.log(`Email cambiado para usuario ${id}: ${oldEmail} -> ${newEmail}`);
    return {
      oldEmail,
      newEmail,
      preferredLanguage: preferred_language === 'en' ? 'en' : 'es',
    };
  }

  /**
   * Actualizar usuario por parte del super admin (región/país de facturación, etc.).
   */
  async updateByAdmin(
    id: string,
    data: { declaredCountry?: string | null },
  ): Promise<UserWithVerification> {
    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let i = 1;
    if (data.declaredCountry !== undefined) {
      updates.push(`declared_country = $${i}`);
      params.push(data.declaredCountry === '' ? null : data.declaredCountry);
      i++;
    }
    // Si no hay ningún campo que actualizar (solo updated_at), devolver el usuario sin tocar la BD
    if (updates.length <= 1) {
      const user = await this.findById(id);
      if (!user) throw new NotFoundException('Usuario no encontrado');
      return user as UserWithVerification;
    }
    params.push(id);
    await this.postgres.executeRaw(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`,
      params,
    );
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user as UserWithVerification;
  }

  /**
   * Suscripción activa con plan distinto de free (incluye promo/internal no-free y planes de pago).
   */
  async hasNonFreeActiveSubscription(userId: string): Promise<boolean> {
    const rows = await this.postgres.queryRaw<{ ok: number }>(
      `SELECT 1 AS ok
       FROM subscriptions
       WHERE user_id = $1
         AND status = 'active'
         AND LOWER(COALESCE(subscription_plan, 'free')) <> 'free'
       LIMIT 1`,
      [userId],
    );
    if (rows.length > 0) return true;

    const tenantRows = await this.postgres.queryRaw<{ plan: string | null }>(
      `SELECT t.plan
       FROM users u
       INNER JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
       WHERE u.id = $1 AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );
    const plan = String(tenantRows[0]?.plan || 'free').toLowerCase();
    return plan !== 'free';
  }

  /** Normaliza preferencia de moneda/región: AR (ARS/MP) o null/otro (USD/PayPal). */
  private normalizeDeclaredCountry(value: string | null | undefined): string | null {
    if (value === undefined || value === null || value === '') return null;
    const code = String(value).trim().toUpperCase();
    if (code === 'AR') return 'AR';
    // Preferencia explícita USD (evita que registrationCountry=AR fuerce Mercado Pago).
    if (code === 'US' || code === 'GLOBAL' || code === 'ES') return 'US';
    return code.length === 2 ? code : null;
  }

  async updateProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      declaredCountry?: string | null;
      preferredLanguage?: string | null;
    },
  ): Promise<UserWithVerification> {
    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let i = 1;
    if (data.firstName !== undefined) {
      updates.push(`first_name = $${i}`);
      params.push(data.firstName || null);
      i++;
    }
    if (data.lastName !== undefined) {
      updates.push(`last_name = $${i}`);
      params.push(data.lastName || null);
      i++;
    }
    if (data.preferredLanguage !== undefined) {
      const lang = String(data.preferredLanguage || 'es').trim().toLowerCase() === 'en' ? 'en' : 'es';
      updates.push(`preferred_language = $${i}`);
      params.push(lang);
      i++;
    }
    if (data.declaredCountry !== undefined) {
      const current = await this.findById(id);
      if (!current) throw new NotFoundException('Usuario no encontrado');

      const nextCountry = this.normalizeDeclaredCountry(data.declaredCountry);
      const registration = this.normalizeDeclaredCountry(current.registrationCountry);
      const prevDeclared = this.normalizeDeclaredCountry(current.declaredCountry);
      const prevCurrency =
        (prevDeclared ?? registration) === 'AR' ? 'ARS' : 'USD';
      const nextCurrency = (nextCountry ?? registration) === 'AR' ? 'ARS' : 'USD';

      if (prevCurrency !== nextCurrency && (await this.hasNonFreeActiveSubscription(id))) {
        throw new BadRequestException(
          'No podés cambiar la moneda porque tenés una suscripción activa. Comunicate con soporte para solicitar el cambio.',
        );
      }

      updates.push(`declared_country = $${i}`);
      params.push(nextCountry);
      i++;
    }
    if (updates.length <= 1) {
      const user = await this.findById(id);
      if (!user) throw new NotFoundException('Usuario no encontrado');
      return user as UserWithVerification;
    }
    params.push(id);
    await this.postgres.executeRaw(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`,
      params,
    );
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user as UserWithVerification;
  }

  async findAllWithStats(userEmail?: string, limit?: number, offset?: number): Promise<{ data: any[]; total: number }> {
    // Query para contar el total
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
    `;
    const countParams: any[] = [];
    
    if (userEmail) {
      countQuery += ` AND LOWER(u.email) LIKE LOWER($${countParams.length + 1})`;
      countParams.push(`%${userEmail}%`);
    }
    
    const countResult = await this.postgres.queryRaw<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Query para obtener los datos
    let query = `
      SELECT 
        u.id,
        u.email,
        u.role,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.is_active as "isActive",
        u.tenant_id as "tenantId",
        u.declared_country as "declaredCountry",
        u.exclude_from_metrics as "excludeFromMetrics",
        t.name as "tenantName",
        t.plan as "subscriptionPlan",
        COUNT(DISTINCT r.id) as "restaurantCount",
        COUNT(DISTINCT m.id) as "menuCount",
        COUNT(DISTINCT CASE WHEN mi.active = true THEN mi.id END) as "activeProductCount",
        COUNT(DISTINCT CASE WHEN mi.active = false THEN mi.id END) as "inactiveProductCount"
      FROM users u
      LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.tenant_id = u.tenant_id AND r.deleted_at IS NULL
      LEFT JOIN menus m ON m.tenant_id = u.tenant_id AND m.deleted_at IS NULL
      LEFT JOIN menu_items mi ON mi.tenant_id = u.tenant_id AND mi.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    
    if (userEmail) {
      query += ` AND LOWER(u.email) LIKE LOWER($${params.length + 1})`;
      params.push(`%${userEmail}%`);
    }
    
    query += ` GROUP BY u.id, u.email, u.role, u.first_name, u.last_name, u.is_active, u.tenant_id, u.declared_country, u.exclude_from_metrics, t.name, t.plan
      ORDER BY u.created_at DESC`;

    // Aplicar paginación si se proporciona
    if (limit !== undefined && limit !== null) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
      
      if (offset !== undefined && offset !== null) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
      }
    }

    const users = await this.postgres.queryRaw<any>(query, params);

    return {
      data: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: u.isActive,
        tenantId: u.tenantId,
        tenantName: u.tenantName,
        declaredCountry: u.declaredCountry ?? null,
        excludeFromMetrics: u.excludeFromMetrics === true,
        subscriptionPlan: u.subscriptionPlan || null,
        restaurantCount: parseInt(u.restaurantCount) || 0,
        menuCount: parseInt(u.menuCount) || 0,
        activeProductCount: parseInt(u.activeProductCount) || 0,
        inactiveProductCount: parseInt(u.inactiveProductCount) || 0,
      })),
      total,
    };
  }

  async getUserDetails(userId: string): Promise<any> {
    // Obtener información del usuario
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.tenantId) {
      // Si no tiene tenant (SUPER_ADMIN), retornar datos vacíos
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: null,
          declaredCountry: user.declaredCountry ?? null,
          registrationCountry: user.registrationCountry ?? null,
          lastLoginAt: user.lastLoginAt ?? null,
          createdAt: user.createdAt ?? null,
          excludeFromMetrics: user.excludeFromMetrics === true,
          isActive: user.isActive,
          accountCancelledAt: user.accountCancelledAt ?? null,
          accountCancelReason: user.accountCancelReason ?? null,
          accountCancelReasonDetail: user.accountCancelReasonDetail ?? null,
        },
        restaurants: [],
        menus: [],
        products: [],
      };
    }

    // Obtener comercios con sus plantillas
    const restaurants = await this.postgres.queryRaw<any>(
      `SELECT 
        r.id,
        r.name,
        r.slug,
        r.template,
        r.is_active as "isActive",
        COUNT(DISTINCT m.id) as "menuCount"
      FROM restaurants r
      LEFT JOIN menus m ON m.restaurant_id = r.id AND m.deleted_at IS NULL
      WHERE r.tenant_id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id, r.name, r.slug, r.template, r.is_active
      ORDER BY r.created_at DESC`,
      [user.tenantId]
    );

    // Obtener todos los menús
    const menus = await this.postgres.queryRaw<any>(
      `SELECT 
        m.id,
        m.name,
        m.slug,
        m.status,
        m.restaurant_id as "restaurantId",
        r.name as "restaurantName",
        r.template as "restaurantTemplate"
      FROM menus m
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      WHERE m.tenant_id = $1 AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC`,
      [user.tenantId]
    );

    // Obtener todos los productos
    const products = await this.postgres.queryRaw<any>(
      `SELECT 
        mi.id,
        mi.name,
        mi.active,
        mi.menu_id as "menuId",
        m.name as "menuName",
        m.restaurant_id as "restaurantId",
        r.name as "restaurantName",
        r.template as "restaurantTemplate"
      FROM menu_items mi
      LEFT JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      WHERE mi.tenant_id = $1 AND mi.deleted_at IS NULL
      ORDER BY mi.created_at DESC`,
      [user.tenantId]
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        declaredCountry: user.declaredCountry ?? null,
        registrationCountry: user.registrationCountry ?? null,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt ?? null,
        excludeFromMetrics: user.excludeFromMetrics === true,
        isActive: user.isActive,
        accountCancelledAt: user.accountCancelledAt ?? null,
        accountCancelReason: user.accountCancelReason ?? null,
        accountCancelReasonDetail: user.accountCancelReasonDetail ?? null,
      },
      restaurants: restaurants.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        template: r.template || 'classic',
        isActive: r.isActive,
        menuCount: parseInt(r.menuCount) || 0,
      })),
      menus: menus.map((m: any) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        status: m.status,
        restaurantId: m.restaurantId,
        restaurantName: m.restaurantName || 'Sin comercio',
        restaurantTemplate: m.restaurantTemplate || 'classic',
      })),
      products: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        active: p.active,
        menuId: p.menuId,
        menuName: p.menuName || 'Sin menú',
        restaurantId: p.restaurantId,
        restaurantName: p.restaurantName || 'Sin comercio',
        restaurantTemplate: p.restaurantTemplate || 'classic',
      })),
    };
  }

  /** Oculta o muestra al usuario (y los datos de su tenant) en las métricas generales. */
  async setExcludeFromMetrics(userId: string, excludeFromMetrics: boolean): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.postgres.executeRaw(
      'UPDATE users SET exclude_from_metrics = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
      [excludeFromMetrics, userId],
    );
  }

  /** Activar o desactivar usuario (solo SUPER_ADMIN). */
  async setActive(userId: string, isActive: boolean): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.postgres.executeRaw(
      `UPDATE users
       SET is_active = $1,
           account_reactivation_token = CASE WHEN $1 = true THEN NULL ELSE account_reactivation_token END,
           account_reactivation_expires_at = CASE WHEN $1 = true THEN NULL ELSE account_reactivation_expires_at END,
           updated_at = NOW()
       WHERE id = $2`,
      [isActive, userId]
    );
  }

  /**
   * Suscripción Starter, Pro, Pro Team o Premium todavía activa y sin baja programada.
   * Pro Team asignado a mano vive en el plan del tenant.
   */
  async findPaidPlanBlockingAccountCancel(userId: string): Promise<string | null> {
    const paid = new Set(['starter', 'pro', 'pro_team', 'premium']);
    const rows = await this.postgres.queryRaw<any>(
      `SELECT LOWER(COALESCE(s.subscription_plan, '')) AS slug,
              s.payment_provider AS provider,
              s.cancel_at_period_end AS "cancelAtPeriodEnd",
              LOWER(COALESCE(t.plan, '')) AS "tenantPlan"
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId],
    );
    if (!rows.length) return null;
    const tenantPlan = String(rows[0].tenantPlan || '');
    if (tenantPlan === 'pro_team') return 'pro_team';
    for (const row of rows) {
      const provider = String(row.provider || '');
      if (!provider || provider === 'internal') continue;
      const slug = String(row.slug || '');
      const effective = paid.has(slug) ? slug : paid.has(tenantPlan) ? tenantPlan : '';
      if (!effective) continue;
      if (row.cancelAtPeriodEnd === true) continue;
      return effective;
    }
    return null;
  }

  async cancelOwnAccount(userId: string, reason: string, detail: string | null): Promise<void> {
    await this.postgres.executeRaw(
      `UPDATE users
       SET is_active = false,
           account_cancelled_at = NOW(),
           account_cancel_reason = $2,
           account_cancel_reason_detail = $3,
           account_reactivation_token = NULL,
           account_reactivation_expires_at = NULL,
           revoked_sessions_before = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId, reason, detail],
    );
  }

  async saveAccountReactivationToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.postgres.executeRaw(
      `UPDATE users
       SET account_reactivation_token = $2,
           account_reactivation_expires_at = $3,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL AND is_active = false`,
      [userId, token, expiresAt],
    );
  }

  async findByReactivationToken(token: string): Promise<UserWithVerification | null> {
    const result = await this.postgres.queryRaw<any>(
      `SELECT * FROM users
       WHERE account_reactivation_token = $1
         AND deleted_at IS NULL
         AND is_active = false
         AND account_cancelled_at IS NOT NULL
         AND account_reactivation_expires_at > NOW()
       LIMIT 1`,
      [token],
    );
    if (!result[0]) return null;
    return this.mapUserFromDb(result[0]);
  }

  async reactivateCancelledAccount(userId: string): Promise<void> {
    await this.postgres.executeRaw(
      `UPDATE users
       SET is_active = true,
           account_reactivation_token = NULL,
           account_reactivation_expires_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
  }

  /** Borrado lógico de usuario (solo SUPER_ADMIN). */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.postgres.executeRaw(
      'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  /** Usuarios que optaron por recibir novedades (super admin). */
  async listMarketingOptInUsers(opts?: {
    email?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[]; total: number }> {
    const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
    const offset = Math.max(opts?.offset ?? 0, 0);
    const emailFilter = (opts?.email || '').trim().toLowerCase();
    const params: any[] = [];
    let where = `u.deleted_at IS NULL AND u.marketing_opt_in = true`;
    if (emailFilter) {
      params.push(`%${emailFilter}%`);
      where += ` AND LOWER(u.email) LIKE $${params.length}`;
    }

    const countRows = await this.postgres.queryRaw<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM users u WHERE ${where}`,
      params,
    );
    const total = parseInt(countRows[0]?.total || '0', 10) || 0;

    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const rows = await this.postgres.queryRaw<any>(
      `SELECT
         u.id,
         u.email,
         u.first_name AS "firstName",
         u.last_name AS "lastName",
         u.role,
         u.is_active AS "isActive",
         u.email_verified AS "emailVerified",
         u.preferred_language AS "preferredLanguage",
         u.marketing_opt_in AS "marketingOptIn",
         u.marketing_opt_in_at AS "marketingOptInAt",
         u.accepted_terms_at AS "acceptedTermsAt",
         u.created_at AS "createdAt",
         u.registration_country AS "registrationCountry",
         u.declared_country AS "declaredCountry",
         t.name AS "tenantName",
         t.plan AS "tenantPlan"
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id
       WHERE ${where}
       ORDER BY u.marketing_opt_in_at DESC NULLS LAST, u.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return {
      data: rows.map((r) => ({
        id: r.id,
        email: r.email,
        firstName: r.firstName,
        lastName: r.lastName,
        role: r.role,
        isActive: r.isActive,
        emailVerified: r.emailVerified,
        preferredLanguage: String(r.preferredLanguage || 'es').trim().toLowerCase() === 'en' ? 'en' : 'es',
        marketingOptIn: r.marketingOptIn,
        marketingOptInAt: r.marketingOptInAt,
        acceptedTermsAt: r.acceptedTermsAt,
        createdAt: r.createdAt,
        registrationCountry: r.registrationCountry,
        declaredCountry: r.declaredCountry,
        tenantName: r.tenantName,
        tenantPlan: r.tenantPlan,
      })),
      total,
    };
  }

  /** Datos iniciales del compositor de novedades (plantilla + conteos). */
  async getMarketingComposeData(lang: 'es' | 'en' = 'es') {
    const [resolved, counts] = await Promise.all([
      this.emailTemplates.resolveContent(UsersService.MARKETING_TEMPLATE_ID, lang),
      this.getMarketingAudienceCounts(),
    ]);

    return {
      templateId: UsersService.MARKETING_TEMPLATE_ID,
      lang,
      subject: resolved.subject,
      bodyHtml: resolved.bodyHtml,
      wrapInShell: resolved.wrapInShell,
      plans: TENANT_PLAN_KEYS.map((key) => ({
        slug: key,
        label: PLAN_DISPLAY_LABELS[key],
        count: counts.byPlan[key] ?? 0,
      })),
      counts: {
        all: counts.all,
        verified: counts.verified,
        byPlan: counts.byPlan,
      },
    };
  }

  async getMarketingAudienceCounts(): Promise<{
    all: number;
    verified: number;
    byPlan: Record<TenantPlanKey, number>;
  }> {
    const [totals, planRows] = await Promise.all([
      this.postgres.queryRaw<{ all_count: string; verified_count: string }>(
        `SELECT
           COUNT(*)::text AS all_count,
           COUNT(*) FILTER (WHERE u.email_verified = true)::text AS verified_count
         FROM users u
         WHERE u.deleted_at IS NULL AND u.marketing_opt_in = true AND u.is_active = true`,
      ),
      this.postgres.queryRaw<{ plan: string | null; plan_count: string }>(
        `SELECT t.plan AS plan, COUNT(*)::text AS plan_count
         FROM users u
         LEFT JOIN tenants t ON t.id = u.tenant_id
         WHERE u.deleted_at IS NULL AND u.marketing_opt_in = true AND u.is_active = true
         GROUP BY t.plan`,
      ),
    ]);

    const byPlan = Object.fromEntries(TENANT_PLAN_KEYS.map((k) => [k, 0])) as Record<
      TenantPlanKey,
      number
    >;
    for (const row of planRows) {
      if (row.plan && TENANT_PLAN_KEYS.includes(row.plan as TenantPlanKey)) {
        byPlan[row.plan as TenantPlanKey] = parseInt(row.plan_count, 10) || 0;
      }
    }

    return {
      all: parseInt(totals[0]?.all_count || '0', 10) || 0,
      verified: parseInt(totals[0]?.verified_count || '0', 10) || 0,
      byPlan,
    };
  }

  async sendMarketingNewsletter(dto: SendMarketingNewsletterDto) {
    const subject = dto.subject.trim();
    const bodyHtml = dto.bodyHtml.trim();
    if (!subject || !bodyHtml) {
      throw new BadRequestException('Asunto y cuerpo son obligatorios');
    }

    const recipients = await this.resolveMarketingRecipients(dto);
    if (recipients.length === 0) {
      throw new BadRequestException('No hay destinatarios para la audiencia seleccionada');
    }

    const shellLang = normalizeEmailLang(dto.lang || 'es');
    const year = String(new Date().getFullYear());
    let sent = 0;
    const failed: Array<{ email: string; error: string }> = [];

    for (const recipient of recipients) {
      const firstName =
        recipient.firstName?.trim() || defaultEmailDisplayName(shellLang);
      const vars = { firstName, year };
      const personalizedSubject = this.emailTemplates.interpolate(subject, vars, new Set());
      const personalizedBody = this.emailTemplates.interpolate(
        bodyHtml,
        vars,
        UsersService.MARKETING_TEMPLATE_ID,
      );
      const html = this.emailService.wrapInShell(shellLang, personalizedBody);

      try {
        await this.emailService.sendUserTransactionalEmail(
          recipient.email,
          personalizedSubject,
          html,
        );
        sent += 1;
      } catch (err: any) {
        const message = err?.message ? String(err.message) : 'Error desconocido';
        failed.push({ email: recipient.email, error: message });
        this.logger.error(`Fallo envío novedades a ${recipient.email}: ${message}`);
      }

      // Evitar saturar SMTP en envíos masivos.
      if (recipients.length > 1) {
        await new Promise((r) => setTimeout(r, 40));
      }
    }

    this.logger.log(
      `Newsletter novedades: audience=${dto.audience} total=${recipients.length} sent=${sent} failed=${failed.length}`,
    );

    return {
      audience: dto.audience,
      plan: dto.plan ?? null,
      total: recipients.length,
      sent,
      failed,
    };
  }

  private async resolveMarketingRecipients(
    dto: SendMarketingNewsletterDto,
  ): Promise<MarketingRecipient[]> {
    if (dto.audience === 'test') {
      const email = (dto.testEmail || '').trim().toLowerCase();
      if (!email) throw new BadRequestException('Indicá un email de prueba');
      const rows = await this.postgres.queryRaw<MarketingRecipient>(
        `SELECT u.id, u.email, u.first_name AS "firstName", u.preferred_language AS "preferredLanguage"
         FROM users u
         WHERE u.deleted_at IS NULL
           AND u.marketing_opt_in = true
           AND LOWER(u.email) = $1
         LIMIT 1`,
        [email],
      );
      if (!rows[0]) {
        throw new BadRequestException(
          'Ese email no está entre los suscriptores de novedades (o no existe)',
        );
      }
      return rows;
    }

    const params: any[] = [];
    let where =
      `u.deleted_at IS NULL AND u.marketing_opt_in = true AND u.is_active = true`;

    if (dto.audience === 'verified') {
      where += ` AND u.email_verified = true`;
    }

    if (dto.audience === 'plan') {
      const plan = dto.plan;
      if (!plan || !TENANT_PLAN_KEYS.includes(plan)) {
        throw new BadRequestException('Indicá un plan válido');
      }
      params.push(plan);
      where += ` AND t.plan = $${params.length}`;
    }

    return this.postgres.queryRaw<MarketingRecipient>(
      `SELECT u.id, u.email, u.first_name AS "firstName", u.preferred_language AS "preferredLanguage"
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id
       WHERE ${where}
       ORDER BY u.email ASC`,
      params,
    );
  }
}

