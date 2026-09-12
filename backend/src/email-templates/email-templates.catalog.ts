/**
 * Catálogo de plantillas de email del sistema.
 *
 * Cada definición trae el contenido por defecto (el mismo que hoy vive en el
 * código de cada servicio) y las variables `{{x}}` que el panel puede usar.
 * Los overrides que guarda el SUPER_ADMIN se persisten en `app_settings`
 * (ver EmailTemplatesService); este archivo es la fuente de los defaults.
 */

export type EmailTemplateCategory =
  | 'auth'
  | 'billing_user'
  | 'billing_admin'
  | 'promo'
  | 'support'
  | 'public'
  | 'admin_messages';

export type EmailTemplateVariable = {
  key: string;
  description: string;
  sample: string;
  /** Si true, no se escapa HTML al interpolar (para {{introHtml}}, {{featuresHtml}}, etc.) */
  allowHtml?: boolean;
};

export type EmailTemplateLocaleContent = { subject: string; bodyHtml: string };

export type EmailTemplateDefinition = {
  id: string;
  category: EmailTemplateCategory;
  name: string;
  when: string;
  recipient: string;
  /** true = EmailService envuelve con emailShell + brand */
  wrapInShell: boolean;
  /** Si false, la UI edita pero el envío aún no lee override (mostrar aviso) */
  sendUsesOverride: boolean;
  /** Aclaración opcional para el panel. */
  note?: string;
  variables: EmailTemplateVariable[];
  defaults: {
    es: EmailTemplateLocaleContent;
    en?: EmailTemplateLocaleContent;
  };
};

export const EMAIL_TEMPLATE_CATEGORIES: Array<{
  id: EmailTemplateCategory;
  label: string;
  description: string;
}> = [
  {
    id: 'auth',
    label: 'Autenticación',
    description: 'Registro, verificación y recuperación de cuenta.',
  },
  {
    id: 'billing_user',
    label: 'Suscripciones (usuario)',
    description: 'Avisos de plan al titular de la cuenta.',
  },
  {
    id: 'billing_admin',
    label: 'Suscripciones (admin)',
    description: 'Avisos internos cuando hay altas, cobros o cancelaciones.',
  },
  {
    id: 'promo',
    label: 'Promociones',
    description: 'Recordatorios de códigos promo y vencimientos.',
  },
  {
    id: 'support',
    label: 'Soporte',
    description: 'Tickets de ayuda del panel.',
  },
  {
    id: 'public',
    label: 'Formularios públicos',
    description: 'Contacto del sitio y consultas Premium.',
  },
  {
    id: 'admin_messages',
    label: 'Notificaciones internas',
    description: 'Avisos configurables en Mensajes (destino y toggles).',
  },
];

const VAR_FIRST_NAME: EmailTemplateVariable = {
  key: 'firstName',
  description: 'Nombre del usuario destinatario.',
  sample: 'Lucía',
};

const VAR_ACTION_URL: EmailTemplateVariable = {
  key: 'actionUrl',
  description: 'Enlace con token de la acción (verificar, resetear, confirmar).',
  sample: 'https://appmenuqr.com/verify-email?token=abc123',
};

const VAR_YEAR: EmailTemplateVariable = {
  key: 'year',
  description: 'Año actual, para el pie del email.',
  sample: String(new Date().getFullYear()),
};

const VAR_USER_ID: EmailTemplateVariable = {
  key: 'userId',
  description: 'ID interno del usuario.',
  sample: 'usr_8f3c1b2a',
};

const VAR_USER_EMAIL: EmailTemplateVariable = {
  key: 'userEmail',
  description: 'Email del usuario.',
  sample: 'lucia@restaurante.com',
};

const VAR_USER_NAME: EmailTemplateVariable = {
  key: 'userName',
  description: 'Nombre y apellido del usuario.',
  sample: 'Lucía Pérez',
};

const VAR_USER_ROLE: EmailTemplateVariable = {
  key: 'userRole',
  description: 'Rol del usuario.',
  sample: 'TENANT_ADMIN',
};

const VAR_TENANT_ID: EmailTemplateVariable = {
  key: 'tenantId',
  description: 'ID del tenant asociado.',
  sample: 'tnt_5a91c0',
};

const VAR_PLAN_NAME: EmailTemplateVariable = {
  key: 'planName',
  description: 'Nombre del plan.',
  sample: 'Pro',
};

const VAR_BILLING_CYCLE: EmailTemplateVariable = {
  key: 'billingCycle',
  description: 'Ciclo de facturación (Mensual / Anual).',
  sample: 'Mensual',
};

const VAR_AMOUNT: EmailTemplateVariable = {
  key: 'amount',
  description: 'Monto cobrado, ya formateado con moneda.',
  sample: '$ 12.900,00',
};

const VAR_PROVIDER: EmailTemplateVariable = {
  key: 'provider',
  description: 'Medio de pago.',
  sample: 'Mercado Pago',
};

const VAR_PERIOD_START: EmailTemplateVariable = {
  key: 'periodStart',
  description: 'Inicio del período de facturación.',
  sample: '1 de marzo de 2026',
};

const VAR_PERIOD_END: EmailTemplateVariable = {
  key: 'periodEnd',
  description: 'Fin del período de facturación.',
  sample: '1 de abril de 2026',
};

const VAR_SUBSCRIPTION_URL: EmailTemplateVariable = {
  key: 'subscriptionUrl',
  description: 'Enlace al panel de suscripción del usuario.',
  sample: 'https://appmenuqr.com/admin/profile/subscription',
};

const VAR_FEATURES_HTML: EmailTemplateVariable = {
  key: 'featuresHtml',
  description: 'Filas <tr> con las características del plan (HTML).',
  sample:
    '<tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:200px;">Plan</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">Pro</td></tr>',
  allowHtml: true,
};

