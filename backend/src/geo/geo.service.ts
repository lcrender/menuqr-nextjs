import { Injectable, Logger } from '@nestjs/common';

/**
 * Servicio para obtener país a partir de IP (ej. al registrarse).
 * Usa header CF-IPCountry (Cloudflare) si existe, sino opcionalmente API externa.
 * Preparado para futuras extensiones (multi-país, MercadoPago por Argentina).
 */
@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  /**
   * Obtiene código de país (ISO 3166-1 alpha-2) desde headers o IP.
   * @param clientIp IP del cliente (ej. req.ip)
   * @param headers Headers de la request (ej. para CF-IPCountry)
   */
  async getCountryFromRequest(clientIp: string | undefined, headers: Record<string, string>): Promise<string | null> {
    const cfCountry = headers['cf-ipcountry'] || headers['CF-IPCountry'];
    if (cfCountry && cfCountry !== 'XX' && cfCountry.length === 2) {
      return cfCountry.toUpperCase();
    }
    if (clientIp && this.isPublicIp(clientIp)) {
      try {
        return await this.getCountryFromIp(clientIp);
      } catch (e) {
        this.logger.warn(`Geo lookup failed for ${clientIp}: ${e}`);
      }
    }
    return null;
  }

  private isPublicIp(ip: string): boolean {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return false;
    }
    return true;
  }

  /**
   * Consulta ip-api.com (gratis, sin key). Límite 45 req/min.
   */
  private async getCountryFromIp(ip: string): Promise<string | null> {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.countryCode || null;
  }
}
