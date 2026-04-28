import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, SupportTicketStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../common/database/prisma.service';
import { EmailService } from '../common/email/email.service';
import { MinioService } from '../common/minio/minio.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto';

export type PublicTicketStatus = 'open' | 'in_progress' | 'closed';

export interface AdminTicketListFilters {
  status?: PublicTicketStatus;
  userEmail?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

const IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/pjpeg']);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Injectable()
export class SupportTicketsService {
  private readonly logger = new Logger(SupportTicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly minio: MinioService,
  ) {}

  private mapStatus(s: SupportTicketStatus): PublicTicketStatus {
    return s as PublicTicketStatus;
  }

  private rethrowPrismaIfMissingSchema(e: unknown): void {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        e.code === 'P2021' ||
        e.code === 'P2022' ||
        e.code === 'P2010' ||
        e.message?.includes('support_tickets') ||
        e.message?.includes('attachment_urls')
      ) {
        this.logger.error(`Prisma (tickets): ${e.code} — ${e.message}`);
        throw new ServiceUnavailableException(
          'Las tablas de tickets no están en la base de datos o el cliente Prisma está desactualizado. En el servidor ejecutá: npx prisma migrate deploy y redeploy del backend con build que incluya prisma generate.',
        );
      }
    }
  }

  private normalizeAttachmentUrls(raw: unknown): string[] {
    if (raw == null) return [];
    if (!Array.isArray(raw)) return [];
    return raw.filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length <= 2048);
  }

  private assertAttachmentUrlsForUser(userId: string, urls: string[]): string[] {
    if (urls.length > 5) throw new BadRequestException('Máximo 5 imágenes por ticket.');
    const needle = `/support-tickets/${userId}/`;
    for (const u of urls) {
      try {
        const parsed = new URL(u);
        if (!parsed.href.includes(needle)) {
          throw new BadRequestException('Una o más URLs de adjuntos no son válidas para tu usuario.');
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        throw new BadRequestException('URL de adjunto inválida.');
      }
    }
    return urls;
  }

  private async resolveAdminNotificationEmail(): Promise<string | null> {
    const explicit = (this.config.get<string>('SUPPORT_TICKETS_ADMIN_EMAIL') || '').trim();
    if (explicit) return explicit;
    const contact = (this.config.get<string>('CONTACT_FORM_RECEIVER_EMAIL') || '').trim();
    if (contact) return contact;
    const u = await this.prisma.user.findFirst({
      where: { role: UserRole.SUPER_ADMIN, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { email: true },
    });
    return u?.email?.trim() || null;
  }

  private async notifyNewTicket(params: {
    ticketNumber: number;
    subject: string;
    message: string;
    authorEmail: string;
    authorName: string;
    attachmentUrls: string[];
  }): Promise<void> {
    const to = await this.resolveAdminNotificationEmail();
    if (!to) {
      this.logger.warn(
        'No hay email destino para tickets (SUPPORT_TICKETS_ADMIN_EMAIL, CONTACT_FORM_RECEIVER_EMAIL o usuario SUPER_ADMIN).',
      );
      return;
    }
    const adminUrl = `${this.config.get<string>('FRONTEND_URL', 'http://localhost:3000')}/admin/config/support-tickets`;
    const subject = `[AppMenuQR] Nuevo ticket #${params.ticketNumber} — ${params.subject.slice(0, 80)}`;
    const imgs =
      params.attachmentUrls.length > 0
        ? `<p><strong>Adjuntos:</strong></p><ul>${params.attachmentUrls
            .map((u) => `<li><a href="${escapeHtml(u)}">Ver imagen</a></li>`)
            .join('')}</ul>`
        : '';
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-top:0;">Nuevo ticket de soporte</h2>
        <p><strong>Número:</strong> #${params.ticketNumber}</p>
        <p><strong>Usuario:</strong> ${escapeHtml(params.authorName)} (${escapeHtml(params.authorEmail)})</p>
        <p><strong>Asunto:</strong> ${escapeHtml(params.subject)}</p>
        <p><strong>Mensaje inicial:</strong></p>
        <pre style="white-space: pre-wrap; background:#f3f4f6; padding:12px; border-radius:8px;">${escapeHtml(
          params.message,
        )}</pre>
        ${imgs}
        <p><a href="${escapeHtml(adminUrl)}">Abrir panel de tickets</a></p>
      </body>
      </html>
    `;
    try {
      await this.emailService.sendAdminNotificationEmail(to, subject, html);
    } catch (e) {
      this.logger.error(`Error enviando notificación de ticket #${params.ticketNumber}: ${e}`);
    }
  }

  async uploadAttachment(userId: string, file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No se recibió la imagen. Si usás multipart, el campo debe llamarse "file".',
      );
    }
    const mime = (file.mimetype || '').toLowerCase();
    if (!IMAGE_MIME.has(mime)) {
      throw new BadRequestException('Solo se permiten imágenes JPEG o PNG.');
    }
    const ext = mime === 'image/png' ? '.png' : '.jpg';
    const folder = `support-tickets/${userId}`;
    const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    try {
      return await this.minio.uploadBuffer(file.buffer, {
        folder,
        filename,
        contentType: mime === 'image/png' ? 'image/png' : 'image/jpeg',
      });
    } catch (e) {
      this.logger.error(`MinIO upload ticket attachment: ${e}`);
      throw new ServiceUnavailableException('No se pudo subir la imagen al almacenamiento. Revisá MinIO.');
    }
  }

  async create(authorUserId: string, authorRole: UserRole, dto: CreateSupportTicketDto) {
    const subject = dto.subject.trim();
    const message = dto.message.trim();
    const rawUrls = dto.attachmentUrls?.length ? dto.attachmentUrls.map((u) => u.trim()).filter(Boolean) : [];
    const attachmentUrls = this.assertAttachmentUrlsForUser(authorUserId, rawUrls);

    const user = await this.prisma.user.findFirst({
      where: { id: authorUserId, deletedAt: null },
      select: { email: true, firstName: true, lastName: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const roleStr = String(authorRole);
    let ticket: Awaited<ReturnType<typeof this.prisma.supportTicket.create>>;
    try {
      ticket = await this.prisma.$transaction(async (tx) => {
        const t = await tx.supportTicket.create({
          data: {
            userId: authorUserId,
            subject,
            message,
            attachmentUrls: attachmentUrls as unknown as Prisma.InputJsonValue,
            status: SupportTicketStatus.open,
            lastReplyAt: new Date(),
            lastReplyByRole: roleStr,
          },
        });
        await tx.supportTicketMessage.create({
          data: {
            ticketId: t.id,
            authorUserId,
            authorRole,
            message,
          },
        });
        return t;
      });
    } catch (e) {
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }

    const authorName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
    void this.notifyNewTicket({
      ticketNumber: ticket.ticketNumber,
      subject,
      message,
      authorEmail: user.email,
      authorName,
      attachmentUrls,
    });

    return this.serializeTicketSummary(ticket);
  }

  async listMine(userId: string, limit = 50, offset = 0) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = Math.max(offset, 0);
    try {
      const [rows, total] = await Promise.all([
        this.prisma.supportTicket.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take,
          skip,
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            lastReplyAt: true,
            attachmentUrls: true,
          },
        }),
        this.prisma.supportTicket.count({ where: { userId } }),
      ]);
      return {
        items: rows.map((r) => ({
          id: r.id,
          ticketNumber: r.ticketNumber,
          subject: r.subject,
          status: this.mapStatus(r.status),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          lastReplyAt: r.lastReplyAt?.toISOString() ?? null,
          attachmentUrls: this.normalizeAttachmentUrls(r.attachmentUrls),
        })),
        total,
      };
    } catch (e) {
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }
  }

  async getMine(userId: string, ticketId: string) {
    try {
      const ticket = await this.prisma.supportTicket.findFirst({
        where: { id: ticketId, userId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
      if (!ticket) throw new NotFoundException('Ticket no encontrado');
      return this.serializeTicketDetail(ticket, false);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }
  }

  async replyMine(userId: string, authorRole: UserRole, ticketId: string, dto: ReplySupportTicketDto) {
    const text = dto.message.trim();
    const roleStr = String(authorRole);
    try {
      const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, userId } });
      if (!ticket) throw new NotFoundException('Ticket no encontrado');
      if (ticket.status === SupportTicketStatus.closed) {
        throw new BadRequestException('El ticket está cerrado. No se pueden agregar mensajes.');
      }
      await this.prisma.$transaction([
        this.prisma.supportTicketMessage.create({
          data: { ticketId, authorUserId: userId, authorRole, message: text },
        }),
        this.prisma.supportTicket.update({
          where: { id: ticketId },
          data: { lastReplyAt: new Date(), lastReplyByRole: roleStr },
        }),
      ]);
      return this.getMine(userId, ticketId);
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) throw e;
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }
  }

  async listAdmin(filters: AdminTicketListFilters) {
    const take = Math.min(Math.max(filters.limit ?? 50, 1), 200);
    const skip = Math.max(filters.offset ?? 0, 0);

    const where: Prisma.SupportTicketWhereInput = {};
    if (filters.status) {
      where.status = filters.status as SupportTicketStatus;
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }
    if (filters.userEmail?.trim()) {
      const term = filters.userEmail.trim();
      where.user = { email: { contains: term, mode: 'insensitive' } };
    }

    try {
      const [rows, total] = await Promise.all([
        this.prisma.supportTicket.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take,
          skip,
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
          },
        }),
        this.prisma.supportTicket.count({ where }),
      ]);

      return {
        items: rows.map((t) => ({
          id: t.id,
          ticketNumber: t.ticketNumber,
          subject: t.subject,
          status: this.mapStatus(t.status),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          lastReplyAt: t.lastReplyAt?.toISOString() ?? null,
          attachmentCount: this.normalizeAttachmentUrls(t.attachmentUrls).length,
          user: t.user,
        })),
        total,
      };
    } catch (e) {
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }
  }

  async getAdmin(ticketId: string) {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
          user: {
            include: {
              tenant: { select: { id: true, name: true, plan: true, status: true } },
              subscriptions: {
                orderBy: { updatedAt: 'desc' },
                take: 10,
                select: {
                  id: true,
                  paymentProvider: true,
                  status: true,
                  planType: true,
                  subscriptionPlan: true,
                  currentPeriodEnd: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      });
      if (!ticket) throw new NotFoundException('Ticket no encontrado');
      return this.serializeTicketDetail(ticket, true);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }
  }

  async replyAdmin(adminUserId: string, adminRole: UserRole, ticketId: string, dto: ReplySupportTicketDto) {
    if (adminRole !== UserRole.SUPER_ADMIN) throw new ForbiddenException();
    const text = dto.message.trim();
    const roleStr = String(adminRole);
    try {
      const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) throw new NotFoundException('Ticket no encontrado');
      if (ticket.status === SupportTicketStatus.closed) {
        throw new BadRequestException('El ticket está cerrado. Cambiá el estado para reabrirlo antes de responder.');
      }
      await this.prisma.$transaction([
        this.prisma.supportTicketMessage.create({
          data: { ticketId, authorUserId: adminUserId, authorRole: adminRole, message: text },
        }),
        this.prisma.supportTicket.update({
          where: { id: ticketId },
          data: { lastReplyAt: new Date(), lastReplyByRole: roleStr },
        }),
      ]);
      return this.getAdmin(ticketId);
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException || e instanceof ForbiddenException) throw e;
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }
  }

  async updateStatusAdmin(
    adminRole: UserRole,
    ticketId: string,
    status: PublicTicketStatus,
  ) {
    if (adminRole !== UserRole.SUPER_ADMIN) throw new ForbiddenException();
    try {
      const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) throw new NotFoundException('Ticket no encontrado');

      const next = status as SupportTicketStatus;
      const closedAt = next === SupportTicketStatus.closed ? new Date() : null;

      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: next,
          closedAt,
        },
      });
      return this.getAdmin(ticketId);
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof ForbiddenException) throw e;
      this.rethrowPrismaIfMissingSchema(e);
      throw e;
    }
  }

  private serializeTicketSummary(t: {
    id: string;
    ticketNumber: number;
    subject: string;
    status: SupportTicketStatus;
    createdAt: Date;
    updatedAt: Date;
    lastReplyAt: Date | null;
    attachmentUrls?: unknown;
  }) {
    return {
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      status: this.mapStatus(t.status),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      lastReplyAt: t.lastReplyAt?.toISOString() ?? null,
      attachmentUrls: this.normalizeAttachmentUrls(t.attachmentUrls),
    };
  }

  private serializeTicketDetail(ticket: any, admin: boolean) {
    const attachmentUrls = this.normalizeAttachmentUrls(ticket.attachmentUrls);
    const base = {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      initialMessage: ticket.message,
      attachmentUrls,
      status: this.mapStatus(ticket.status),
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      closedAt: ticket.closedAt?.toISOString() ?? null,
      lastReplyAt: ticket.lastReplyAt?.toISOString() ?? null,
      lastReplyByRole: ticket.lastReplyByRole,
      messages: ticket.messages.map((m) => ({
        id: m.id,
        authorUserId: m.authorUserId,
        authorRole: m.authorRole,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      })),
    };

    if (!admin || !ticket.user) return base;

    const u = ticket.user;

    const tenantPlan = u.tenant?.plan ?? null;
    const primarySub = u.subscriptions?.[0] ?? null;

    return {
      ...base,
      user: {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        tenant: u.tenant
          ? { id: u.tenant.id, name: u.tenant.name, plan: u.tenant.plan, status: u.tenant.status }
          : null,
        tenantPlan,
        subscriptions: (u.subscriptions || []).map((s) => ({
          id: s.id,
          paymentProvider: s.paymentProvider,
          status: s.status,
          planType: s.planType,
          subscriptionPlan: s.subscriptionPlan,
          currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
          updatedAt: s.updatedAt.toISOString(),
        })),
        effectivePlan: tenantPlan ?? primarySub?.subscriptionPlan ?? null,
      },
    };
  }
}