const VAR_EXTERNAL_SUBSCRIPTION_ID: EmailTemplateVariable = {
  key: 'externalSubscriptionId',
  description: 'ID de la suscripción en el proveedor de pago.',
  sample: '2c93808457f0c1234',
};

const ADMIN_MESSAGES_VARIABLES: EmailTemplateVariable[] = [
  VAR_USER_ID,
  VAR_USER_EMAIL,
  VAR_USER_NAME,
  VAR_USER_ROLE,
  VAR_TENANT_ID,
  {
    key: 'tenantPlan',
    description: 'Plan actual del tenant.',
    sample: 'pro',
  },
  {
    key: 'country',
    description: 'País detectado por la conexión.',
    sample: 'AR — Argentina',
  },
  {
    key: 'deviceHtml',
    description: 'Tabla con dispositivo, navegador, idioma y zona horaria (HTML).',
    sample:
      '<table style="width:100%;border-collapse:collapse;"><tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">Navegador</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">Chrome 140</td></tr></table>',
    allowHtml: true,
  },
  {
    key: 'extraHtml',
    description: 'Detalles adicionales del evento (HTML).',
    sample: '<pre style="background:#f8fafc;padding:12px;border-radius:8px;">{ "source": "web" }</pre>',
    allowHtml: true,
  },
  VAR_YEAR,
];

const kvRow = (label: string, value: string) =>
  `<tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">${label}</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${value}</td></tr>`;

const adminFooter = (year = '{{year}}') =>
  `<p style="margin-top:24px;color:#64748b;font-size:12px;">&copy; ${year} AppMenuQR</p>`;

/**
 * Cuerpo de los emails de auth: sólo el contenido interno (div.content + footer),
 * porque EmailService lo envuelve con `emailShell` (header con logo + estilos).
 */
function authBody(params: {
  greeting: string;
  paragraphs: string[];
  cta: string;
  orPaste: string;
  expires: string;
  ignore: string;
  regards: string;
  team: string;
  footer: string;
}): string {
  return `<div class="content">
  <h2>${params.greeting}</h2>
${params.paragraphs.map((p) => `  <p>${p}</p>`).join('\n')}
  <div style="text-align: center;">
    <a href="{{actionUrl}}" class="button">${params.cta}</a>
  </div>
  <p>${params.orPaste}</p>
  <p style="word-break: break-all; color: #6366f1;">{{actionUrl}}</p>
  <p><strong>${params.expires}</strong></p>
  <p>${params.ignore}</p>
  <p>${params.regards}<br>${params.team}</p>
</div>
<div class="footer">
  <p>${params.footer}</p>
</div>`;
}

