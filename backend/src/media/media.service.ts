import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { MinioService } from '../common/minio/minio.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import sharp from 'sharp';

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

    // Seguridad: evitar que imágenes gigantes exploten memoria (sin confiar en el cliente)
    const base = sharp(inputBuffer, { limitInputPixels: 50_000_000 }).rotate(); // respeta EXIF orientation

    let quality = 86;
    let last: Buffer | null = null;

    while (quality >= 40) {
      const out = await base
        .resize(width, height, { fit })
        .webp({ quality, effort: 4 })
        .toBuffer();
      last = out;
      if (out.length <= maxBytes) return out;
      quality -= 6;
    }

    // Si no entra en el máximo, devolvemos lo último (igual ya viene muy comprimido y a tamaño fijo).
    return last || (await base.resize(width, height, { fit }).webp({ quality: 40, effort: 4 }).toBuffer());
  }

  async uploadRestaurantPhoto(
    tenantId: string,
    restaurantId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No se recibió la imagen. Si usás el cliente HTTP, no fijes Content-Type en FormData: debe incluir el boundary.',
      );
    }
    try {
      // Optimizar y subir archivo a MinIO (guardamos solo la versión liviana)
      const optimized = await this.optimizeToWebp({
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
      this.logger.error('Error subiendo foto de restaurante:', error);
      throw error;
    }
  }

  async uploadRestaurantCover(
    tenantId: string,
    restaurantId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No se recibió la imagen. Si usás el cliente HTTP, no fijes Content-Type en FormData: debe incluir el boundary.',
      );
    }
    try {
      // Optimizar y subir archivo a MinIO (guardamos solo la versión liviana)
      const optimized = await this.optimizeToWebp({
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
    tenantId: string,
    itemId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    await this.assertProductPhotosAllowed(tenantId);
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No se recibió la imagen. Si usás el cliente HTTP, no fijes Content-Type en FormData: debe incluir el boundary.',
      );
    }
    try {
      // Un producto tiene solo una imagen: borrar la anterior (archivo + BD) antes de subir la nueva
      await this.deleteItemPhotos(tenantId, itemId);

      // Optimizar y subir archivo a MinIO (guardamos solo la versión liviana)
      const optimized = await this.optimizeToWebp({
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
      this.logger.error('Error subiendo foto de item:', error);
      throw error;
    }
  }

  /** Elimina la foto del producto (una por producto). Borra archivo en MinIO y registro en BD. */
  async deleteItemPhoto(tenantId: string, itemId: string): Promise<void> {
    await this.deleteItemPhotos(tenantId, itemId);
  }

  async deleteMedia(id: string, tenantId: string): Promise<void> {
    try {
      const media = await this.postgres.queryRaw<any>(
        `SELECT filename FROM media_assets WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
        [id, tenantId]
      );

      if (media[0]) {
        await this.minio.deleteFile(media[0].filename);
      }

      await this.postgres.executeRaw(
        `UPDATE media_assets SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );
    } catch (error) {
      this.logger.error(`Error eliminando media ${id}:`, error);
      throw error;
    }
  }
}

