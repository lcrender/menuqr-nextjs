/**
 * Manifiesto de la documentación multipágina (orden = navegación y siguiente/anterior).
 */
export type DocSection = {
  slug: string;
  /** Título mostrado en la página (H1) */
  title: string;
  shortTitle: string;
  /** Contenido de la etiqueta <title> en la documentación pública */
  metaTitlePublic: string;
  /** Contenido de la etiqueta <title> en la ayuda del panel admin */
  metaTitleAdmin: string;
  /** Meta description (SEO) */
  metaDescription: string;
  group: string;
  /** Palabras clave y texto plano para el buscador del panel */
  keywords: string;
  searchText: string;
};

export const DOCUMENTATION_SECTIONS: DocSection[] = [
  {
    slug: 'intro',
    title: 'Documentación — Inicio',
    shortTitle: 'Inicio',
    metaTitlePublic: 'Documentación | AppMenuQR',
    metaTitleAdmin: 'Documentación | Ayuda',
    metaDescription:
      'Guía AppMenuQR: registro, restaurante, menús, CSV, plantillas, publicación, QR, administración del negocio, traducciones, suscripciones y pagos.',
    group: 'Introducción',
    keywords: 'inicio guía flujo resumen pasos registro sesión',
    searchText: 'resumen flujo completo crear restaurante menú csv secciones productos qr verificar email',
  },
  {
    slug: 'crear-restaurante',
    title: 'Crear un restaurante',
    shortTitle: 'Restaurante',
    metaTitlePublic: 'Crear un restaurante | Documentación AppMenuQR',
    metaTitleAdmin: 'Crear un restaurante | Ayuda',
    metaDescription:
      'Alta del primer restaurante en AppMenuQR: datos, dirección en mapa, teléfono, WhatsApp, logo, plantilla por defecto y moneda principal.',
    group: 'Primeros pasos',
    keywords: 'restaurante crear logo portada moneda plantilla dirección whatsapp maps',
    searchText: 'restaurantes menú lateral crear guardar primera vez asistente',
  },
  {
    slug: 'crear-menu',
    title: 'Crear un menú',
    shortTitle: 'Menú',
    metaTitlePublic: 'Crear un menú | Documentación AppMenuQR',
    metaTitleAdmin: 'Crear un menú | Ayuda',
    metaDescription:
      'Cómo crear menús por restaurante: nombre visible para clientes, descripción opcional y secciones dentro del menú.',
    group: 'Primeros pasos',
    keywords: 'menú crear borrador restaurante nombre botón secciones',
    searchText: 'menús nuevo guardar almuerzo cena entradas principales',
  },
  {
    slug: 'crear-secciones',
    title: 'Crear secciones del menú',
    shortTitle: 'Secciones',
    metaTitlePublic: 'Secciones del menú | Documentación AppMenuQR',
    metaTitleAdmin: 'Secciones del menú | Ayuda',
    metaDescription:
      'Organizar categorías en el menú: agregar sección, orden con arrastre y líneas de agarre.',
    group: 'Menú',
    keywords: 'secciones categorías menú orden drag agregar',
    searchText: 'secciones del menú agregar orden tres líneas',
  },
  {
    slug: 'crear-productos',
    title: 'Crear productos',
    shortTitle: 'Productos',
    metaTitlePublic: 'Crear productos | Documentación AppMenuQR',
    metaTitleAdmin: 'Crear productos | Ayuda',
    metaDescription:
      'Alta de productos con precios en la moneda del restaurante, iconos y asignación a secciones.',
    group: 'Menú',
    keywords: 'productos precios iconos moneda destacado',
    searchText: 'productos del menú crear precio moneda principal restaurante',
  },
  {
    slug: 'reordenar-productos',
    title: 'Reordenar productos',
    shortTitle: 'Orden',
    metaTitlePublic: 'Reordenar productos | Documentación AppMenuQR',
    metaTitleAdmin: 'Reordenar productos | Ayuda',
    metaDescription:
      'Cambiar el orden de productos con arrastrar y soltar dentro de una sección o entre secciones.',
    group: 'Menú',
    keywords: 'orden arrastrar drag drop productos',
    searchText: 'reordenar arrastra suelta sección',
  },
  {
    slug: 'importar-menu-csv',
    title: 'Importar menú con CSV',
    shortTitle: 'CSV',
    metaTitlePublic: 'Importar menú con CSV | Documentación AppMenuQR',
    metaTitleAdmin: 'Importar menú con CSV | Ayuda',
    metaDescription:
      'Importar secciones y productos desde CSV: columnas, alérgenos, límites del plan y edición posterior completa.',
    group: 'Menú',
    keywords: 'csv importar plantilla secciones productos precios',
    searchText: 'nombre_seccion nombre_producto moneda precio importación editar después',
  },
  {
    slug: 'plantillas',
    title: 'Plantillas de diseño',
    shortTitle: 'Plantillas',
    metaTitlePublic: 'Plantillas de diseño | Documentación AppMenuQR',
    metaTitleAdmin: 'Plantillas de diseño | Ayuda',
    metaDescription:
      'Plantilla por defecto al crear el restaurante, Menú plantillas para previsualizar, colores y opciones del negocio.',
    group: 'Diseño',
    keywords: 'plantilla diseño preview colores logo nombre classic foodie',
    searchText: 'plantilla restaurante editar activar desactivar primarios secundarios',
  },
  {
    slug: 'publicar-menu',
    title: 'Publicar el menú',
    shortTitle: 'Publicar',
    metaTitlePublic: 'Publicar el menú | Documentación AppMenuQR',
    metaTitleAdmin: 'Publicar el menú | Ayuda',
    metaDescription:
      'Estado borrador o publicado, botones publicar y despublicar; enlace del restaurante con menús ocultos hasta publicar.',
    group: 'Publicación',
    keywords: 'publicar borrador despublicar estado acciones lista menús',
    searchText: 'columna estado qr visible oculto',
  },
  {
    slug: 'descargar-qr',
    title: 'Descargar código QR',
    shortTitle: 'Código QR',
    metaTitlePublic: 'Código QR del restaurante | Documentación AppMenuQR',
    metaTitleAdmin: 'Código QR del restaurante | Ayuda',
    metaDescription:
      'QR del restaurante en el dashboard: todos los menús publicados, descarga, impresión y aviso si cambias el nombre.',
    group: 'Publicación',
    keywords: 'qr código descargar dashboard restaurante menús nombre enlace',
    searchText: 'imprimir escanear google maps cambiar nombre nuevo qr',
  },
  {
    slug: 'desactivar-restaurante',
    title: 'Desactivar el restaurante',
    shortTitle: 'Desactivar local',
    metaTitlePublic: 'Desactivar restaurante | Documentación AppMenuQR',
    metaTitleAdmin: 'Desactivar restaurante | Ayuda',
    metaDescription:
      'Qué ocurre si desactivás el restaurante: la página pública y el QR no se muestran hasta reactivarlo.',
    group: 'Administración del negocio',
    keywords: 'desactivar restaurante ocultar pausa cerrar página pública qr',
    searchText: 'restaurante inactivo volver activar cartel online',
  },
  {
    slug: 'eliminar-restaurante',
    title: 'Eliminar el restaurante',
    shortTitle: 'Eliminar local',
    metaTitlePublic: 'Eliminar restaurante | Documentación AppMenuQR',
    metaTitleAdmin: 'Eliminar restaurante | Ayuda',
    metaDescription:
      'Eliminar un restaurante borra todos los datos asociados de forma irreversible.',
    group: 'Administración del negocio',
    keywords: 'eliminar restaurante borrar datos permanentemente peligro',
    searchText: 'borrar negocio irreversible menús productos',
  },
  {
    slug: 'menu-visibilidad-y-eliminacion',
    title: 'Menú: visibilidad y eliminación',
    shortTitle: 'Menú / borrar',
    metaTitlePublic: 'Despublicar y eliminar menús | Documentación AppMenuQR',
    metaTitleAdmin: 'Despublicar y eliminar menús | Ayuda',
    metaDescription:
      'Menús despublicados en la carta online, eliminar menú sin borrar productos y productos huérfanos.',
    group: 'Administración del negocio',
    keywords: 'despublicar menú eliminar menú productos sin menú visible carta',
    searchText: 'borrar menu productos asignar huérfano',
  },
  {
    slug: 'traducciones',
    title: 'Traducciones',
    shortTitle: 'Traducciones',
    metaTitlePublic: 'Traducciones del menú | Documentación AppMenuQR',
    metaTitleAdmin: 'Traducciones del menú | Ayuda',
    metaDescription:
      'Pasos para traducir contenido en AppMenuQR y límites según tu plan de suscripción.',
    group: 'Contenido e idiomas',
    keywords: 'traducciones idiomas i18n plan límites suscripción',
    searchText: 'traducir menu texto segundo idioma',
  },
  {
    slug: 'edicion-masiva-productos',
    title: 'Edición masiva de productos',
    shortTitle: 'Edición masiva',
    metaTitlePublic: 'Edición masiva de productos | Documentación AppMenuQR',
    metaTitleAdmin: 'Edición masiva de productos | Ayuda',
    metaDescription:
      'Acciones masivas sobre productos: borrar, mover entre menús y restaurantes, duplicados y límites del plan.',
    group: 'Productos avanzado',
    keywords: 'masivo borrar mover duplicar plan límite productos',
    searchText: 'trasladar otro restaurante copiar cantidad',
  },
  {
    slug: 'editar-productos-detalle',
    title: 'Editar un producto',
    shortTitle: 'Editar producto',
    metaTitlePublic: 'Editar producto: precios y estado | Documentación AppMenuQR',
    metaTitleAdmin: 'Editar producto: precios y estado | Ayuda',
    metaDescription:
      'Activar o desactivar un producto, nombre, descripción, precios y foto según tu plan.',
    group: 'Productos avanzado',
    keywords: 'editar producto precio foto activar desactivar',
    searchText: 'descripción opciones precio imagen plan',
  },
  {
    slug: 'suscripciones-y-pagos',
    title: 'Suscripciones y pagos',
    shortTitle: 'Suscripción',
    metaTitlePublic: 'Suscripciones y pagos | Documentación AppMenuQR',
    metaTitleAdmin: 'Suscripciones y pagos | Ayuda',
    metaDescription:
      'Medios de pago (Mercado Pago Argentina, PayPal internacional), baja cuando quieras.',
    group: 'Cuenta y facturación',
    keywords: 'suscripción pago mercadopago paypal argentina baja cancelar',
    searchText: 'facturación plan cobro mensual',
  },
];