export const EMAIL_TEMPLATE_DEFINITIONS: EmailTemplateDefinition[] = [
  // ========================================
  // AUTH — el envío ya usa estos overrides
  // ========================================
  {
    id: 'emailVerification',
    category: 'auth',
    name: 'Verificación de email',
    when: 'Al registrarse un usuario nuevo.',
    recipient: 'Usuario (email de la cuenta)',
    wrapInShell: true,
    sendUsesOverride: true,
    variables: [VAR_FIRST_NAME, VAR_ACTION_URL, VAR_YEAR],
    defaults: {
      es: {
        subject: 'Verifica tu email en AppMenuQR',
        bodyHtml: authBody({
          greeting: 'Hola {{firstName}},',
          paragraphs: [
            'Gracias por registrarte en AppMenuQR.',
            'Por favor, verifica tu dirección de email haciendo clic en el siguiente botón:',
          ],
          cta: 'Verificar Email',
          orPaste: 'O copia y pega este enlace en tu navegador:',
          expires: 'Este enlace expirará en 24 horas.',
          ignore: 'Si no creaste esta cuenta, puedes ignorar este email.',
          regards: 'Saludos,',
          team: 'El equipo de AppMenuQR',
          footer: '© {{year}} AppMenuQR. Todos los derechos reservados.',
        }),
      },
      en: {
        subject: 'Verify your email on AppMenuQR',
        bodyHtml: authBody({
          greeting: 'Hi {{firstName}},',
          paragraphs: [
            'Thanks for signing up for AppMenuQR.',
            'Please verify your email address by clicking the button below:',
          ],
          cta: 'Verify email',
          orPaste: 'Or copy and paste this link into your browser:',
          expires: 'This link will expire in 24 hours.',
          ignore: 'If you did not create this account, you can ignore this email.',
          regards: 'Best regards,',
          team: 'The AppMenuQR team',
          footer: '© {{year}} AppMenuQR. All rights reserved.',
        }),
      },
    },
  },
  {
    id: 'passwordReset',
    category: 'auth',
    name: 'Recuperar contraseña',
    when: 'Al pedir “olvidé mi contraseña”.',
    recipient: 'Usuario',
    wrapInShell: true,
    sendUsesOverride: true,
    variables: [VAR_FIRST_NAME, VAR_ACTION_URL, VAR_YEAR],
    defaults: {
      es: {
        subject: 'Recuperar contraseña - AppMenuQR',
        bodyHtml: authBody({
          greeting: 'Hola {{firstName}},',
          paragraphs: [
            'Recibimos una solicitud para restablecer la contraseña de tu cuenta en AppMenuQR.',
            'Haz clic en el siguiente botón para elegir una nueva contraseña:',
          ],
          cta: 'Restablecer contraseña',
          orPaste: 'O copia y pega este enlace en tu navegador:',
          expires: 'Este enlace expira en 1 hora.',
          ignore:
            'Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no se modificará.',
          regards: 'Saludos,',
          team: 'El equipo de AppMenuQR',
          footer: '© {{year}} AppMenuQR. Todos los derechos reservados.',
        }),
      },
      en: {
        subject: 'Reset your password - AppMenuQR',
        bodyHtml: authBody({
          greeting: 'Hi {{firstName}},',
          paragraphs: [
            'We received a request to reset the password for your AppMenuQR account.',
            'Click the button below to choose a new password:',
          ],
          cta: 'Reset password',
          orPaste: 'Or copy and paste this link into your browser:',
          expires: 'This link expires in 1 hour.',
          ignore:
            'If you did not request this change, you can ignore this email. Your password will not change.',
          regards: 'Best regards,',
          team: 'The AppMenuQR team',
          footer: '© {{year}} AppMenuQR. All rights reserved.',
        }),
      },
    },
  },
  {
    id: 'emailChangeVerification',
    category: 'auth',
    name: 'Confirmar cambio de email',
    when: 'Al solicitar un email nuevo desde el perfil.',
    recipient: 'Nuevo email',
    wrapInShell: true,
    sendUsesOverride: true,
    variables: [VAR_FIRST_NAME, VAR_ACTION_URL, VAR_YEAR],
    defaults: {
      es: {
        subject: 'Confirma el cambio de email - AppMenuQR',
        bodyHtml: authBody({
          greeting: 'Hola {{firstName}},',
          paragraphs: [
            'Recibimos una solicitud para cambiar el email de tu cuenta en AppMenuQR a esta dirección.',
            'Haz clic en el siguiente botón para confirmar el cambio:',
          ],
          cta: 'Confirmar cambio de email',
          orPaste: 'O copia y pega este enlace en tu navegador:',
          expires: 'Este enlace expira en 1 hora.',
          ignore:
            'Si no solicitaste este cambio, puedes ignorar este email. Tu email no se modificará.',
          regards: 'Saludos,',
          team: 'El equipo de AppMenuQR',
          footer: '© {{year}} AppMenuQR. Todos los derechos reservados.',
        }),
      },
      en: {
        subject: 'Confirm your email change - AppMenuQR',
        bodyHtml: authBody({
          greeting: 'Hi {{firstName}},',
          paragraphs: [
            'We received a request to change the email on your AppMenuQR account to this address.',
            'Click the button below to confirm the change:',
          ],
          cta: 'Confirm email change',
          orPaste: 'Or copy and paste this link into your browser:',
          expires: 'This link expires in 1 hour.',
          ignore:
            'If you did not request this change, you can ignore this email. Your email will not change.',
          regards: 'Best regards,',
          team: 'The AppMenuQR team',
          footer: '© {{year}} AppMenuQR. All rights reserved.',
        }),
      },
    },
  },
  {
    id: 'emailChangeNotification',
    category: 'auth',
    name: 'Aviso de email modificado',
    when: 'Al confirmar el cambio de email.',
    recipient: 'Email anterior',
    wrapInShell: true,
    sendUsesOverride: true,
    variables: [VAR_YEAR],
    defaults: {
      es: {
        subject: 'Tu email en AppMenuQR fue modificado',
        bodyHtml: `<div class="content">
  <h2>Cambio de email realizado</h2>
  <p>Te informamos que el email asociado a tu cuenta en AppMenuQR fue modificado correctamente.</p>
  <div class="alert">
    <strong>¿No realizaste este cambio?</strong> Contacta a soporte inmediatamente.
  </div>
  <p>Saludos,<br>El equipo de AppMenuQR</p>
</div>
<div class="footer">
  <p>© {{year}} AppMenuQR. Todos los derechos reservados.</p>
</div>`,
      },
      en: {
        subject: 'Your AppMenuQR email was changed',
        bodyHtml: `<div class="content">
  <h2>Email change completed</h2>
  <p>This is to let you know that the email associated with your AppMenuQR account was updated successfully.</p>
  <div class="alert">
    <strong>Didn’t make this change?</strong> Contact support right away.
  </div>
  <p>Best regards,<br>The AppMenuQR team</p>
</div>
<div class="footer">
  <p>© {{year}} AppMenuQR. All rights reserved.</p>
</div>`,
      },
    },
  },

  // ========================================
  // SUSCRIPCIONES (usuario)
  // ========================================
  {
    id: 'subscription.activated',
    category: 'billing_user',
    name: 'Suscripción activada',
    when: 'Primer pago / alta (MercadoPago o PayPal).',
    recipient: 'Usuario titular',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_FIRST_NAME,
      VAR_PLAN_NAME,
      VAR_BILLING_CYCLE,
      VAR_AMOUNT,
      VAR_PROVIDER,
      VAR_PERIOD_START,
      VAR_PERIOD_END,
      VAR_SUBSCRIPTION_URL,
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: 'Tu suscripción {{planName}} está activa - AppMenuQR',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">¡Suscripción exitosa!</h2>
<p>{{firstName}}, confirmamos que tu suscripción al plan <strong>{{planName}}</strong> ({{billingCycle}}) se activó correctamente.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  ${kvRow('Plan', '{{planName}}')}
  ${kvRow('Facturación', '{{billingCycle}}')}
  ${kvRow('Pago', '{{amount}}')}
  ${kvRow('Proveedor', '{{provider}}')}
  ${kvRow('Período', '{{periodStart}} → {{periodEnd}}')}
</table>
<p style="text-align:center;margin:24px 0;">
  <a href="{{subscriptionUrl}}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">Ver mi suscripción</a>
</p>
${adminFooter()}`,
      },
      en: {
        subject: 'Your {{planName}} subscription is active - AppMenuQR',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Subscription activated!</h2>
<p>{{firstName}}, we confirm that your <strong>{{planName}}</strong> subscription ({{billingCycle}}) was activated successfully.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  ${kvRow('Plan', '{{planName}}')}
  ${kvRow('Billing', '{{billingCycle}}')}
  ${kvRow('Payment', '{{amount}}')}
  ${kvRow('Provider', '{{provider}}')}
  ${kvRow('Period', '{{periodStart}} → {{periodEnd}}')}
</table>
<p style="text-align:center;margin:24px 0;">
  <a href="{{subscriptionUrl}}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">View my subscription</a>
</p>
${adminFooter()}`,
      },
    },
  },
  {
    id: 'subscription.renewed',
    category: 'billing_user',
    name: 'Suscripción renovada',
    when: 'Renovación de pago exitosa.',
    recipient: 'Usuario titular',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_FIRST_NAME,
      VAR_PLAN_NAME,
      VAR_BILLING_CYCLE,
      VAR_AMOUNT,
      VAR_PROVIDER,
      VAR_PERIOD_START,
      VAR_PERIOD_END,
      VAR_SUBSCRIPTION_URL,
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: 'Renovación exitosa de tu plan {{planName}} - AppMenuQR',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">¡Renovación exitosa!</h2>
<p>{{firstName}}, tu suscripción al plan <strong>{{planName}}</strong> ({{billingCycle}}) se renovó correctamente.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  ${kvRow('Plan', '{{planName}}')}
  ${kvRow('Facturación', '{{billingCycle}}')}
  ${kvRow('Pago', '{{amount}}')}
  ${kvRow('Proveedor', '{{provider}}')}
  ${kvRow('Período', '{{periodStart}} → {{periodEnd}}')}
</table>
<p style="text-align:center;margin:24px 0;">
  <a href="{{subscriptionUrl}}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">Ver mi suscripción</a>
</p>
${adminFooter()}`,
      },
      en: {
        subject: 'Your {{planName}} plan was renewed - AppMenuQR',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Renewal successful!</h2>
<p>{{firstName}}, your <strong>{{planName}}</strong> subscription ({{billingCycle}}) was renewed successfully.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  ${kvRow('Plan', '{{planName}}')}
  ${kvRow('Billing', '{{billingCycle}}')}
  ${kvRow('Payment', '{{amount}}')}
  ${kvRow('Provider', '{{provider}}')}
  ${kvRow('Period', '{{periodStart}} → {{periodEnd}}')}
</table>
<p style="text-align:center;margin:24px 0;">
  <a href="{{subscriptionUrl}}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">View my subscription</a>
</p>
${adminFooter()}`,
      },
    },
  },
  {
    id: 'subscription.canceled',
    category: 'billing_user',
    name: 'Suscripción cancelada',
    when: 'El usuario cancela la renovación (acceso hasta fin de ciclo, o Free inmediato si no hay período).',
    recipient: 'Usuario titular',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_FIRST_NAME,
      {
        key: 'previousPlan',
        description: 'Plan que tenía antes de cancelar.',
        sample: 'Pro',
      },
      {
        key: 'reason',
        description: 'Motivo de cancelación que indicó el usuario.',
        sample: 'Ya no lo necesito por ahora',
      },
      {
        key: 'accessUntil',
        description: 'Fecha hasta la que conserva el plan pagado (cancelación al fin de período).',
        sample: '20/02/2026 00:00',
      },
      VAR_SUBSCRIPTION_URL,
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: 'Renovación cancelada — seguís con tu plan hasta el fin del período - AppMenuQR',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Renovación cancelada</h2>
<p>{{firstName}}, confirmamos que cancelaste la renovación de tu plan <strong>{{previousPlan}}</strong>.</p>
<p>Ya no se realizarán cobros futuros. Vas a poder seguir usando tu plan <strong>{{previousPlan}}</strong> hasta el <strong>{{accessUntil}}</strong>. Después de esa fecha tu cuenta pasará al plan Free.</p>
<p><strong>Motivo indicado:</strong> {{reason}}</p>
<p style="margin-top:20px;"><a href="{{subscriptionUrl}}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Ver mi suscripción</a></p>
${adminFooter()}`,
      },
      en: {
        subject: 'Renewal canceled — you keep access until the end of the period - AppMenuQR',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Renewal canceled</h2>
<p>{{firstName}}, we confirm that you canceled renewal of your <strong>{{previousPlan}}</strong> plan.</p>
<p>No future charges will be made. You can keep using <strong>{{previousPlan}}</strong> until <strong>{{accessUntil}}</strong>. After that date your account will move to the Free plan.</p>
<p><strong>Reason provided:</strong> {{reason}}</p>
<p style="margin-top:20px;"><a href="{{subscriptionUrl}}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">View my subscription</a></p>
${adminFooter()}`,
      },
    },
  },

  // ========================================
  // SUSCRIPCIONES (admin)
  // ========================================
  {
    id: 'subscription.admin.activated',
    category: 'billing_admin',
    name: 'Alta de suscripción (admin)',
    when: 'Misma alta del usuario.',
    recipient: 'Super admin / email de Mensajes',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_USER_ID,
      VAR_USER_EMAIL,
      VAR_USER_NAME,
      VAR_TENANT_ID,
      VAR_PLAN_NAME,
      VAR_BILLING_CYCLE,
      VAR_PROVIDER,
      VAR_AMOUNT,
      VAR_EXTERNAL_SUBSCRIPTION_ID,
      {
        key: 'externalPaymentId',
        description: 'ID del pago en el proveedor.',
        sample: '129384756',
      },
      VAR_PERIOD_START,
      VAR_PERIOD_END,
      VAR_FEATURES_HTML,
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: '[AppMenuQR] Nueva suscripción {{planName}} - {{userEmail}}',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Nueva suscripción pagada</h2>
<p style="margin-bottom:8px;">Un usuario contrató un plan de pago.</p>
<h3 style="font-size:15px;margin:18px 0 8px;">Usuario</h3>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('ID', '{{userId}}')}
  ${kvRow('Email', '{{userEmail}}')}
  ${kvRow('Nombre', '{{userName}}')}
  ${kvRow('Tenant', '{{tenantId}}')}
