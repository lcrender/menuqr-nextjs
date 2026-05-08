import type { MenuTemplateCatalogItem } from '../types/menu-template-catalog';

export type FaqPair = { question: string; answer: string };

const ORG_NAME = 'AppMenuQR';

/** Devuelve base `https://host` o null si falta / no es absoluta. */
export function siteJsonLdBaseUrl(raw: string | undefined): string | null {
  const base = (raw || '').trim().replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return null;
  return base;
}

export function buildOrganizationNode(base: string): {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo: { '@type': 'ImageObject'; url: string };
  description: string;
  contactPoint: { '@type': 'ContactPoint'; contactType: string; url: string };
} {
  const b = base.replace(/\/$/, '');
  return {
    '@type': 'Organization',
    '@id': `${b}/#organization`,
    name: ORG_NAME,
    url: b,
    logo: {
      '@type': 'ImageObject',
      url: `${b}/favicon.svg`,
    },
    description:
      'Plataforma SaaS para menús digitales con código QR: restaurantes, bares y negocios gastronómicos crean cartas online, plantillas de diseño y panel de gestión.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${b}/soporte`,
    },
  };
}

/** Home: Organization + WebSite + SoftwareApplication + FAQPage en un único @graph. */
export function buildLandingJsonLd(base: string, faqItems: readonly FaqPair[]): string {
  const b = base.replace(/\/$/, '');
  const org = buildOrganizationNode(b);
  const orgId = org['@id'];

  const graph: Record<string, unknown>[] = [
    org,
    {
      '@type': 'WebSite',
      '@id': `${b}/#website`,
      url: b,
      name: ORG_NAME,
      description:
        'Menú QR para restaurantes: crear carta digital, código QR para mesas y plantillas. Los clientes acceden desde el móvil sin instalar aplicaciones.',
      publisher: { '@id': orgId },
      inLanguage: 'es',
    },
    {
      '@type': 'SoftwareApplication',
      name: ORG_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web browser',
      url: b,
      description:
        'Software de menú digital con QR: gestión de restaurantes, menús, secciones, productos, importación CSV, traducciones y suscripción.',
      offers: {
        '@type': 'Offer',
        url: `${b}/precios`,
        description: 'Registro gratuito y planes de pago; precios actualizados en la página de precios.',
      },
      author: { '@id': orgId },
      publisher: { '@id': orgId },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/** Página de precios: Organization + WebPage + BreadcrumbList. */
export function buildPreciosJsonLd(base: string): string {
  const b = base.replace(/\/$/, '');
  const org = buildOrganizationNode(b);
  const orgId = org['@id'];

  const graph: Record<string, unknown>[] = [
    org,
    {
      '@type': 'WebSite',
      '@id': `${b}/#website`,
      url: b,
      name: ORG_NAME,
    },
    {
      '@type': 'WebPage',
      '@id': `${b}/precios#webpage`,
      url: `${b}/precios`,
      name: 'Precios y planes | AppMenuQR',
      description:
        'Planes y precios para crear tu menú QR con AppMenuQR: compará opciones y registrate gratis cuando quieras.',
      isPartOf: { '@id': `${b}/#website` },
      publisher: { '@id': orgId },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: b,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Precios',
          item: `${b}/precios`,
        },
      ],
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/** Catálogo de plantillas: ItemList con una entrada por plantilla. */
export function buildPlantillasCatalogJsonLd(base: string, templates: readonly MenuTemplateCatalogItem[]): string {
  const b = base.replace(/\/$/, '');
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'ItemList',
      name: 'Plantillas de menú QR — AppMenuQR',
      description: 'Catálogo de plantillas visuales para cartas digitales con código QR.',
      numberOfItems: templates.length,
      itemListElement: templates.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'WebPage',
          name: t.nombre,
          url: `${b}/plantillas/${encodeURIComponent(t.slug)}`,
        },
      })),
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/** Detalle de plantilla: WebPage + BreadcrumbList. */
export function buildPlantillaDetalleJsonLd(
  base: string,
  template: Pick<MenuTemplateCatalogItem, 'slug' | 'nombre'>,
): string {
  const b = base.replace(/\/$/, '');
  const detailUrl = `${b}/plantillas/${encodeURIComponent(template.slug)}`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${detailUrl}#webpage`,
      url: detailUrl,
      name: `Plantilla menú QR ${template.nombre} | AppMenuQR`,
      isPartOf: { '@id': `${b}/#website` },
      about: { '@id': `${b}/#organization` },
      inLanguage: 'es',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: b,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Plantillas',
          item: `${b}/plantillas`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: template.nombre,
          item: detailUrl,
        },
      ],
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/** Documentación pública: WebPage + BreadcrumbList (índice o sección). */
export function buildDocumentacionJsonLd(base: string, opts: { slug?: string; title: string }): string {
  const b = base.replace(/\/$/, '');
  const slug = opts.slug?.trim();
  const isIndex = !slug;
  const url = isIndex ? `${b}/documentacion` : `${b}/documentacion/${encodeURIComponent(slug)}`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: opts.title,
      isPartOf: { '@id': `${b}/#website` },
      about: { '@id': `${b}/#organization` },
      inLanguage: 'es',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: b,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Documentación',
          item: `${b}/documentacion`,
        },
        ...(isIndex
          ? []
          : [
              {
                '@type': 'ListItem',
                position: 3,
                name: opts.title,
                item: url,
              },
            ]),
      ],
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
