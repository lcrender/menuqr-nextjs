import {
  Injectable,
  Logger,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { MinioService } from '../common/minio/minio.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import sharp from 'sharp';

/** Usuario JWT (req.user); tenantId puede ser null p. ej. SUPER_ADMIN */
type JwtUserPayload = { id: string; role: string; tenantId: string | null };

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly minio: MinioService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  private async optimizeToWebp(args: {
    inputBuffer: Buffer;
    width: number;
    height: number;
    maxBytes: number;
    fit?: 'cover' | 'contain' | 'inside' | 'outside' | 'fill';
  }): Promise<Buffer> {
    const { inputBuffer, width, height, maxBytes, fit = 'cover' } = args;

    // Cada pipeline debe usar un sharp() nuevo: una instancia solo puede ejecutarse una vez (toBuffer).
    // animated: false evita edge cases con GIF/WebP multipágina; JPEG/PNG no se ven afectados.
    const pipeline = () =>
      sharp(inputBuffer, { limitInputPixels: 50_000_000, animated: false }).rotate();

    let quality = 86;
    let last: Buffer | null = null;

    while (quality >= 40) {
      const out = await pipeline()
        .resize(width, height, { fit })
        .webp({ quality, effort: 4 })
        .toBuffer();
      last = out;
      if (out.length <= maxBytes) return out;
      quality -= 6;
    }

    return last ?? (await pipeline().resize(width, height, { fit }).webp({ quality: 40, effort: 4 }).toBuffer());
  }

  /** Convierte fallos de Sharp en 400 con log del error real (MinIO/BD no pasan por aquí). */
  private async optimizeToWebpOrBadRequest(args: {
    inputBuffer: Buffer;
    width: number;
    height: number;
    maxBytes: number;
    fit?: 'cover' | 'contain' | 'inside' | 'outside' | 'fill';
  }): Promise<Buffer> {
    try {
      return await this.optimizeToWebp(args);
    } catch (err) {
      this.logger.error('Sharp / optimización WebP:', err);
      throw new BadRequestException(
        'No se pudo procesar la imagen. Usá JPG o PNG; si ya lo es, probá otra exportación o foto más liviana.',
      );
    }
  }

  /** tenant_id real del restaurante (multipart no trae tenantId en body para SUPER_ADMIN). */
  private async getRestaurantTenantIdOrThrow(restaurantId: string): Promise<string> {
    const rows = await this.postgres.queryRaw<{ tenant_id: string }>(
      `SELECT tenant_id FROM restaurants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [restaurantId],
    );
    if (!rows?.length) {
      throw new NotFoundException('Restaurante no encontrado');
    }
    return rows[0].tenant_id;
  }

  private assertTenantAccess(user: JwtUserPayload, tenantId: string): void {
    if (user.role === 'ADMIN') {
      if (!user.tenantId || user.tenantId !== tenantId) {
        throw new ForbiddenException('No tenés permiso para subir archivos a este restaurante');
      }
    }
  }

  /** tenant_id del producto (menu_item). */
  private async getMenuItemTenantIdOrThrow(itemId: string): Promise<string> {
    const rows = await this.postgres.queryRaw<{ tenant_id: string }>(
      `SELECT tenant_id FROM menu_items WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [itemId],
    );
    if (!rows?.length) {
      throw new NotFoundException('Producto no encontrado');
    }
    return rows[0].tenant_id;
  }

  async uploadRestaurantPhoto(
    user: JwtUserPayload,
    restaurantId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No se recibió la imagen. Si usás el cliente HTTP, no fijes Content-Type en FormData: debe incluir el boundary.',
      );
    }
    const tenantId = await this.getRestaurantTenantIdOrThrow(restaurantId);
    this.assertTenantAccess(user, tenantId);
    try {
      const optimized = await this.optimizeToWebpOrBadRequest({
        inputBuffer: file.buffer,
        width: 400,
        height: 400,
        maxBytes: 300 * 1024,
        fit: 'cover',
      });
      const { url, filename } = await this.minio.uploadBuffer(optimized, {
        folder: `restaurants/${restaurantId}`,
        filename: 'logo.webp',
        contentType: 'image/webp',
      });

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'image', $4, $5, $6, NOW(), NOW())`,
        [id, tenantId, url, filename, 'image/webp', optimized.length]
      );

      // Actualizar restaurante con la foto
      await this.postgres.executeRaw(
        `UPDATE restaurants 
         SET logo_url = $1, updated_at = NOW() 
         WHERE id = $2`,
        [url, restaurantId]
      );

      return { id, url };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error subiendo foto de restaurante:', error);
      throw error;
    }
  }

  async uploadRestaurantCover(
    user: JwtUserPayload,
    restaurantId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No se recibió la imagen. Si usás el cliente HTTP, no fijes Content-Type en FormData: debe incluir el boundary.',
      );
    }
    const tenantId = await this.getRestaurantTenantIdOrThrow(restaurantId);
    this.assertTenantAccess(user, tenantId);
    try {
      const optimized = await this.optimizeToWebpOrBadRequest({
        inputBuffer: file.buffer,
        width: 1200,
        height: 800,
        maxBytes: 600 * 1024,
        fit: 'cover',
      });
      const { url, filename } = await this.minio.uploadBuffer(optimized, {
        folder: `restaurants/${restaurantId}/cover`,
        filename: 'cover.webp',
        contentType: 'image/webp',
      });

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'image', $4, $5, $6, NOW(), NOW())`,
        [id, tenantId, url, filename, 'image/webp', optimized.length]
      );

      // Actualizar restaurante con la foto de portada
      await this.postgres.executeRaw(
        `UPDATE restaurants 
         SET cover_url = $1, updated_at = NOW() 
         WHERE id = $2`,
        [url, restaurantId]
      );

      return { id, url };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error subiendo foto de portada de restaurante:', error);
      throw error;
    }
  }

  /** Según límites efectivos del plan (BD override o defaults). */
  private async assertProductPhotosAllowed(tenantId: string): Promise<void> {
    const tenant = await this.postgres.queryRaw<any>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId]
    );
    const plan = tenant[0]?.plan || 'free';
    if (!(await this.planLimits.allowsProductPhotos(plan))) {
      throw new ForbiddenException(
        'La carga de fotos de productos no está incluida en tu plan. Actualizá el plan para habilitarla.',
      );
    }
  }

  /** Elimina todas las fotos existentes del producto (MinIO + BD). Un producto tiene solo una imagen. */
  private async deleteItemPhotos(tenantId: string, itemId: string): Promise<void> {
    const existing = await this.postgres.queryRaw<{ id: string; filename: string }>(
      `SELECT id, filename FROM media_assets WHERE item_id = $1 AND tenant_id = $2 AND kind = 'image' AND deleted_at IS NULL`,
      [itemId, tenantId]
    );
    for (const row of existing) {
      try {
        await this.minio.deleteFile(row.filename);
      } catch (e) {
        this.logger.warn(`No se pudo borrar archivo MinIO ${row.filename}:`, e);
      }
      await this.postgres.executeRaw(
        `UPDATE media_assets SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
        [row.id, tenantId]
      );
    }
  }

  async uploadItemPhoto(
    user: JwtUserPayload,
    itemId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    const tenantId = await this.getMenuItemTenantIdOrThrow(itemId);
    this.assertTenantAccess(user, tenantId);
    await this.assertProductPhotosAllowed(tenantId);
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No se recibió la imagen. Si usás el cliente HTTP, no fijes Content-Type en FormData: debe incluir el boundary.',
      );
    }
    try {
      // Un producto tiene solo una imagen: borrar la anterior (archivo + BD) antes de subir la nueva
      await this.deleteItemPhotos(tenantId, itemId);

      const optimized = await this.optimizeToWebpOrBadRequest({
        inputBuffer: file.buffer,
        width: 800,
        height: 800,
        maxBytes: 250 * 1024,
        fit: 'cover',
      });
      const { url, filename } = await this.minio.uploadBuffer(optimized, {
        folder: `items/${itemId}`,
        filename: 'product.webp',
        contentType: 'image/webp',
      });

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, item_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'image', $5, $6, $7, NOW(), NOW())`,
        [id, tenantId, itemId, url, filename, 'image/webp', optimized.length]
      );

      return { id, url };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error subiendo foto de item:', error);
      throw error;
    }
  }

  /** Elimina la foto del producto (una por producto). Borra archivo en MinIO y registro en BD. */
  async deleteItemPhoto(user: JwtUserPayload, itemId: string): Promise<void> {
    const tenantId = await this.getMenuItemTenantIdOrThrow(itemId);
    this.assertTenantAccess(user, tenantId);
    await this.deleteItemPhotos(tenantId, itemId);
  }

  async deleteMedia(user: JwtUserPayload, id: string): Promise<void> {
    try {
      const rows = await this.postgres.queryRaw<{ filename: string; tenant_id: string }>(
        `SELECT filename, tenant_id FROM media_assets WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      if (!rows?.length) {
        throw new NotFoundException('Archivo no encontrado');
      }
      const { filename, tenant_id: tenantId } = rows[0];
      this.assertTenantAccess(user, tenantId);

      try {
        await this.minio.deleteFile(filename);
      } catch (e) {
        this.logger.warn(`No se pudo borrar archivo MinIO ${filename}:`, e);
      }

      await this.postgres.executeRaw(
        `UPDATE media_assets SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId],
      );
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error eliminando media ${id}:`, error);
      throw error;
    }
  }
}

