/**
 * URL base del backend para el cliente (axios).
 * - Desarrollo: http://localhost:3001
 * - Producción Docker (recomendado): /api-proxy → Next.js hace proxy al backend (sin CORS)
 * - Producción directa: https://api.tudominio.com (requiere CORS_ORIGIN correcto en el backend)
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Base URL para llamar a la API desde el navegador (axios, fetch).
 * Si la página es HTTPS (p. ej. ngrok) y NEXT_PUBLIC_API_URL apunta a http://localhost,
 * el navegador bloquea mixed content; usamos el proxy de Next (/api-proxy).
 */
export function getApiBaseUrl(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
  if (env.startsWith('/')) {
    return env;
  }
  if (typeof window === 'undefined') {
    return env;
  }
  // Página HTTPS (ngrok, etc.): cualquier API en HTTP desde el bundle (localhost, host.docker, nombre Docker)
  // provoca mixed content o host inexistente en el navegador → mismo origen vía proxy de Next.
  if (window.location.protocol === 'https:') {
    try {
      const u = new URL(env);
      if (u.protocol === 'http:') {
        return '/api-proxy';
      }
    } catch {
      /* ignore */
    }
  }
  return env;
}

/**
 * Origen público del sitio (URLs de retorno de checkout). Debe alinearse con FRONTEND_URL en el backend.
 * En el cliente, si no hay variable de entorno, se usa window.location.origin.
 */
export function getPublicAppOrigin(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
