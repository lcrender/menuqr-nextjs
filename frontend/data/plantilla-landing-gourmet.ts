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
  header: {
    h1: 'Plantilla de menú QR Gourmet',
    intro:
      'La plantilla Gourmet está diseñada para restaurantes que buscan una carta digital premium, elegante y altamente visual. Es ideal para transmitir calidad, detalle y una experiencia gastronómica superior.',
  },
  exclusividadPro: {
    heading: 'Plantilla exclusiva PRO',
    paragraphs: [
      'La plantilla Gourmet está disponible únicamente para usuarios con plan PRO o superior.',
      'Incluye funcionalidades avanzadas que permiten ofrecer una experiencia más completa y profesional a tus clientes.',
    ],
  },
  paraQuien: {
    heading: '¿Para qué tipo de restaurantes es ideal?',
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
    body: 'Escanea el código QR para experimentar esta plantilla en un entorno real desde tu teléfono.',
    demoButtonLabel: 'Ver demo',
    demoHint: 'Abrí la demo en el navegador del celular o escaneá el código desde otro dispositivo.',
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
