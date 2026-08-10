export type EmailLang = 'es' | 'en';

export function normalizeEmailLang(lang?: string | null): EmailLang {
  return String(lang || 'es').trim().toLowerCase() === 'en' ? 'en' : 'es';
}

type AuthEmailCopy = {
  subject: string;
  greeting: (firstName: string) => string;
  body: string[];
  cta: string;
  orPaste: string;
  expires: string;
  ignore: string;
  regards: string;
  team: string;
  footer: (year: number) => string;
};

const passwordReset: Record<EmailLang, AuthEmailCopy> = {
  es: {
    subject: 'Recuperar contraseña - AppMenuQR',
    greeting: (n) => `Hola ${n},`,
    body: [
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta en AppMenuQR.',
      'Haz clic en el siguiente botón para elegir una nueva contraseña:',
    ],
    cta: 'Restablecer contraseña',
    orPaste: 'O copia y pega este enlace en tu navegador:',
    expires: 'Este enlace expira en 1 hora.',
    ignore: 'Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no se modificará.',
    regards: 'Saludos,',
    team: 'El equipo de AppMenuQR',
    footer: (y) => `© ${y} AppMenuQR. Todos los derechos reservados.`,
  },
  en: {
    subject: 'Reset your password - AppMenuQR',
    greeting: (n) => `Hi ${n},`,
    body: [
      'We received a request to reset the password for your AppMenuQR account.',
      'Click the button below to choose a new password:',
    ],
    cta: 'Reset password',
    orPaste: 'Or copy and paste this link into your browser:',
    expires: 'This link expires in 1 hour.',
    ignore: 'If you did not request this change, you can ignore this email. Your password will not change.',
    regards: 'Best regards,',
    team: 'The AppMenuQR team',
    footer: (y) => `© ${y} AppMenuQR. All rights reserved.`,
  },
};

const emailVerification: Record<EmailLang, AuthEmailCopy> = {
  es: {
    subject: 'Verifica tu email en AppMenuQR',
    greeting: (n) => `Hola ${n},`,
    body: [
      'Gracias por registrarte en AppMenuQR.',
      'Por favor, verifica tu dirección de email haciendo clic en el siguiente botón:',
    ],
    cta: 'Verificar Email',
    orPaste: 'O copia y pega este enlace en tu navegador:',
    expires: 'Este enlace expirará en 24 horas.',
    ignore: 'Si no creaste esta cuenta, puedes ignorar este email.',
    regards: 'Saludos,',
    team: 'El equipo de AppMenuQR',
    footer: (y) => `© ${y} AppMenuQR. Todos los derechos reservados.`,
  },
  en: {
    subject: 'Verify your email on AppMenuQR',
    greeting: (n) => `Hi ${n},`,
    body: [
      'Thanks for signing up for AppMenuQR.',
      'Please verify your email address by clicking the button below:',
    ],
    cta: 'Verify email',
    orPaste: 'Or copy and paste this link into your browser:',
    expires: 'This link will expire in 24 hours.',
    ignore: 'If you did not create this account, you can ignore this email.',
    regards: 'Best regards,',
    team: 'The AppMenuQR team',
    footer: (y) => `© ${y} AppMenuQR. All rights reserved.`,
  },
};

const emailChangeVerification: Record<EmailLang, AuthEmailCopy> = {
  es: {
    subject: 'Confirma el cambio de email - AppMenuQR',
    greeting: (n) => `Hola ${n},`,
    body: [
      'Recibimos una solicitud para cambiar el email de tu cuenta en AppMenuQR a esta dirección.',
      'Haz clic en el siguiente botón para confirmar el cambio:',
    ],
    cta: 'Confirmar cambio de email',
    orPaste: 'O copia y pega este enlace en tu navegador:',
    expires: 'Este enlace expira en 1 hora.',
    ignore: 'Si no solicitaste este cambio, puedes ignorar este email. Tu email no se modificará.',
    regards: 'Saludos,',
    team: 'El equipo de AppMenuQR',
    footer: (y) => `© ${y} AppMenuQR. Todos los derechos reservados.`,
  },
  en: {
    subject: 'Confirm your email change - AppMenuQR',
    greeting: (n) => `Hi ${n},`,
    body: [
      'We received a request to change the email on your AppMenuQR account to this address.',
      'Click the button below to confirm the change:',
    ],
    cta: 'Confirm email change',
    orPaste: 'Or copy and paste this link into your browser:',
    expires: 'This link expires in 1 hour.',
    ignore: 'If you did not request this change, you can ignore this email. Your email will not change.',
    regards: 'Best regards,',
    team: 'The AppMenuQR team',
    footer: (y) => `© ${y} AppMenuQR. All rights reserved.`,
  },
};

