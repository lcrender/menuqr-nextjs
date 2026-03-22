/**
 * URL base del backend para el cliente (axios).
 * - Desarrollo: http://localhost:3001
 * - Producción Docker (recomendado): /api-proxy → Next.js hace proxy al backend (sin CORS)
 * - Producción directa: https://api.tudominio.com (requiere CORS_ORIGIN correcto en el backend)
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