</table>
<h3 style="font-size:15px;margin:18px 0 8px;">Suscripción</h3>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('Plan', '{{planName}}')}
  ${kvRow('Facturación', '{{billingCycle}}')}
  ${kvRow('Proveedor', '{{provider}}')}
  ${kvRow('Monto', '{{amount}}')}
  ${kvRow('ID externo', '{{externalSubscriptionId}}')}
  ${kvRow('Pago', '{{externalPaymentId}}')}
  ${kvRow('Período', '{{periodStart}} → {{periodEnd}}')}
</table>
<h3 style="font-size:15px;margin:18px 0 8px;">Características del plan</h3>
<table style="width:100%;border-collapse:collapse;">
  {{featuresHtml}}
</table>
${adminFooter()}`,
      },
    },
  },
  {
    id: 'subscription.admin.renewed',
    category: 'billing_admin',
    name: 'Renovación (admin)',
    when: 'Misma renovación del usuario.',
    recipient: 'Super admin / email de Mensajes',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_USER_ID,
      VAR_USER_EMAIL,
      VAR_USER_NAME,
      VAR_TENANT_ID,
      VAR_PLAN_NAME,
      VAR_BILLING_CYCLE,
      VAR_PROVIDER,
      VAR_AMOUNT,
      VAR_EXTERNAL_SUBSCRIPTION_ID,
      {
        key: 'externalPaymentId',
        description: 'ID del pago en el proveedor.',
        sample: '129384756',
      },
      VAR_PERIOD_START,
      VAR_PERIOD_END,
      VAR_FEATURES_HTML,
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: '[AppMenuQR] Renovación {{planName}} - {{userEmail}}',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Renovación de suscripción</h2>
<p style="margin-bottom:8px;">Un usuario renovó un plan de pago.</p>
<h3 style="font-size:15px;margin:18px 0 8px;">Usuario</h3>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('ID', '{{userId}}')}
  ${kvRow('Email', '{{userEmail}}')}
  ${kvRow('Nombre', '{{userName}}')}
  ${kvRow('Tenant', '{{tenantId}}')}
</table>
<h3 style="font-size:15px;margin:18px 0 8px;">Suscripción</h3>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('Plan', '{{planName}}')}
  ${kvRow('Facturación', '{{billingCycle}}')}
  ${kvRow('Proveedor', '{{provider}}')}
  ${kvRow('Monto', '{{amount}}')}
  ${kvRow('ID externo', '{{externalSubscriptionId}}')}
  ${kvRow('Pago', '{{externalPaymentId}}')}
  ${kvRow('Período', '{{periodStart}} → {{periodEnd}}')}
</table>
<h3 style="font-size:15px;margin:18px 0 8px;">Características del plan</h3>
<table style="width:100%;border-collapse:collapse;">
  {{featuresHtml}}
</table>
${adminFooter()}`,
      },
    },
  },
  {
    id: 'subscription.admin.canceled',
    category: 'billing_admin',
    name: 'Cancelación (admin)',
    when: 'Misma cancelación del usuario (inmediata o al fin de período).',
    recipient: 'Super admin / email de Mensajes',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_USER_ID,
      VAR_USER_EMAIL,
      VAR_USER_NAME,
      VAR_USER_ROLE,
      VAR_TENANT_ID,
      {
        key: 'previousPlan',
        description: 'Plan que tenía antes de cancelar.',
        sample: 'Pro',
      },
      {
        key: 'accessUntil',
        description: 'Si aplica: fecha hasta la que conserva el plan.',
        sample: '20/02/2026',
      },
      VAR_PROVIDER,
      VAR_EXTERNAL_SUBSCRIPTION_ID,
      {
        key: 'reason',
        description: 'Motivo de cancelación que indicó el usuario.',
        sample: 'Ya no lo necesito por ahora',
      },
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: '[AppMenuQR] Cancelación al fin de período ({{userEmail}})',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Cancelación de suscripción</h2>
<p>Un usuario canceló la renovación. Si hay <strong>{{accessUntil}}</strong>, sigue con el plan hasta esa fecha; si no, pasó a Free.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  ${kvRow('Usuario ID', '{{userId}}')}
  ${kvRow('Email', '{{userEmail}}')}
  ${kvRow('Nombre', '{{userName}}')}
  ${kvRow('Rol', '{{userRole}}')}
  ${kvRow('Tenant ID', '{{tenantId}}')}
  ${kvRow('Plan', '{{previousPlan}}')}
  ${kvRow('Acceso hasta', '{{accessUntil}}')}
  ${kvRow('Proveedor', '{{provider}}')}
  ${kvRow('ID externo', '{{externalSubscriptionId}}')}
  ${kvRow('Motivo', '{{reason}}')}
</table>
${adminFooter()}`,
      },
    },
  },
  {
    id: 'promo.admin.activated',
    category: 'billing_admin',
    name: 'Promo activada (admin)',
    when: 'Un usuario canjea un código promocional.',
    recipient: 'Super admin / email de Mensajes',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_USER_ID,
      VAR_USER_EMAIL,
      VAR_USER_NAME,
      VAR_USER_ROLE,
      {
        key: 'emailVerified',
        description: 'Si el usuario ya verificó su email (Sí / No).',
        sample: 'Sí',
      },
      VAR_TENANT_ID,
      {
        key: 'promoCode',
        description: 'Código promocional canjeado.',
        sample: 'LANZAMIENTO2026',
      },
      {
        key: 'promoCodeId',
        description: 'ID interno del código promocional.',
        sample: 'promo_71ab3c',
      },
      {
        key: 'duration',
        description: 'Duración del beneficio.',
        sample: '3 meses',
      },
      {
        key: 'redeemedAt',
        description: 'Fecha de canje.',
        sample: '12 de marzo de 2026',
      },
      {
        key: 'subscriptionId',
        description: 'ID interno de la suscripción creada.',
        sample: 'sub_4c2f9a',
      },
      VAR_EXTERNAL_SUBSCRIPTION_ID,
      VAR_PLAN_NAME,
      VAR_BILLING_CYCLE,
      VAR_PERIOD_START,
      {
        key: 'expiresAt',
        description: 'Vencimiento del beneficio (o “Sin vencimiento”).',
        sample: '12 de junio de 2026',
      },
      VAR_FEATURES_HTML,
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: '[AppMenuQR] Promo activada {{planName}} - {{userEmail}}',
        bodyHtml: `<h2 style="margin-top:0;font-size:18px;">Suscripción activada con código promocional</h2>
<p style="margin-bottom:8px;">Un usuario canjeó un código promocional y activó un plan.</p>
<h3 style="font-size:15px;margin:18px 0 8px;">Usuario</h3>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('ID', '{{userId}}')}
  ${kvRow('Email', '{{userEmail}}')}
  ${kvRow('Nombre', '{{userName}}')}
  ${kvRow('Rol', '{{userRole}}')}
  ${kvRow('Email verificado', '{{emailVerified}}')}
  ${kvRow('Tenant', '{{tenantId}}')}
