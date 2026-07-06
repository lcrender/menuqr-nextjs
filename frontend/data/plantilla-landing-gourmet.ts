import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /plantillas/gourmet */
export const PLANTILLA_GOURMET_LANDING: PlantillaLandingContent = {
  slug: 'gourmet',
  badgeStrip: ['Exclusivo'],
  seo: {
    title: 'Plantilla menú QR Gourmet | Carta digital premium con imágenes',
    description:
      'Plantilla de menú QR Gourmet para restaurantes premium. Incluye imágenes en productos, tipografías elegantes y diseño exclusivo. Disponible en plan PRO.',
  },
  previewPath: '/preview/gourmet',
  heroPreviewImage:
    '/plantillas/landings/carta-digital-restaurante-gourmet-preview-f7615185-dcb5-4f6a-bee5-5ad8954aab1d.png',
  header: {
    h1: 'Plantilla Gourmet para carta digital QR',
    intro:
      'La plantilla Gourmet está diseñada para restaurantes que buscan una carta digital premium, elegante y altamente visual. Es ideal para transmitir calidad, detalle y una experiencia gastronómica superior.\n\nAdemás, permite personalizar colores, tipografías y elementos visuales como logo, portada, nombre y descripción del comercio. También podés mostrar imágenes en cada producto para destacar tus platos.',
  },
  exclusividadPro: {
    heading: 'Plantilla exclusiva PRO',
    paragraphs: [
      'La plantilla Gourmet está disponible únicamente para usuarios con plan PRO o superior.',
      'Incluye funcionalidades avanzadas que permiten ofrecer una experiencia más completa y profesional a tus clientes.',
    ],
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Gourmet es ideal para restaurantes premium que buscan una carta digital elegante, visual y fácil de leer. Su diseño permite mostrar productos con fotos, categorías y precios de forma ordenada, con una experiencia cómoda desde el celular.',
    items: [
      'Restaurantes de alta cocina',
      'Bistrós y restaurantes gourmet',
      'Negocios que buscan una imagen premium',
      'Restaurantes que cuidan cada detalle visual',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño elegante y sofisticado',
      'Experiencia visual de alto nivel',
      'Permite destacar productos con imágenes',
      'Mayor impacto en la percepción del cliente',
      'Diferenciación frente a menús básicos',
    ],
  },
  imagenesProductos: {
    heading: 'Imágenes en cada producto',
    paragraphs: [
      'A diferencia de otras plantillas, Gourmet permite añadir imágenes a cada producto del menú.',
      'Esto mejora significativamente la experiencia del usuario y aumenta el atractivo de los platos.',
    ],
    items: ['Visualización más atractiva', 'Mayor intención de compra', 'Presentación profesional del menú'],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    colors: {
      heading: 'Colores personalizables',
      items: [
        'Color principal: botones, títulos y elementos destacados',
        'Color secundario: acentos, bordes y detalles',
      ],
    },
    elementos: {
      heading: 'Elementos visuales configurables',
      items: [
        'Mostrar imagen de portada',
        'Mostrar logo del restaurante',
        'Mostrar nombre del restaurante',
        'Mostrar descripción del restaurante',
      ],
    },
  },
  tipografia: {
    heading: 'Tipografías elegantes configurables',
    paragraphs: [
      'Puedes elegir entre distintas tipografías para adaptar la estética de la carta a tu estilo:',
      'Estas opciones permiten reforzar una identidad visual más sofisticada y acorde a restaurantes premium.',
    ],
  },
  tipografiaFontList: ['Serif (Georgia)', 'Sans (Helvetica)', 'Century Schoolbook', 'Baskerville', 'Palatino'],
  traduccionesPro: {
    heading: 'Idiomas y traducciones (Función PRO)',
    paragraphs: ['Puedes ofrecer el menú en varios idiomas para clientes internacionales.'],
    items: ['Selector de idioma', 'Mostrar u ocultar banderas', 'Gestión de múltiples traducciones'],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    items: [
      'Acceso mediante código QR',
      'Navegación visual y envolvente',
      'Presentación premium de los platos',
      'Optimizado para dispositivos móviles',
    ],
  },
  qr: {
    heading: 'Ver demo en tu móvil',
    body: 'Escanea el código QR para ver una preview real de esta plantilla en tu teléfono.',
    demoButtonLabel: 'Ver demo',
    demoHint: 'Demo disponible en celular y navegador',
  },
  cta: {
    heading: 'Activa la experiencia Gourmet',
    body: 'Accede a esta plantilla exclusiva y ofrece una carta digital de nivel superior.',
    primaryLabel: 'Actualizar a PRO',
    primaryHref: '/precios',
    secondaryLabel: 'Usar esta plantilla',
    secondaryHref: '/admin/templates',
    secondaryShowOnlyForPro: true,
  },
};
