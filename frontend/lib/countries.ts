/** Opciones de país (ISO) para formularios. Escalable: se puede mover a i18n o API. */
export const COUNTRY_OPTIONS = [
  { code: '', name: '— No especificado —' },
  { code: 'AR', name: 'Argentina' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'MX', name: 'México' },
  { code: 'ES', name: 'España' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
  { code: 'BR', name: 'Brasil' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panamá' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'CU', name: 'Cuba' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'CA', name: 'Canadá' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
].sort((a, b) => (!a.code ? -1 : !b.code ? 1 : (a.name || '').localeCompare(b.name || '')));

/** Valida código ISO de país (2 letras). */
export function isValidCountryCode(code: string): boolean {
  if (!code) return true;
  return /^[A-Z]{2}$/i.test(code);
}
