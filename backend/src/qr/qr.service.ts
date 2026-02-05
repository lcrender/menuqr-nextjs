import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class QRService {
  private readonly logger = new Logger(QRService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly postgres: PostgresService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  }

  /**
   * Genera o actualiza el QR code para un menú
   */
  async generateQRForMenu(menuId: string, restaurantSlug: string, menuSlug?: string): Promise<{ url: string; qrImageUrl: string; qrCodeId?: string }> {
    try {
      // Obtener el QR code existente para incluir su ID en la URL
      const existingQR = await this.postgres.queryRaw<any>(
        `SELECT id, url, qr_image_url 
         FROM qr_codes 
         WHERE menu_id = $1 AND is_active = true 
         LIMIT 1`,
        [menuId]
      );

      const qrCodeId = existingQR[0]?.id;
      
      // URL pública del menú con parámetros de tracking
      let menuUrl = `${this.frontendUrl}/r/${restaurantSlug}`;
      if (menuSlug) {
        menuUrl = `${this.frontendUrl}/r/${restaurantSlug}/${menuSlug}`;
      }
      // Agregar parámetros para tracking de QR
      menuUrl += `?qr=true${qrCodeId ? `&qrCodeId=${qrCodeId}` : ''}`;
      
      // Generar código QR como imagen base64
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Reutilizar existingQR ya consultado arriba para actualizar o insertar
      if (existingQR[0]) {
        // Actualizar QR existente
        await this.postgres.executeRaw(
          `UPDATE qr_codes 
           SET url = $1, qr_image_url = $2, updated_at = NOW() 
           WHERE id = $3`,
          [menuUrl, qrDataUrl, existingQR[0].id]
        );

        return {
          url: menuUrl,
          qrImageUrl: qrDataUrl,
        };
      } else {
        // Crear nuevo QR
        const qrId = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        await this.postgres.executeRaw(
          `INSERT INTO qr_codes (
            id, menu_id, url, qr_image_url, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
          [qrId, menuId, menuUrl, qrDataUrl]
        );

        return {
          url: menuUrl,
          qrImageUrl: qrDataUrl,
        };
      }
    } catch (error) {
      this.logger.error(`Error generando QR para menú ${menuId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el QR code de un menú
   */
  async getQRForMenu(menuId: string) {
    const result = await this.postgres.queryRaw<any>(
      `SELECT id, url, qr_image_url, is_active 
       FROM qr_codes 
       WHERE menu_id = $1 AND is_active = true 
       LIMIT 1`,
      [menuId]
    );

    return result[0] || null;
  }

  /**
   * Desactiva el QR code de un menú
   */
  async deactivateQR(menuId: string) {
    await this.postgres.executeRaw(
      `UPDATE qr_codes 
       SET is_active = false, updated_at = NOW() 
       WHERE menu_id = $1`,
      [menuId]
    );
  }
}

