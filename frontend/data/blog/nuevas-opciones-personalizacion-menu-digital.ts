/**
 * Contenido ES/EN: nuevas opciones de personalización de plantillas.
 */

import type { BlogUiLocale } from '../../lib/blog-nav';

export const BLOG_ARTICLE_PERSONALIZACION_SLUG =
  'nuevas-opciones-personalizacion-menu-digital' as const;

const IMAGE = {
  src: '/blog/nuevas-opciones-personalizacion-menu-digital.jpg',
  width: 507,
  height: 1024,
} as const;

type ArticleCopy = {
  lead: string;
  intro: string[];
  imageAlt: string;
  imageCaption: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  closingHeading: string;
  closing: string[];
  ctaLabel: string;
  ctaHref: string;
};

const ES: ArticleCopy = {
  lead:
    'En AppMenuQR seguimos incorporando mejoras para que puedas crear un menú digital que refleje la identidad de tu negocio. Por eso, actualizamos la configuración de plantillas con nuevas tipografías, más opciones de tamaños de texto y una mayor variedad de colores.',
  intro: [
    'Ahora tenés más libertad para personalizar cada detalle y conseguir un diseño que se adapte al estilo de tu restaurante, cafetería, bar o cualquier otro comercio.',
  ],
  imageAlt:
    'Panel de configuración de plantilla en AppMenuQR con selector de Google Fonts y colores principal, de fondo y de precios.',
  imageCaption:
    'Nueva configuración de plantillas: tipografías, tamaños y colores personalizados.',
  sections: [
    {
      heading: 'Nuevas tipografías de Google Fonts',
      paragraphs: [
        'Incorporamos una selección de nuevas fuentes de Google Fonts, una de las bibliotecas de tipografías más utilizadas en el mundo.',
        'Podés elegir entre diferentes estilos, desde fuentes modernas y minimalistas hasta opciones más clásicas y elegantes, para darle a tu menú una personalidad propia.',
        'Además, estas tipografías están optimizadas para ofrecer una carga rápida, manteniendo una experiencia de navegación fluida para tus clientes.',
      ],
    },
    {
      heading: 'Ajustá el tamaño de cada texto',
      paragraphs: [
        'Cada negocio tiene su propio estilo y ahora podés controlar mejor cómo se presenta la información en tu menú.',
        'Agregamos nuevas opciones para ajustar individualmente el tamaño de los textos, como el nombre del comercio, los títulos de las categorías, los nombres y las descripciones de los productos y sus precios.',
        'De esta manera, podés destacar la información más importante y crear una jerarquía visual que facilite la lectura.',
      ],
    },
    {
      heading: 'Más colores para destacar lo importante',
      paragraphs: [
        'También ampliamos las opciones de personalización de colores dentro de las plantillas.',
        'Por ejemplo, ahora podés asignar un color específico a los precios para resaltarlos, diferenciarlos del resto del contenido o combinarlos con los colores de tu marca.',
        'Estas nuevas opciones te permiten crear diseños más atractivos, equilibrados y coherentes con la identidad visual de tu comercio.',
      ],
    },
  ],
  closingHeading: 'Un menú digital más personalizado, sin complicaciones',
  closing: [
    'Todas estas mejoras están disponibles desde la configuración de plantillas de AppMenuQR, sin necesidad de conocimientos de diseño ni programación.',
    'Podés probar distintas combinaciones de tipografías, tamaños y colores hasta encontrar el estilo que mejor represente tu negocio.',
    'Ingresá a AppMenuQR, explorá las nuevas opciones de personalización y renová el diseño de tu menú digital.',
  ],
  ctaLabel: 'Probar AppMenuQR gratis',
  ctaHref: '/login?action=register',
};

const EN: ArticleCopy = {
  lead:
    'At AppMenuQR we keep shipping improvements so you can create a digital menu that reflects your brand. That’s why we updated template settings with new typefaces, more text size options, and a wider range of colors.',
  intro: [
    'You now have more freedom to customize every detail and get a design that fits the style of your restaurant, cafe, bar, or any other business.',
  ],
  imageAlt:
    'AppMenuQR template settings panel with Google Fonts picker and main, background, and price color controls.',
  imageCaption:
    'New template settings: custom fonts, sizes, and colors.',
  sections: [
    {
      heading: 'New Google Fonts typefaces',
      paragraphs: [
        'We added a selection of new Google Fonts, one of the most widely used typeface libraries in the world.',
        'You can choose among different styles—from modern and minimalist fonts to more classic and elegant options—to give your menu its own personality.',
        'These typefaces are also optimized for fast loading, so guests still get a smooth browsing experience.',
      ],
    },
    {
      heading: 'Adjust the size of every text',
      paragraphs: [
        'Every business has its own style, and you can now control more precisely how information appears on your menu.',
        'We added new options to adjust text sizes individually—for the business name, category titles, product names and descriptions, and prices.',
        'That way you can highlight what matters most and create a visual hierarchy that makes the menu easier to read.',
      ],
    },
    {
      heading: 'More colors to highlight what matters',
      paragraphs: [
        'We also expanded color customization options inside the templates.',
        'For example, you can now assign a specific color to prices to emphasize them, set them apart from the rest of the content, or match them to your brand colors.',
        'These options help you create designs that are more attractive, balanced, and consistent with your visual identity.',
      ],
    },
  ],
  closingHeading: 'A more personalized digital menu, without the hassle',
  closing: [
    'All of these improvements are available from AppMenuQR template settings—no design or coding skills required.',
    'Try different combinations of fonts, sizes, and colors until you find the look that best represents your business.',
    'Sign in to AppMenuQR, explore the new customization options, and refresh the design of your digital menu.',
  ],
  ctaLabel: 'Try AppMenuQR for free',
  ctaHref: '/login?action=register',
};

export function getBlogArticlePersonalizacion(locale: BlogUiLocale) {
  return {
    slug: BLOG_ARTICLE_PERSONALIZACION_SLUG,
    image: IMAGE,
    ...(locale === 'en' ? EN : ES),
  };
}
