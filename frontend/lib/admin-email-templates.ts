/**
 * Tipos y helpers del módulo de plantillas de email del panel.
 * El catálogo y el contenido vienen de `GET /admin/email-templates`.
 */

export type EmailTemplateCategory =
  | 'auth'
  | 'billing_user'
  | 'billing_admin'
  | 'promo'
  | 'support'
  | 'public'
  | 'admin_messages';

export type EmailTemplateLang = 'es' | 'en';

export type EmailTemplateCategoryMeta = {
  id: EmailTemplateCategory;
  label: string;
  description: string;
};

export type EmailTemplateVariable = {
  key: string;
  description: string;
  sample: string;
  allowHtml?: boolean;
};

export type EmailTemplateLocaleContent = {
  subject: string;
  bodyHtml: string;
};

export type EmailTemplateSummary = {
  id: string;
  category: EmailTemplateCategory;
  name: string;
  when: string;
  recipient: string;
  note: string | null;
  locales: EmailTemplateLang[];
  hasOverride: boolean;
  sendUsesOverride: boolean;
  wrapInShell: boolean;
  variableKeys: string[];
};

export type EmailTemplateListResponse = {
  categories: EmailTemplateCategoryMeta[];
  templates: EmailTemplateSummary[];
};

export type EmailTemplateDetail = {
  id: string;
  category: EmailTemplateCategory;
  name: string;
  when: string;
  recipient: string;
  note: string | null;
  wrapInShell: boolean;
  sendUsesOverride: boolean;
  locales: EmailTemplateLang[];
  variables: EmailTemplateVariable[];
  defaults: Partial<Record<EmailTemplateLang, EmailTemplateLocaleContent>>;
  content: Record<string, EmailTemplateLocaleContent & { isOverridden: boolean }>;
  isOverridden: boolean;
};

export function emailLocaleLabel(locales: EmailTemplateLang[]): string {
  return locales.length > 1 ? 'ES / EN' : 'Solo ES';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Misma lógica que EmailTemplatesService.interpolate, para la vista previa. */
export function interpolateWithSamples(
  template: string,
  variables: EmailTemplateVariable[],
): string {
  const byKey = new Map(variables.map((v) => [v.key, v]));
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const variable = byKey.get(key);
    if (!variable) return match;
    return variable.allowHtml ? variable.sample : escapeHtml(variable.sample);
  });
}

/** Envoltorio equivalente al `emailShell` del backend, para previsualizar. */
export function wrapPreviewShell(lang: EmailTemplateLang, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; font-weight: 700; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; }
    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">AppMenuQR</div>
    ${contentHtml}
  </div>
</body>
</html>`;
}

export function buildPreviewDocument(params: {
  lang: EmailTemplateLang;
  bodyHtml: string;
  variables: EmailTemplateVariable[];
  wrapInShell: boolean;
}): string {
  const body = interpolateWithSamples(params.bodyHtml, params.variables);
  if (params.wrapInShell) return wrapPreviewShell(params.lang, body);
  return `<!DOCTYPE html>
<html lang="${params.lang}">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 16px; background: #f8fafc;">
  <div style="max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
    ${body}
  </div>
</body>
</html>`;
}
