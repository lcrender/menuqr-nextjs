import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { MinioService } from '../common/minio/minio.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly minio: MinioService,
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

  async uploadItemPhoto(
    tenantId: string,
    itemId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    try {
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