/** Slugs que tienen página dedicada bajo `[slug]` (la intro vive en el índice del directorio). */
export const DOCUMENTATION_SLUGS_STATIC = DOCUMENTATION_SECTIONS.filter((s) => s.slug !== 'intro').map((s) => s.slug);

export function getDocBySlug(slug: string | undefined | null): DocSection | undefined {
  if (!slug) return undefined;
  return DOCUMENTATION_SECTIONS.find((s) => s.slug === slug);
}

export function isValidDocSlug(slug: string): boolean {
  return DOCUMENTATION_SECTIONS.some((s) => s.slug === slug && s.slug !== 'intro');
}

export function normalizeDocBasePath(basePath: string): string {
  return (basePath || '/documentacion').replace(/\/+$/, '') || '/documentacion';
}

/** Ruta a una sección (`intro` → índice del basePath). */
export function docHref(basePath: string, slug: string): string {
  const base = normalizeDocBasePath(basePath);
  if (slug === 'intro') return base;
  return `${base}/${slug}`;
}

export function getAdjacentSections(slug: string): { prev: DocSection | null; next: DocSection | null } {
  const idx = DOCUMENTATION_SECTIONS.findIndex((s) => s.slug === slug);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? DOCUMENTATION_SECTIONS[idx - 1]! : null,
    next: idx < DOCUMENTATION_SECTIONS.length - 1 ? DOCUMENTATION_SECTIONS[idx + 1]! : null,
  };
}

export function matchesDocSearch(section: DocSection, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${section.title} ${section.shortTitle} ${section.keywords} ${section.searchText} ${section.metaDescription}`.toLowerCase();
  return hay.includes(q);
}