</table>
<h3 style="font-size:15px;margin:18px 0 8px;">Código promocional</h3>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('Código', '{{promoCode}}')}
  ${kvRow('ID código', '{{promoCodeId}}')}
  ${kvRow('Duración del beneficio', '{{duration}}')}
  ${kvRow('Canjeado', '{{redeemedAt}}')}
</table>
<h3 style="font-size:15px;margin:18px 0 8px;">Suscripción</h3>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('ID suscripción', '{{subscriptionId}}')}
  ${kvRow('ID externo', '{{externalSubscriptionId}}')}
  ${kvRow('Plan', '{{planName}}')}
  ${kvRow('Facturación', '{{billingCycle}}')}
  ${kvRow('Proveedor', 'Código promocional')}
  ${kvRow('Estado', 'active')}
  ${kvRow('Inicio', '{{periodStart}}')}
  ${kvRow('Vence', '{{expiresAt}}')}
</table>
<h3 style="font-size:15px;margin:18px 0 8px;">Características del plan</h3>
<table style="width:100%;border-collapse:collapse;">
  {{featuresHtml}}
</table>
${adminFooter()}`,
      },
    },
  },

  // ========================================
  // PROMOCIONES
  // ========================================
  {
    id: 'promo.expiry.reminder',
    category: 'promo',
    name: 'Recordatorio de vencimiento de promo',
    when: 'Job periódico (p. ej. 7 y 1 día antes de que caduque).',
    recipient: 'Usuario con plan promo activo',
    wrapInShell: false,
    sendUsesOverride: false,
    note: 'El envío usa las reglas configuradas en Herramientas → Códigos promo (una por cantidad de días).',
    variables: [
      VAR_FIRST_NAME,
      VAR_PLAN_NAME,
      {
        key: 'promoCode',
        description: 'Código promocional con el que obtuvo el plan.',
        sample: 'LANZAMIENTO2026',
      },
      {
        key: 'expiresAt',
        description: 'Fecha de vencimiento del beneficio.',
        sample: '12 de junio de 2026',
      },
      {
        key: 'daysRemaining',
        description: 'Días que faltan para el vencimiento.',
        sample: '7',
      },
      VAR_SUBSCRIPTION_URL,
    ],
    defaults: {
      es: {
        subject: 'Tu beneficio promocional en AppMenuQR vence pronto',
        bodyHtml:
          '<p>Hola {{firstName}},</p><p>Tu plan <strong>{{planName}}</strong> gratuito obtenido con el código <strong>{{promoCode}}</strong> vence el <strong>{{expiresAt}}</strong> (faltan {{daysRemaining}} días).</p><p><a href="{{subscriptionUrl}}">Ver mi suscripción</a></p>',
      },
      en: {
        subject: 'Your AppMenuQR promo benefit expires soon',
        bodyHtml:
          '<p>Hi {{firstName}},</p><p>Your free <strong>{{planName}}</strong> plan from promo code <strong>{{promoCode}}</strong> expires on <strong>{{expiresAt}}</strong> ({{daysRemaining}} days left).</p><p><a href="{{subscriptionUrl}}">View my subscription</a></p>',
      },
    },
  },

  // ========================================
  // SOPORTE
  // ========================================
  {
    id: 'support.ticket.new',
    category: 'support',
    name: 'Nuevo ticket de soporte',
    when: 'Un usuario crea un ticket.',
    recipient: 'Admin / super admin',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      {
        key: 'ticketNumber',
        description: 'Número del ticket.',
        sample: '148',
      },
      {
        key: 'ticketSubject',
        description: 'Asunto que escribió el usuario.',
        sample: 'No puedo subir fotos a un producto',
      },
      {
        key: 'authorName',
        description: 'Nombre del usuario que abrió el ticket.',
        sample: 'Lucía Pérez',
      },
      {
        key: 'authorEmail',
        description: 'Email del usuario que abrió el ticket.',
        sample: 'lucia@restaurante.com',
      },
      {
        key: 'message',
        description: 'Mensaje inicial del ticket.',
        sample: 'Cuando subo una foto de más de 2 MB me da error.',
      },
      {
        key: 'attachmentsHtml',
        description: 'Lista de adjuntos (HTML); vacío si no hay.',
        sample: '<p><strong>Adjuntos:</strong></p><ul><li><a href="https://…/foto.png">foto.png</a></li></ul>',
        allowHtml: true,
      },
      {
        key: 'adminUrl',
        description: 'Enlace al panel de tickets.',
        sample: 'https://appmenuqr.com/admin/config/support-tickets',
      },
      VAR_YEAR,
    ],
    defaults: {
      es: {
        subject: '[AppMenuQR] Nuevo ticket #{{ticketNumber}} — {{ticketSubject}}',
        bodyHtml: `<h2 style="margin-top:0;">Nuevo ticket de soporte</h2>
