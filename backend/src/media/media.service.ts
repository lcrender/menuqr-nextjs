import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { MinioService } from '../common/minio/minio.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly minio: MinioService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async uploadRestaurantPhoto(
    tenantId: string,
    restaurantId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    try {
      // Subir archivo a MinIO
      const { url, filename } = await this.minio.uploadFile(file, `restaurants/${restaurantId}`);

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'image', $4, $5, $6, NOW(), NOW())`,
        [id, tenantId, url, filename, file.mimetype, file.size]
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
    try {
      // Subir archivo a MinIO
      const { url, filename } = await this.minio.uploadFile(file, `restaurants/${restaurantId}/cover`);

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'image', $4, $5, $6, NOW(), NOW())`,
        [id, tenantId, url, filename, file.mimetype, file.size]
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
    try {
      // Un producto tiene solo una imagen: borrar la anterior (archivo + BD) antes de subir la nueva
      await this.deleteItemPhotos(tenantId, itemId);

      // Subir archivo a MinIO
      const { url, filename } = await this.minio.uploadFile(file, `items/${itemId}`);

      // Guardar en base de datos
      const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      await this.postgres.executeRaw(
        `INSERT INTO media_assets (
          id, tenant_id, item_id, url, kind, filename, mime_type, size,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'image', $5, $6, $7, NOW(), NOW())`,
        [id, tenantId, itemId, url, filename, file.mimetype, file.size]
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

