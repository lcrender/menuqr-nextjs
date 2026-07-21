import type { MenuTemplateCatalogItem } from '../types/menu-template-catalog';
import { PLANTILLAS_CATALOG_PATH, plantillaCaracteristicasHref } from './plantillas-catalog-url';

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
      url: `${b}/images/app-menu-qr-logo.png`,
    },
    description:
      'Software SaaS de carta digital para restaurantes con código QR: gestión de productos, menú digital, plantillas y panel de administración para bares y locales gastronómicos.',
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
        'Carta digital restaurante QR: software con gestión de productos, actualización en tiempo real y menú digital accesible desde el móvil sin instalar aplicaciones.',
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
        'Software gastronómico para carta digital con QR: gestión de restaurantes, categorías, productos, activación de platos, traducciones y planes de suscripción.',
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

/** Landing SEO temática: Organization + WebPage + BreadcrumbList + FAQPage opcional. */
export function buildSeoLandingJsonLd(
  base: string,
  path: string,
  pageName: string,
  pageDescription: string,
  faqItems: readonly FaqPair[],
): string {
  const b = base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const pageUrl = `${b}${normalizedPath}`;
  const org = buildOrganizationNode(b);
  const orgId = org['@id'];
  const breadcrumbName = pageName.split('|')[0]?.trim() || pageName;

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
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageName,
      description: pageDescription,
      isPartOf: { '@id': `${b}/#website` },
      publisher: { '@id': orgId },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: b },
        { '@type': 'ListItem', position: 2, name: breadcrumbName, item: pageUrl },
      ],
    },
  ];

  if (faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

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
          url: `${b}${plantillaCaracteristicasHref(t.slug)}`,
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
  const detailUrl = `${b}${plantillaCaracteristicasHref(template.slug)}`;
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
          item: `${b}${PLANTILLAS_CATALOG_PATH}`,
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