const emailChangeNotification: Record<
  EmailLang,
  {
    subject: string;
    title: string;
    body: string;
    alertTitle: string;
    alertBody: string;
    regards: string;
    team: string;
    footer: (year: number) => string;
  }
> = {
  es: {
    subject: 'Tu email en AppMenuQR fue modificado',
    title: 'Cambio de email realizado',
    body: 'Te informamos que el email asociado a tu cuenta en AppMenuQR fue modificado correctamente.',
    alertTitle: '¿No realizaste este cambio?',
    alertBody: 'Contacta a soporte inmediatamente.',
    regards: 'Saludos,',
    team: 'El equipo de AppMenuQR',
    footer: (y) => `© ${y} AppMenuQR. Todos los derechos reservados.`,
  },
  en: {
    subject: 'Your AppMenuQR email was changed',
    title: 'Email change completed',
    body: 'This is to let you know that the email associated with your AppMenuQR account was updated successfully.',
    alertTitle: 'Didn’t make this change?',
    alertBody: 'Contact support right away.',
    regards: 'Best regards,',
    team: 'The AppMenuQR team',
    footer: (y) => `© ${y} AppMenuQR. All rights reserved.`,
  },
};

export function defaultEmailDisplayName(lang: EmailLang): string {
  return lang === 'en' ? 'there' : 'Usuario';
}

export const authEmailCopy = {
  passwordReset,
  emailVerification,
  emailChangeVerification,
  emailChangeNotification,
};

/** Copy for subscription activation / renewal emails to the user. */
export const subscriptionUserEmailCopy = {
  es: {
    titleSuffix: 'Suscripción',
    activatedSubject: (plan: string) => `Tu suscripción ${plan} está activa - AppMenuQR`,
    renewedSubject: (plan: string) => `Renovación exitosa de tu plan ${plan} - AppMenuQR`,
    activatedTitle: '¡Suscripción exitosa!',
    renewedTitle: '¡Renovación exitosa!',
    activatedIntro: (plan: string, billing: string) =>
      `Confirmamos que tu suscripción al plan <strong>${plan}</strong> (${billing}) se activó correctamente.`,
    renewedIntro: (plan: string, billing: string) =>
      `Tu suscripción al plan <strong>${plan}</strong> (${billing}) se renovó correctamente.`,
    labels: {
      plan: 'Plan',
      billing: 'Facturación',
      payment: 'Pago',
      provider: 'Proveedor',
      period: 'Período',
    },
    cta: 'Ver mi suscripción',
    monthly: 'Mensual',
    annual: 'Anual',
    promoProvider: 'Código promocional',
    canceledSubject: 'Tu suscripción fue cancelada — pasaste a plan Free - AppMenuQR',
    canceledTitle: 'Tu suscripción fue cancelada',
    canceledBody: (first: string, previousPlan: string, reason: string) => `
        <h2 style="margin-top:0;font-size:18px;">Tu suscripción fue cancelada</h2>
        <p>${first}, confirmamos que cancelaste tu plan <strong>${previousPlan}</strong>.</p>
        <p>Tu cuenta pasó al plan <strong>Free</strong>. A partir de ahora ya no vas a poder usar las ventajas del plan ${previousPlan} (límites, plantillas y funciones exclusivas de ese plan).</p>
        <p><strong>Motivo indicado:</strong> ${reason}</p>
        <p>Si querés volver a un plan de pago, podés hacerlo cuando quieras desde tu suscripción.</p>
      `,
    canceledCta: 'Ver planes',
  },
  en: {
    titleSuffix: 'Subscription',
    activatedSubject: (plan: string) => `Your ${plan} subscription is active - AppMenuQR`,
    renewedSubject: (plan: string) => `Your ${plan} plan was renewed - AppMenuQR`,
    activatedTitle: 'Subscription activated!',
    renewedTitle: 'Renewal successful!',
    activatedIntro: (plan: string, billing: string) =>
      `We confirm that your <strong>${plan}</strong> subscription (${billing}) was activated successfully.`,
    renewedIntro: (plan: string, billing: string) =>
      `Your <strong>${plan}</strong> subscription (${billing}) was renewed successfully.`,
    labels: {
      plan: 'Plan',
      billing: 'Billing',
      payment: 'Payment',
      provider: 'Provider',
      period: 'Period',
    },
    cta: 'View my subscription',
    monthly: 'Monthly',
    annual: 'Annual',
    promoProvider: 'Promo code',
    canceledSubject: 'Your subscription was canceled — you moved to Free - AppMenuQR',
    canceledTitle: 'Your subscription was canceled',
    canceledBody: (first: string, previousPlan: string, reason: string) => `
        <h2 style="margin-top:0;font-size:18px;">Your subscription was canceled</h2>
        <p>${first}, we confirm that you canceled your <strong>${previousPlan}</strong> plan.</p>
        <p>Your account moved to the <strong>Free</strong> plan. You will no longer have access to ${previousPlan} benefits (limits, templates, and exclusive features).</p>
        <p><strong>Reason provided:</strong> ${reason}</p>
        <p>If you want a paid plan again, you can upgrade anytime from your subscription page.</p>
      `,
    canceledCta: 'View plans',
  },
} as const;