<p><strong>Número:</strong> #{{ticketNumber}}</p>
<p><strong>Usuario:</strong> {{authorName}} ({{authorEmail}})</p>
<p><strong>Asunto:</strong> {{ticketSubject}}</p>
<p><strong>Mensaje inicial:</strong></p>
<pre style="white-space: pre-wrap; background:#f3f4f6; padding:12px; border-radius:8px;">{{message}}</pre>
{{attachmentsHtml}}
<p><a href="{{adminUrl}}">Abrir en el panel de soporte</a></p>
${adminFooter()}`,
      },
    },
  },
  {
    id: 'support.ticket.reply',
    category: 'support',
    name: 'Respuesta a ticket',
    when: 'El admin responde un ticket.',
    recipient: 'Usuario dueño del ticket',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      VAR_FIRST_NAME,
      {
        key: 'ticketNumber',
        description: 'Número del ticket.',
        sample: '148',
      },
      {
        key: 'ticketSubject',
        description: 'Asunto del ticket.',
        sample: 'No puedo subir fotos a un producto',
      },
      {
        key: 'adminMessage',
        description: 'Respuesta escrita por el equipo.',
        sample: 'Ya ajustamos el límite de tamaño; probá de nuevo.',
      },
      {
        key: 'loginUrl',
        description: 'Enlace para iniciar sesión y seguir el hilo.',
        sample: 'https://appmenuqr.com/login',
      },
    ],
    defaults: {
      es: {
        subject: '[AppMenuQR] Respuesta a tu ticket #{{ticketNumber}}',
        bodyHtml: `<h2 style="margin-top:0;">{{firstName}}, tenemos una respuesta a tu ticket</h2>
