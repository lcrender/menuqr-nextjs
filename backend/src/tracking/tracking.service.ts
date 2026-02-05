import { Injectable } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

@Injectable()
export class TrackingService {
  constructor(private readonly postgres: PostgresService) {}

  /**
   * Devuelve vistas de menú y escaneos QR por restaurante.
   * Si las tablas menu_views/qr_scans no existen, devuelve { menuViews: 0, qrScans: 0 }.
   */
  async getDashboardStats(restaurantId: string): Promise<{ menuViews: number; qrScans: number }> {
    try {
      const [viewsResult, scansResult] = await Promise.all([
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM menu_views WHERE restaurant_id = $1`,
          [restaurantId],
        ),
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*)::text as count FROM qr_scans WHERE restaurant_id = $1`,
          [restaurantId],
        ),
      ]);
      const menuViews = parseInt(viewsResult[0]?.count ?? '0', 10);
      const qrScans = parseInt(scansResult[0]?.count ?? '0', 10);
      return { menuViews, qrScans };
    } catch {
      return { menuViews: 0, qrScans: 0 };
    }
  }
}
