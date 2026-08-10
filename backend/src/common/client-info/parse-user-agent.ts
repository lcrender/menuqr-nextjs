export type ClientDeviceInfo = {
  deviceType: 'móvil' | 'tablet' | 'desktop' | 'desconocido';
  browser: string;
  os: string;
};

/** Parseo ligero de User-Agent (sin dependencias) para notificaciones admin. */
export function parseUserAgent(ua?: string | null): ClientDeviceInfo {
  const raw = (ua || '').trim();
  if (!raw) {
    return { deviceType: 'desconocido', browser: 'Desconocido', os: 'Desconocido' };
  }

  let deviceType: ClientDeviceInfo['deviceType'] = 'desktop';
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(raw)) {
    deviceType = 'tablet';
  } else if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(raw)) {
    deviceType = 'móvil';
  }

  let os = 'Desconocido';
  if (/windows nt/i.test(raw)) {
    os = 'Windows';
  } else if (/android/i.test(raw)) {
    const m = raw.match(/Android\s+([\d.]+)/i);
    os = m ? `Android ${m[1]}` : 'Android';
  } else if (/iphone|ipad|ipod/i.test(raw)) {
    const m = raw.match(/OS\s+([\d_]+)/i);
    os = m ? `iOS ${m[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/mac os x/i.test(raw)) {
    const m = raw.match(/Mac OS X\s+([\d_]+)/i);
    os = m ? `macOS ${m[1].replace(/_/g, '.')}` : 'macOS';
  } else if (/cros/i.test(raw)) {
    os = 'Chrome OS';
  } else if (/linux/i.test(raw)) {
    os = 'Linux';
  }

  let browser = 'Desconocido';
  if (/edg\//i.test(raw)) {
    const m = raw.match(/Edg\/([\d.]+)/i);
    browser = m ? `Edge ${m[1]}` : 'Edge';
  } else if (/opr\/|opera/i.test(raw)) {
    const m = raw.match(/(?:OPR|Opera)\/([\d.]+)/i);
    browser = m ? `Opera ${m[1]}` : 'Opera';
  } else if (/firefox\//i.test(raw)) {
    const m = raw.match(/Firefox\/([\d.]+)/i);
    browser = m ? `Firefox ${m[1]}` : 'Firefox';
  } else if (/chrome\//i.test(raw) && !/edg\//i.test(raw)) {
    const m = raw.match(/Chrome\/([\d.]+)/i);
    browser = m ? `Chrome ${m[1]}` : 'Chrome';
  } else if (/safari\//i.test(raw) && !/chrome|chromium|android/i.test(raw)) {
    const m = raw.match(/Version\/([\d.]+)/i);
    browser = m ? `Safari ${m[1]}` : 'Safari';
  }

  return { deviceType, browser, os };
}

/** Primer idioma preferido de Accept-Language (ej. "es-ES,es;q=0.9" → "es-ES"). */
export function parseAcceptLanguage(header?: string | null): string | null {
  if (!header?.trim()) return null;
  const first = header.split(',')[0]?.trim().split(';')[0]?.trim();
  return first || null;
}