<p><strong>Ticket:</strong> #{{ticketNumber}} — {{ticketSubject}}</p>
<p><strong>Respuesta del equipo:</strong></p>
<pre style="white-space: pre-wrap; background:#f3f4f6; padding:12px; border-radius:8px;">{{adminMessage}}</pre>
<p>Podés iniciar sesión para seguir el hilo y responder desde el panel de soporte.</p>
<p><a href="{{loginUrl}}">Ir a iniciar sesión</a></p>`,
      },
      en: {
        subject: '[AppMenuQR] Reply to your ticket #{{ticketNumber}}',
        bodyHtml: `<h2 style="margin-top:0;">{{firstName}}, we have a reply to your ticket</h2>
<p><strong>Ticket:</strong> #{{ticketNumber}} — {{ticketSubject}}</p>
<p><strong>Team reply:</strong></p>
<pre style="white-space: pre-wrap; background:#f3f4f6; padding:12px; border-radius:8px;">{{adminMessage}}</pre>
<p>Sign in to continue the thread and reply from the support panel.</p>
<p><a href="{{loginUrl}}">Go to sign in</a></p>`,
      },
    },
  },

  // ========================================
  // FORMULARIOS PÚBLICOS
  // ========================================
  {
    id: 'contact.web',
    category: 'public',
    name: 'Contacto web',
    when: 'Alguien envía el formulario de contacto del sitio.',
    recipient: 'Email de recepción (CONTACT_FORM_RECEIVER_EMAIL)',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      {
        key: 'fullName',
        description: 'Nombre que dejó la persona.',
        sample: 'Lucía Pérez',
      },
      {
        key: 'phone',
        description: 'Teléfono de contacto.',
        sample: '+54 9 11 5555-1234',
      },
      {
        key: 'email',
        description: 'Email de contacto.',
        sample: 'lucia@restaurante.com',
      },
      {
        key: 'sourcePage',
        description: 'Página desde la que se envió el formulario.',
        sample: '/precios',
      },
      {
        key: 'ip',
        description: 'IP de origen.',
        sample: '190.55.12.9',
      },
      {
        key: 'userAgent',
        description: 'User-Agent del navegador.',
        sample: 'Mozilla/5.0 (Macintosh…)',
      },
      {
        key: 'message',
        description: 'Mensaje enviado.',
        sample: 'Quiero saber si el plan Pro incluye traducciones.',
      },
    ],
    defaults: {
      es: {
        subject: 'Contacto web ({{sourcePage}}) - {{fullName}}',
        bodyHtml: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
  <h2 style="margin:0 0 16px">Nuevo mensaje de contacto (sitio público)</h2>
  <p><strong>Nombre:</strong> {{fullName}}</p>
  <p><strong>Teléfono:</strong> {{phone}}</p>
  <p><strong>Email:</strong> {{email}}</p>
  <p><strong>Página de origen:</strong> {{sourcePage}}</p>
  <p><strong>IP:</strong> {{ip}}</p>
  <p><strong>User-Agent:</strong> {{userAgent}}</p>
  <hr />
  <p><strong>Mensaje:</strong></p>
  <div style="white-space:pre-wrap;border:1px solid #e5e7eb;padding:12px;border-radius:6px;background:#f9fafb">{{message}}</div>
</div>`,
      },
    },
  },
  {
    id: 'premium.inquiry',
    category: 'public',
    name: 'Consulta Plan Premium',
    when: 'Consulta de plan a medida desde el sitio.',
    recipient: 'Email de recepción',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [
      {
        key: 'fullName',
        description: 'Nombre que dejó la persona.',
        sample: 'Lucía Pérez',
      },
      {
        key: 'businessName',
        description: 'Nombre del negocio.',
        sample: 'Bodegón La Esquina',
      },
      {
        key: 'phone',
        description: 'Teléfono de contacto.',
        sample: '+54 9 11 5555-1234',
      },
      {
        key: 'email',
        description: 'Email de contacto.',
        sample: 'lucia@restaurante.com',
      },
      {
        key: 'sourcePage',
        description: 'Página desde la que se envió la consulta.',
        sample: '/precios',
      },
      {
        key: 'ip',
        description: 'IP de origen.',
        sample: '190.55.12.9',
      },
      {
        key: 'userAgent',
        description: 'User-Agent del navegador.',
        sample: 'Mozilla/5.0 (Macintosh…)',
      },
      {
        key: 'message',
        description: 'Detalle de lo que necesita.',
        sample: 'Tenemos 12 sucursales y necesitamos menús por local.',
      },
    ],
    defaults: {
      es: {
        subject: 'Consulta Plan Premium ({{sourcePage}}) - {{fullName}}',
        bodyHtml: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
  <h2 style="margin:0 0 16px">Nueva consulta Plan Premium (a medida)</h2>
  <p><strong>Nombre:</strong> {{fullName}}</p>
  <p><strong>Negocio:</strong> {{businessName}}</p>
  <p><strong>Teléfono:</strong> {{phone}}</p>
  <p><strong>Email:</strong> {{email}}</p>
  <p><strong>Origen:</strong> {{sourcePage}}</p>
  <p><strong>IP:</strong> {{ip}}</p>
  <p><strong>User-Agent:</strong> {{userAgent}}</p>
  <hr />
  <p><strong>Qué necesita:</strong></p>
  <div style="white-space:pre-wrap;border:1px solid #e5e7eb;padding:12px;border-radius:6px;background:#f9fafb">{{message}}</div>
</div>`,
      },
    },
  },

  // ========================================
  // NOTIFICACIONES INTERNAS (Mensajes)
  // ========================================
  {
    id: 'admin.messages.user_created',
    category: 'admin_messages',
    name: 'Usuario creado',
    when: 'Registro (si el toggle está activo en Mensajes).',
    recipient: 'Email configurado en Mensajes',
    wrapInShell: false,
    sendUsesOverride: false,
    note: 'Se activa/desactiva en Configuración → Mensajes.',
    variables: ADMIN_MESSAGES_VARIABLES,
    defaults: {
      es: {
        subject: '[AppMenuQR] Nuevo usuario creado - {{userEmail}}',
        bodyHtml: `<h2 style="margin: 0 0 10px 0; font-size: 16px;">Nuevo usuario creado</h2>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('ID', '{{userId}}')}
  ${kvRow('Email', '{{userEmail}}')}
  ${kvRow('Nombre', '{{userName}}')}
  ${kvRow('Rol', '{{userRole}}')}
  ${kvRow('Tenant ID', '{{tenantId}}')}
  ${kvRow('Plan (tenant)', '{{tenantPlan}}')}
  ${kvRow('País (conexión)', '{{country}}')}
</table>
{{deviceHtml}}
{{extraHtml}}
${adminFooter()}`,
      },
    },
  },
  {
    id: 'admin.messages.user_email_verified',
    category: 'admin_messages',
    name: 'Email verificado',
    when: 'El usuario verifica su email (si el toggle está activo).',
    recipient: 'Email configurado en Mensajes',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: ADMIN_MESSAGES_VARIABLES,
    defaults: {
      es: {
        subject: '[AppMenuQR] Usuario verificó email - {{userEmail}}',
        bodyHtml: `<h2 style="margin: 0 0 10px 0; font-size: 16px;">Usuario verificó email</h2>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('ID', '{{userId}}')}
  ${kvRow('Email', '{{userEmail}}')}
  ${kvRow('Nombre', '{{userName}}')}
  ${kvRow('Rol', '{{userRole}}')}
  ${kvRow('Tenant ID', '{{tenantId}}')}
  ${kvRow('Plan (tenant)', '{{tenantPlan}}')}
  ${kvRow('País (conexión)', '{{country}}')}
</table>
{{deviceHtml}}
{{extraHtml}}
${adminFooter()}`,
      },
    },
  },
  {
    id: 'admin.messages.subscription_payment_failed',
    category: 'admin_messages',
    name: 'Pago de suscripción fallido',
    when: 'Falla un cobro MP/PayPal (si el toggle está activo).',
    recipient: 'Email configurado en Mensajes',
    wrapInShell: false,
    sendUsesOverride: false,
    variables: [...ADMIN_MESSAGES_VARIABLES, VAR_PROVIDER, VAR_PLAN_NAME, VAR_AMOUNT],
    defaults: {
      es: {
        subject: '[AppMenuQR] Falló un pago de suscripción - {{userEmail}}',
        bodyHtml: `<h2 style="margin: 0 0 10px 0; font-size: 16px;">Fallo de pago de suscripción</h2>
<table style="width:100%;border-collapse:collapse;">
  ${kvRow('ID', '{{userId}}')}
  ${kvRow('Email', '{{userEmail}}')}
  ${kvRow('Nombre', '{{userName}}')}
  ${kvRow('Rol', '{{userRole}}')}
  ${kvRow('Tenant ID', '{{tenantId}}')}
  ${kvRow('Plan (tenant)', '{{tenantPlan}}')}
  ${kvRow('Proveedor', '{{provider}}')}
  ${kvRow('Monto', '{{amount}}')}
  ${kvRow('País (conexión)', '{{country}}')}
</table>
{{deviceHtml}}
{{extraHtml}}
${adminFooter()}`,
      },
    },
  },
];

const DEFINITIONS_BY_ID = new Map<string, EmailTemplateDefinition>(
  EMAIL_TEMPLATE_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function getEmailTemplateDefinition(id: string): EmailTemplateDefinition | undefined {
  return DEFINITIONS_BY_ID.get(id);
}