/** Default promo expiry reminder templates (used when preferred language is en, or as ES defaults). */
export const promoReminderDefaults: Record<
  EmailLang,
  Array<{ daysBefore: number; subject: string; bodyHtml: string }>
> = {
  es: [
    {
      daysBefore: 7,
      subject: 'Tu beneficio promocional en AppMenuQR vence pronto',
      bodyHtml:
        '<p>Hola {{firstName}},</p><p>Tu plan <strong>{{planName}}</strong> gratuito obtenido con el código <strong>{{promoCode}}</strong> vence el <strong>{{expiresAt}}</strong> (faltan {{daysRemaining}} días).</p><p><a href="{{subscriptionUrl}}">Ver mi suscripción</a></p>',
    },
    {
      daysBefore: 1,
      subject: 'Tu beneficio promocional en AppMenuQR vence mañana',
      bodyHtml:
        '<p>Hola {{firstName}},</p><p>Mañana vence tu plan <strong>{{planName}}</strong> gratuito (código {{promoCode}}). Renová desde <a href="{{subscriptionUrl}}">tu suscripción</a> para no perder funciones.</p>',
    },
  ],
  en: [
    {
      daysBefore: 7,
      subject: 'Your AppMenuQR promo benefit expires soon',
      bodyHtml:
        '<p>Hi {{firstName}},</p><p>Your free <strong>{{planName}}</strong> plan from promo code <strong>{{promoCode}}</strong> expires on <strong>{{expiresAt}}</strong> ({{daysRemaining}} days left).</p><p><a href="{{subscriptionUrl}}">View my subscription</a></p>',
    },
    {
      daysBefore: 1,
      subject: 'Your AppMenuQR promo benefit expires tomorrow',
      bodyHtml:
        '<p>Hi {{firstName}},</p><p>Your free <strong>{{planName}}</strong> plan (code {{promoCode}}) expires tomorrow. Renew from <a href="{{subscriptionUrl}}">your subscription</a> so you don’t lose features.</p>',
    },
  ],
};

/** Email al usuario cuando un admin responde un ticket de soporte. */
export const supportTicketReplyEmailCopy = {
  es: {
    subject: (n: number) => `[AppMenuQR] Respuesta a tu ticket #${n}`,
    title: (firstName: string) => `${firstName}, tenemos una respuesta a tu ticket`,
    ticketLabel: 'Ticket',
    replyLabel: 'Respuesta del equipo',
    followUp:
      'Podés iniciar sesión para seguir el hilo y responder desde el panel de soporte.',
    cta: 'Ir a iniciar sesión',
    defaultName: 'Hola',
  },
  en: {
    subject: (n: number) => `[AppMenuQR] Reply to your ticket #${n}`,
    title: (firstName: string) => `${firstName}, we have a reply to your ticket`,
    ticketLabel: 'Ticket',
    replyLabel: 'Team reply',
    followUp: 'Sign in to continue the thread and reply from the support panel.',
    cta: 'Go to sign in',
    defaultName: 'Hi',
  },
} as const;
