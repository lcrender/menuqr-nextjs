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
    const fromHeaders = this.getBestClientIpFromHeaders(headers);
    const candidateIp = fromHeaders || this.normalizeIp(clientIp);

    const cfCountry = headers['cf-ipcountry'] || headers['CF-IPCountry'];
    if (cfCountry && cfCountry !== 'XX' && cfCountry.length === 2) {
      return cfCountry.toUpperCase();
    }

    if (candidateIp && this.isPublicIp(candidateIp)) {
      try {
        const byIp = await this.getCountryFromIp(candidateIp);
        if (byIp) return byIp;
      } catch (e) {
        this.logger.warn(`Geo lookup failed for ${candidateIp}: ${e}`);
      }
    }

    // Fallback: idioma del navegador (ej. es-AR => AR). Útil cuando la IP no es pública (proxy/local).
    const byLanguage = this.getCountryFromAcceptLanguage(
      headers['accept-language'] || headers['Accept-Language'],
    );
    if (byLanguage) return byLanguage;

    return null;
  }

  private normalizeIp(ip: string | undefined): string | null {
    if (!ip) return null;
    const trimmed = ip.trim();
    if (!trimmed) return null;
    // Normaliza formato IPv6-mapped IPv4 (::ffff:1.2.3.4)
    if (trimmed.startsWith('::ffff:')) return trimmed.substring(7);
    return trimmed;
  }

  private getFirstHeader(headers: Record<string, string>, key: string): string | null {
    const v = headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()];
    if (!v || !v.trim()) return null;
    return v.trim();
  }

  private getBestClientIpFromHeaders(headers: Record<string, string>): string | null {
    // Prioridad típica detrás de CDN/proxy reverso
    const candidates: Array<string | null> = [
      this.getFirstHeader(headers, 'cf-connecting-ip'),
      this.getFirstHeader(headers, 'x-real-ip'),
    ];

    const xff = this.getFirstHeader(headers, 'x-forwarded-for');
    if (xff) {
      const parts = xff
        .split(',')
        .map((p) => this.normalizeIp(p))
        .filter((p): p is string => !!p);
      candidates.push(...parts);
    }

    for (const raw of candidates) {
      const ip = this.normalizeIp(raw || undefined);
      if (ip && this.isPublicIp(ip)) return ip;
    }

    // Si no hay pública, devolvemos la primera válida para intentar igualmente.
    for (const raw of candidates) {
      const ip = this.normalizeIp(raw || undefined);
      if (ip) return ip;
    }
    return null;
  }

  private getCountryFromAcceptLanguage(acceptLanguage?: string): string | null {
    if (!acceptLanguage) return null;
    // Ejemplos: "es-AR,es;q=0.9,en;q=0.8" / "en-US,en;q=0.5"
    const first = acceptLanguage.split(',')[0]?.trim();
    if (!first) return null;
    const locale = first.split(';')[0]?.trim();
    if (!locale) return null;
    const parts = locale.split('-');
    if (parts.length < 2) return null;
    const cc = parts[1]?.toUpperCase();
    if (cc && /^[A-Z]{2}$/.test(cc)) return cc;
    return null;
  }

  private isPublicIp(ip: string): boolean {
    const v = this.normalizeIp(ip) || ip;
    if (
      v === '127.0.0.1' ||
      v === '::1' ||
      v.startsWith('192.168.') ||
      v.startsWith('10.') ||
      v.startsWith('169.254.')
    ) {
      return false;
    }
    // 172.16.0.0/12
    const m172 = /^172\.(\d{1,3})\./.exec(v);
    if (m172 && m172[1]) {
      const n = Number(m172[1]);
      if (n >= 16 && n <= 31) return false;
    }
    // Link-local / unique-local IPv6
    const lower = v.toLowerCase();
    if (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) return false;
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
