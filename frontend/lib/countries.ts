/**
 * Países del selector. `name` es el valor canónico guardado en BD (español).
 * La UI muestra el nombre traducido vía `location.countries.{code}`.
 */
export type CountryOption = {
  code: string;
  name: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'MX', name: 'México' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Perú' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'ES', name: 'España' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'Nueva Zelanda' },
  { code: 'JP', name: 'Japón' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'RU', name: 'Rusia' },
  { code: 'ZA', name: 'Sudáfrica' },
  { code: 'EG', name: 'Egipto' },
  { code: 'MA', name: 'Marruecos' },
  { code: 'TR', name: 'Turquía' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'TH', name: 'Tailandia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Filipinas' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MY', name: 'Malasia' },
  { code: 'SG', name: 'Singapur' },
  { code: 'AE', name: 'Emiratos Árabes Unidos' },
  { code: 'SA', name: 'Arabia Saudí' },
  { code: 'IL', name: 'Israel' },
  { code: 'GR', name: 'Grecia' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'CH', name: 'Suiza' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Suecia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'PL', name: 'Polonia' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'HU', name: 'Hungría' },
  { code: 'RO', name: 'Rumania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croacia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IS', name: 'Islandia' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Chipre' },
];

export function findCountryOption(value: string | null | undefined): CountryOption | undefined {
  if (!value) return undefined;
  const v = value.trim();
  return COUNTRY_OPTIONS.find((c) => c.name === v || c.code === v);
}

export function getCountryFlag(code: string): string {
  const flagEmojis: { [key: string]: string } = {
    AR: '🇦🇷', BO: '🇧🇴', BR: '🇧🇷', CL: '🇨🇱', CO: '🇨🇴',
    CR: '🇨🇷', CU: '🇨🇺', DO: '🇩🇴', EC: '🇪🇨', SV: '🇸🇻',
    GT: '🇬🇹', HN: '🇭🇳', MX: '🇲🇽', NI: '🇳🇮', PA: '🇵🇦',
    PY: '🇵🇾', PE: '🇵🇪', PR: '🇵🇷', UY: '🇺🇾', VE: '🇻🇪',
    ES: '🇪🇸', US: '🇺🇸', CA: '🇨🇦', FR: '🇫🇷', IT: '🇮🇹',
    DE: '🇩🇪', GB: '🇬🇧', PT: '🇵🇹', AU: '🇦🇺', NZ: '🇳🇿',
    JP: '🇯🇵', CN: '🇨🇳', IN: '🇮🇳', RU: '🇷🇺', ZA: '🇿🇦',
    EG: '🇪🇬', MA: '🇲🇦', TR: '🇹🇷', KR: '🇰🇷', TH: '🇹🇭',
    ID: '🇮🇩', PH: '🇵🇭', VN: '🇻🇳', MY: '🇲🇾', SG: '🇸🇬',
    AE: '🇦🇪', SA: '🇸🇦', IL: '🇮🇱', GR: '🇬🇷', NL: '🇳🇱',
    BE: '🇧🇪', CH: '🇨🇭', AT: '🇦🇹', SE: '🇸🇪', NO: '🇳🇴',
    DK: '🇩🇰', FI: '🇫🇮', PL: '🇵🇱', CZ: '🇨🇿', HU: '🇭🇺',
    RO: '🇷🇴', BG: '🇧🇬', HR: '🇭🇷', RS: '🇷🇸', IE: '🇮🇪',
    IS: '🇮🇸', LU: '🇱🇺', MT: '🇲🇹', CY: '🇨🇾',
  };
  return flagEmojis[code] || '🌍';
}
