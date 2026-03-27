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
import { extname } from 'path';

/** Usuario JWT (req.user); tenantId puede ser null p. ej. SUPER_ADMIN */
type JwtUserPayload = { id: string; role: string; tenantId: string | null };
type MediaUploadResult = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

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

  /** Intenta optimizar a WebP; si falla, devuelve null para hacer fallback al original. */
  private async tryOptimizeToWebp(args: {
    inputBuffer: Buffer;
    width: number;
    height: number;
    maxBytes: number;
    fit?: 'cover' | 'contain' | 'inside' | 'outside' | 'fill';
  }): Promise<Buffer | null> {
    try {
      return await this.optimizeToWebp(args);
    } catch (err) {
      this.logger.warn('Sharp falló al optimizar; se subirá imagen original.', err as Error);
      return null;
    }
  }

  private getSafeExtension(file: Express.Multer.File): string {
    const fromName = extname(file.originalname || '').toLowerCase();
    if (fromName && /^[a-z0-9.]+$/.test(fromName)) return fromName;
    if (file.mimetype === 'image/png') return '.png';
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') return '.jpg';
    if (file.mimetype === 'image/webp') return '.webp';
    if (file.mimetype === 'image/gif') return '.gif';
    return '.bin';
  }

  private async uploadRestaurantAssetWithFallback(args: {
    file: Express.Multer.File;
    folder: string;
    optimizedWidth: number;
    optimizedHeight: number;
    optimizedMaxBytes: number;
    optimizedFilename: string;
  }): Promise<MediaUploadResult> {
    const optimized = await this.tryOptimizeToWebp({
      inputBuffer: args.file.buffer,
      width: args.optimizedWidth,
      height: args.optimizedHeight,
      maxBytes: args.optimizedMaxBytes,
      fit: 'cover',
    });

    if (optimized) {
      const uploaded = await this.minio.uploadBuffer(optimized, {
        folder: args.folder,
        filename: args.optimizedFilename,
        contentType: 'image/webp',
      });
      return {
        url: uploaded.url,
        filename: uploaded.filename,
        mimeType: 'image/webp',
        size: optimized.length,
      };
    }

    const ext = this.getSafeExtension(args.file);
    const uploadedOriginal = await this.minio.uploadBuffer(args.file.buffer, {
      folder: args.folder,
      filename: `original${ext}`,
      contentType: args.file.mimetype || 'application/octet-stream',
    });
    return {
      url: uploadedOriginal.url,
      filename: uploadedOriginal.filename,
      mimeType: args.file.mimetype || 'application/octet-stream',
      size: args.file.size ?? args.file.buffer.length,
    };
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
      const uploaded = await this.uploadRestaurantAssetWithFallback({
        file,
        folder: `restaurants/${restaurantId}`,
        optimizedWidth: 400,
        optimizedHeight: 400,
        optimizedMaxBytes: 1024 * 1024,
        optimizedFilename: 'logo.webp',
      });

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'image', $4, $5, $6, NOW(), NOW())`,
        [id, tenantId, uploaded.url, uploaded.filename, uploaded.mimeType, uploaded.size]
      );

      // Actualizar restaurante con la foto
      await this.postgres.executeRaw(
        `UPDATE restaurants 
         SET logo_url = $1, updated_at = NOW() 
         WHERE id = $2`,
        [uploaded.url, restaurantId]
      );

      return { id, url: uploaded.url };
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
      const uploaded = await this.uploadRestaurantAssetWithFallback({
        file,
        folder: `restaurants/${restaurantId}/cover`,
        optimizedWidth: 1200,
        optimizedHeight: 800,
        optimizedMaxBytes: 1024 * 1024,
        optimizedFilename: 'cover.webp',
      });

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'image', $4, $5, $6, NOW(), NOW())`,
        [id, tenantId, uploaded.url, uploaded.filename, uploaded.mimeType, uploaded.size]
      );

      // Actualizar restaurante con la foto de portada
      await this.postgres.executeRaw(
        `UPDATE restaurants 
         SET cover_url = $1, updated_at = NOW() 
         WHERE id = $2`,
        [uploaded.url, restaurantId]
      );

      return { id, url: uploaded.url };
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

      const optimized = await this.tryOptimizeToWebp({
        inputBuffer: file.buffer,
        width: 800,
        height: 800,
        maxBytes: 1024 * 1024,
        fit: 'cover',
      });
      const ext = this.getSafeExtension(file);
      const uploadPayload =
        optimized != null
          ? await this.minio.uploadBuffer(optimized, {
              folder: `items/${itemId}`,
              filename: 'product.webp',
              contentType: 'image/webp',
            })
          : await this.minio.uploadBuffer(file.buffer, {
              folder: `items/${itemId}`,
              filename: `original${ext}`,
              contentType: file.mimetype || 'application/octet-stream',
            });
      const mimeType = optimized != null ? 'image/webp' : file.mimetype || 'application/octet-stream';
      const mediaSize = optimized != null ? optimized.length : file.size ?? file.buffer.length;

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, item_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'image', $5, $6, $7, NOW(), NOW())`,
        [id, tenantId, itemId, uploadPayload.url, uploadPayload.filename, mimeType, mediaSize]
      );

      return { id, url: uploadPayload.url };
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

