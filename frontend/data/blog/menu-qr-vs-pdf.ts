/**
 * Artículo SEO: menú QR vs PDF (ES + EN).
 */

import type { BlogUiLocale } from '../../lib/blog-nav';
import { blogArticleHref } from '../../lib/blog-nav';
import { plantillasCatalogPath } from '../../lib/plantillas-catalog-url';

export type BlogInline = string | { strong: string } | { link: string; href: string };

export type BlogBlock =
  | { type: 'p'; content: BlogInline[] }
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: BlogInline[][] }
  | { type: 'ol'; items: BlogInline[][] }
  | { type: 'note'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'image'; src: string; alt: string; width: number; height: number; caption?: string };

export type BlogFaqItem = { question: string; answer: string };

export type BlogMenuQrVsPdfArticle = {
  lead: BlogInline[];
  tocLabel: string;
  toc: { href: string; label: string }[];
  blocks: BlogBlock[];
  faqId: string;
  faqHeading: string;
  faqs: BlogFaqItem[];
  conclusionId: string;
  conclusionHeading: string;
  conclusionParagraphs: BlogInline[][];
  ctaId: string;
  ctaTitle: string;
  ctaParagraphs: BlogInline[][];
  ctaLabel: string;
  ctaHref: string;
};

const REGISTER_HREF = '/login?action=register';

function article(
  locale: BlogUiLocale,
  guideHref: string,
  templatesHref: string,
): BlogMenuQrVsPdfArticle {
  if (locale === 'en') {
    return {
      lead: [
        'Digitizing a restaurant menu is a practical way to make products easier to browse, keep prices up to date, and improve the guest experience.',
      ],
      tocLabel: 'In this article',
      toc: [
        { href: '#what-is-a-pdf-menu', label: 'What a PDF menu is' },
        { href: '#what-is-a-dynamic-qr-menu', label: 'What a dynamic QR menu is' },
        { href: '#qr-menu-vs-pdf-differences', label: 'Main differences' },
        { href: '#reasons-to-choose-qr-menu', label: '5 reasons to choose a QR menu' },
        { href: '#when-a-pdf-menu-makes-sense', label: 'When a PDF menu is enough' },
        { href: '#from-pdf-to-qr-menu', label: 'How to switch from PDF to QR' },
        { href: '#qr-menu-vs-pdf-faq', label: 'Frequently asked questions' },
        { href: '#conclusion-qr-vs-pdf', label: 'Conclusion' },
      ],
      blocks: [
        {
          type: 'p',
          content: [
            'Still, when it is time to choose a solution, one question comes up often: ',
            { strong: 'is a dynamic QR menu better than a PDF menu?' },
          ],
        },
        {
          type: 'p',
          content: [
            'Both options let guests read the menu on a phone, but they differ in how you update information, customize the design, and manage products.',
          ],
        },
        {
          type: 'p',
          content: [
            'This article compares the strengths and limits of each option so you can pick the one that fits your restaurant, bar, or cafe.',
          ],
        },
        {
          type: 'h2',
          id: 'what-is-a-pdf-menu',
          text: 'What is a digital menu in PDF?',
        },
        {
          type: 'p',
          content: [
            'A PDF menu is a digital version of a restaurant menu, usually created with design tools or document editors.',
          ],
        },
        {
          type: 'p',
          content: [
            'The file can be shared through a link, sent by messaging apps, or opened when someone scans a QR code.',
          ],
        },
        {
          type: 'p',
          content: [
            'It is a common choice because you can reuse an existing printed design without building a new presentation from scratch.',
          ],
        },
        { type: 'h3', text: 'Advantages of a PDF menu' },
        {
          type: 'ul',
          items: [
            [
              { strong: 'Custom design:' },
              ' you can create documents with photos, colors, fonts, and graphic elements.',
            ],
            [
              { strong: 'Easy to share:' },
              ' the file can be sent by email, messaging, or a link.',
            ],
            [
              { strong: 'Compatible with many devices:' },
              ' most phones and computers can open PDF files.',
            ],
            [
              { strong: 'Print-ready:' },
              ' the same document can be used for physical menus.',
            ],
          ],
        },
        { type: 'h3', text: 'Disadvantages of a PDF menu' },
        {
          type: 'p',
          content: [
            'Although it works well for some businesses, it also has limitations.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'It can be uncomfortable to read on a phone.' },
            ' If the document was designed for a large printed sheet, guests may need to zoom and scroll sideways to browse products.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'Updating prices can take more work.' },
            ' When a price changes or a dish is added, you usually edit the original file, export it again, and replace the published version.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'Product management is less flexible.' },
            ' Hiding a sold-out item or editing a description means changing the document instead of using an admin panel.',
          ],
        },
        {
          type: 'p',
          content: [
            'These frictions can become a problem for restaurants that update their menus often.',
          ],
        },
        {
          type: 'h2',
          id: 'what-is-a-dynamic-qr-menu',
          text: 'What is a dynamic QR menu?',
        },
        {
          type: 'p',
          content: [
            'A dynamic QR menu opens a digital menu that you can update without changing the QR code guests already use.',
          ],
        },
        {
          type: 'p',
          content: [
            'Instead of a static file, platforms such as ',
            { strong: 'App Menu QR' },
            ' let you build a digital menu with categories, products, descriptions, photos, and prices managed in one place.',
          ],
        },
        {
          type: 'p',
          content: [
            'That way, the restaurant can change the offer without redesigning a file every time something needs an update.',
          ],
        },
        {
          type: 'p',
          content: [
            'For example, if a dish sells out or the price changes, you can update that information quickly from a phone or a PC using the admin panel and edit it in just a few seconds.',
          ],
        },
        {
          type: 'p',
          content: [
            'The next time a guest scans the QR code, they see the menu with those changes.',
          ],
        },
        {
          type: 'p',
          content: [
            'Worth noting: a QR code can also open a PDF. The main difference is ',
            { strong: 'how the content is presented and managed' },
            ', not only whether a QR code is used.',
          ],
        },
        {
          type: 'h2',
          id: 'qr-menu-vs-pdf-differences',
          text: 'QR menu vs. PDF: key differences',
        },
        {
          type: 'p',
          content: [
            'To make the trade-offs clearer, here is a practical comparison between a traditional PDF menu and a QR menu managed on a dedicated platform.',
          ],
        },
        {
          type: 'table',
          headers: ['Feature', 'PDF menu', 'Dynamic QR menu'],
          rows: [
            [
              'Price updates',
              'Requires editing the document and re-uploading the file to the server with the same filename so the QR keeps working',
              'Changed from the admin panel in a few clicks',
            ],
            ['Phone-friendly design', 'Depends on the PDF layout', 'Adapts the size to each mobile device resolution'],
            ['Adding products', 'Requires editing the file', 'Added from the platform'],
            [
              'Hiding sold-out items',
              'Requires editing the PDF and re-uploading the file. Very hard to do in real time.',
              'Can be managed from the menu in a few seconds and in real time',
            ],
            [
              'Photos',
              'Embedded in the document',
              'Linked to each product: you can take photos directly from your phone when updating the menu, or select them from any device',
            ],
            [
              'Category organization',
              'Usually static',
              'Navigation by sections. The menu shows the categories and the guest chooses which one to view (Starters, Mains, Drinks, etc.)',
            ],
            ['Customization', 'Through design tools', 'Through platform options'],
            [
              'Printing',
              'Can be printed directly',
              'Depends on available features. Appmenuqr.com lets you print your digital menu on paper so you can manage everything from one place',
            ],
            ['Maintenance', 'Manual, file-based', 'Centralized in a dashboard'],
          ],
        },
        {
          type: 'p',
          content: [
            { strong:
              'The main advantage of a dynamic QR menu is how easy it is to keep the menu updated without editing and republishing a full document.',
            },
          ],
        },
        {
          type: 'p',
          content: [
            'That does not mean a PDF is a bad choice. The right option depends on how each business works and how often the offer changes.',
          ],
        },
        {
          type: 'h2',
          id: 'reasons-to-choose-qr-menu',
          text: '5 reasons to choose a dynamic QR menu for your restaurant',
        },
        { type: 'h3', text: '1. Change prices without printing or redesigning the menu' },
        {
          type: 'p',
          content: [
            'Product prices can shift with costs, promotions, or commercial adjustments.',
          ],
        },
        {
          type: 'p',
          content: [
            'With a PDF menu, you usually edit the document and publish a new version.',
          ],
        },
        {
          type: 'p',
          content: [
            'With a dynamic QR menu, you open the admin panel, change the price, and save.',
          ],
        },
        {
          type: 'p',
          content: ['The QR code already on the tables stays valid.'],
        },
        {
          type: 'image',
          src: '/blog/menu-qr-vs-pdf-editar-producto.jpg',
          alt: 'Edit product panel in App Menu QR to change name, description, and price without redesigning a PDF',
          width: 1000,
          height: 1022,
          caption: 'Update a product and its price from the admin panel in a few clicks.',
        },
        { type: 'h3', text: '2. Add or edit products easily' },
        {
          type: 'p',
          content: [
            'Restaurants often add seasonal dishes, new drinks, or special items.',
          ],
        },
        {
          type: 'p',
          content: [
            'A managed digital menu lets you add products without manually rebuilding a document layout.',
          ],
        },
        {
          type: 'image',
          src: '/blog/menu-qr-vs-pdf-edicion-menu.jpg',
          alt: 'App Menu QR menu editor with products organized by sections such as grilled cuts and platters',
          width: 1024,
          height: 728,
          caption: 'Organize products by category and manage the full menu from one place.',
        },
        {
          type: 'p',
          content: [
            'You can also edit descriptions, update photos, and reorder categories as the business needs.',
          ],
        },
        {
          type: 'image',
          src: '/blog/menu-qr-vs-pdf-foto-producto.jpg',
          alt: 'Crop product photo tool in App Menu QR, saving images as WebP for the digital menu',
          width: 1024,
          height: 700,
          caption: 'Take or select a product photo and crop it before publishing it on the menu.',
        },
        { type: 'h3', text: '3. Hide products that are unavailable' },
        {
          type: 'p',
          content: [
            'Imagine one of your most popular dishes runs out during service.',
          ],
        },
        {
          type: 'p',
          content: [
            'With a printed menu or a PDF, the item may still appear and guests may keep ordering it.',
          ],
        },
        {
          type: 'p',
          content: [
            'With a platform that lets you manage product visibility, you can hide it temporarily and show it again when it is available.',
          ],
        },
        {
          type: 'p',
          content: [
            'That reduces confusion and improves communication between the venue and its guests.',
          ],
        },
        { type: 'h3', text: '4. Offer a better phone experience' },
        {
          type: 'p',
          content: [
            'Most guests who scan a QR code open the menu on their phone.',
          ],
        },
        {
          type: 'p',
          content: [
            'That is why information should be clear, text should be readable, and products should be easy to find.',
          ],
        },
        {
          type: 'p',
          content: [
            'A digital menu designed for mobile can show categories in an organized way, so guests browse without constant zooming.',
          ],
        },
        {
          type: 'p',
          content: [
            'This is especially useful when the restaurant offers a wide range of products.',
          ],
        },
        { type: 'h3', text: '5. Customize your menu design' },
        {
          type: 'p',
          content: [
            'The menu is part of a restaurant’s visual identity.',
          ],
        },
        {
          type: 'p',
          content: [
            'Colors, fonts, photos, and product layout help communicate the style of the venue.',
          ],
        },
        {
          type: 'p',
          content: [
            'With App Menu QR you can choose different ',
            { link: 'templates', href: templatesHref },
            ' and customize visual elements to match your business.',
          ],
        },
        {
          type: 'p',
          content: [
            'You can also change the design without editing every product one by one.',
          ],
        },
        {
          type: 'h2',
          id: 'when-a-pdf-menu-makes-sense',
          text: 'When does a PDF menu make sense?',
        },
        {
          type: 'p',
          content: [
            'Although a dynamic QR menu offers more flexibility for day-to-day management, there are cases where a PDF menu can be enough.',
          ],
        },
        {
          type: 'p',
          content: [
            'For example, a venue with a small offer and prices that barely change could use a PDF without major issues.',
          ],
        },
        {
          type: 'p',
          content: [
            'It can also help when the business needs a very specific design or a document prepared for printing.',
          ],
        },
        {
          type: 'p',
          content: [
            'You can even combine both: use a dynamic QR menu for everyday browsing and keep a printed version for guests who prefer a traditional menu.',
          ],
        },
        {
          type: 'image',
          src: '/blog/menu-qr-vs-pdf-imprimir-carta.jpg',
          alt: 'App Menu QR print options with a live preview of the paper menu for La parrilla de Pocho',
          width: 1024,
          height: 656,
          caption:
            'Print a paper version of your digital menu from the same panel to keep both formats consistent.',
        },
        {
          type: 'p',
          content: [
            { strong:
              'The best solution is not always to remove paper or PDF files, but to choose the format that makes work easier for the business and the experience clearer for guests.',
            },
          ],
        },
        {
          type: 'h2',
          id: 'from-pdf-to-qr-menu',
          text: 'How to move from a PDF menu to a dynamic QR menu',
        },
        {
          type: 'p',
          content: [
            'If you currently use a PDF menu and want more flexible product management, you can take the next step without technical skills.',
          ],
        },
        {
          type: 'p',
          content: [
            'With App Menu QR, the process is simple:',
          ],
        },
        {
          type: 'ol',
          items: [
            [
              { strong: 'Create a free account' },
              ' and set up your restaurant’s main details.',
            ],
            [
              { strong: 'Create your menu' },
              ' and organize products into categories such as starters, mains, drinks, and desserts.',
            ],
            [
              { strong: 'Add your products' },
              ', including names, descriptions, prices, and photos.',
            ],
            [
              { strong: 'Choose a template' },
              ' and customize colors and fonts.',
            ],
            [
              { strong: 'Download your QR code' },
              ' and place it on tables or other visible spots in the venue.',
            ],
          ],
        },
        {
          type: 'p',
          content: [
            'Once it is set up, you can manage the menu from the platform and make changes whenever you need.',
          ],
        },
        {
          type: 'p',
          content: [
            'For the full walkthrough, see our guide: ',
            {
              link: 'How to create a free QR menu for your restaurant, step by step',
              href: guideHref,
            },
            '.',
          ],
        },
      ],
      faqId: 'qr-menu-vs-pdf-faq',
      faqHeading: 'Frequently asked questions about QR menus and PDFs',
      faqs: [
        {
          question: 'Is a QR menu the same as a PDF with a QR code?',
          answer:
            'Not necessarily. A QR code can open a PDF or a web page. A QR menu managed on a dedicated platform lets you manage products, prices, and categories independently, without editing a full document.',
        },
        {
          question: 'Can I update my menu without changing the QR code?',
          answer:
            'Yes. With a dynamic QR menu like App Menu QR, you can edit products and prices without changing the printed code. You can also do it with a QR that points to a fixed URL where you replace the PDF, although editing is usually less practical.',
        },
        {
          question: 'Do I need technical skills to create a QR menu?',
          answer:
            'No. With App Menu QR you create your digital menu from an admin panel, without coding or building a website.',
        },
        {
          question: 'Do guests need to download an app?',
          answer:
            'No. Guests scan the QR code with their phone camera and open the menu in the browser.',
        },
        {
          question: 'Can I have a digital menu and a printed menu at the same time?',
          answer:
            'Yes. Both options can work together. You can offer a QR menu for people who prefer browsing on their phone and keep some printed menus for other guests. With App Menu QR you can print a paper version of your menu so you manage products from one place and avoid inconsistencies between the printed menu and the digital menu.',
        },
      ],
      conclusionId: 'conclusion-qr-vs-pdf',
      conclusionHeading: 'Conclusion: is a QR menu or a PDF menu better?',
      conclusionParagraphs: [
        [
          'Both a PDF menu and a QR menu can help present a restaurant’s products.',
        ],
        [
          'However, when the business needs to change prices, update dishes, or adjust the offer often, ',
          { strong: 'a dynamic QR menu usually offers simpler, more flexible management' },
          '.',
        ],
        [
          'Being able to update information from an admin panel, keep the same QR code, and adapt the design to mobile devices can make a real difference in daily operations.',
        ],
      ],
      ctaId: 'create-your-free-qr-menu',
      ctaTitle: 'Create your free QR menu with App Menu QR',
      ctaParagraphs: [
        [
          'If you want a simple way to digitize the menu for your restaurant, bar, or cafe, App Menu QR lets you create a customized menu, organize products, and keep information up to date.',
        ],
        ['You do not need technical skills to get started.'],
      ],
      ctaLabel: 'Create your free QR menu with App Menu QR',
      ctaHref: REGISTER_HREF,
    };
  }

  return {
    lead: [
      'Digitalizar la carta de un restaurante es una forma práctica de facilitar el acceso a los productos, mantener los precios actualizados y mejorar la experiencia de los clientes.',
    ],
    tocLabel: 'En este artículo',
    toc: [
      { href: '#que-es-un-menu-pdf', label: 'Qué es un menú en PDF' },
      { href: '#que-es-un-menu-qr-dinamico', label: 'Qué es un menú QR dinámico' },
      { href: '#menu-qr-vs-pdf-diferencias', label: 'Principales diferencias' },
      { href: '#razones-elegir-menu-qr', label: '5 razones para elegir un menú QR' },
      { href: '#cuando-conviene-menu-pdf', label: 'Cuándo conviene un menú en PDF' },
      { href: '#pasar-de-pdf-a-menu-qr', label: 'Cómo pasar de PDF a menú QR' },
      { href: '#preguntas-frecuentes-menu-qr-pdf', label: 'Preguntas frecuentes' },
      { href: '#conclusion-menu-qr-vs-pdf', label: 'Conclusión' },
    ],
    blocks: [
      {
        type: 'p',
        content: [
          'Sin embargo, cuando llega el momento de elegir una solución, aparece una pregunta frecuente: ',
          { strong: '¿es mejor utilizar un menú QR dinámico o una carta en PDF?' },
        ],
      },
      {
        type: 'p',
        content: [
          'Aunque ambas opciones permiten consultar el menú desde un teléfono móvil, existen diferencias importantes en la forma de actualizar la información, personalizar el diseño y gestionar los productos.',
        ],
      },
      {
        type: 'p',
        content: [
          'En este artículo comparamos las ventajas y limitaciones de cada alternativa para ayudarte a elegir la más adecuada para tu restaurante, bar o cafetería.',
        ],
      },
      {
        type: 'h2',
        id: 'que-es-un-menu-pdf',
        text: '¿Qué es un menú digital en PDF?',
      },
      {
        type: 'p',
        content: [
          'Un menú en PDF es una versión digital de la carta de un restaurante, generalmente creada con herramientas de diseño o programas de edición de documentos.',
        ],
      },
      {
        type: 'p',
        content: [
          'El archivo puede compartirse mediante un enlace, enviarse por mensajería o abrirse al escanear un código QR.',
        ],
      },
      {
        type: 'p',
        content: [
          'Es una opción bastante utilizada porque permite aprovechar el diseño de una carta que ya existe, sin tener que crear una nueva presentación desde cero.',
        ],
      },
      { type: 'h3', text: 'Ventajas de utilizar una carta en PDF' },
      {
        type: 'ul',
        items: [
          [
            { strong: 'Diseño personalizado:' },
            ' permite crear documentos con fotografías, colores, tipografías y elementos gráficos.',
          ],
          [
            { strong: 'Fácil de compartir:' },
            ' el archivo puede enviarse por correo electrónico, mensajería o mediante un enlace.',
          ],
          [
            { strong: 'Compatible con diferentes dispositivos:' },
            ' la mayoría de los teléfonos y computadoras pueden abrir archivos PDF.',
          ],
          [
            { strong: 'Posibilidad de impresión:' },
            ' el mismo documento puede utilizarse para producir cartas físicas.',
          ],
        ],
      },
      { type: 'h3', text: 'Desventajas de un menú en PDF' },
      {
        type: 'p',
        content: [
          'Aunque resulta práctico para determinados negocios, también presenta algunas limitaciones.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Puede ser incómodo de leer desde el teléfono.' },
          ' Si el documento fue diseñado para imprimirse en una hoja grande, los clientes posiblemente tengan que ampliar la pantalla y desplazarse horizontalmente para consultar los productos.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Actualizar los precios puede requerir más trabajo.' },
          ' Cuando cambia un precio o se incorpora un plato, generalmente es necesario modificar el documento original, exportarlo nuevamente y reemplazar el archivo publicado.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'La gestión de productos es menos flexible.' },
          ' Ocultar temporalmente un producto agotado o modificar una descripción implica editar el documento en lugar de hacerlo desde un panel de administración.',
        ],
      },
      {
        type: 'p',
        content: [
          'Estas dificultades pueden convertirse en un inconveniente para restaurantes que actualizan sus cartas con frecuencia.',
        ],
      },
      {
        type: 'h2',
        id: 'que-es-un-menu-qr-dinamico',
        text: '¿Qué es un menú QR dinámico?',
      },
      {
        type: 'p',
        content: [
          'Un menú QR dinámico permite acceder a una carta digital que puede actualizarse sin necesidad de cambiar el código QR utilizado por los clientes.',
        ],
      },
      {
        type: 'p',
        content: [
          'En lugar de presentar un documento estático, plataformas como ',
          { strong: 'App Menu QR' },
          ' permiten crear un menú digital con categorías, productos, descripciones, fotografías y precios que pueden administrarse desde una misma herramienta.',
        ],
      },
      {
        type: 'p',
        content: [
          'De esta manera, el restaurante puede modificar su oferta sin tener que rediseñar un archivo cada vez que necesita realizar un cambio.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por ejemplo, si un plato deja de estar disponible o cambia de precio, el negocio puede actualizar esa información rápidamente desde el móvil o una PC utilizando el panel de administración y editarlo en unos pocos segundos.',
        ],
      },
      {
        type: 'p',
        content: [
          'Cuando el cliente vuelva a escanear el código QR, accederá a la carta con los cambios realizados.',
        ],
      },
      {
        type: 'p',
        content: [
          'Es importante aclarar que un código QR también puede dirigir a un PDF. La diferencia principal está en ',
          { strong: 'cómo se presenta y administra el contenido' },
          ', no simplemente en el uso de un código QR.',
        ],
      },
      {
        type: 'h2',
        id: 'menu-qr-vs-pdf-diferencias',
        text: 'Menú QR vs. PDF: principales diferencias',
      },
      {
        type: 'p',
        content: [
          'Para comprender mejor las ventajas de cada alternativa, veamos una comparación práctica entre una carta tradicional en PDF y un menú QR administrado desde una plataforma especializada.',
        ],
      },
      {
        type: 'table',
        headers: ['Característica', 'Menú en PDF', 'Menú QR dinámico'],
        rows: [
          [
            'Actualización de precios',
            'Requiere editar el documento y volver a subir el archivo al servidor respetando el mismo nombre de archivo para que siga funcionando el QR',
            'Se modifica desde el panel de gestión en pocos clics',
          ],
          ['Diseño para teléfonos', 'Depende del diseño del PDF', 'Se adapta el tamaño a la resolución de cada dispositivo móvil'],
          ['Agregar productos', 'Requiere modificar el archivo', 'Se agregan desde la plataforma'],
          [
            'Ocultar productos agotados',
            'Requiere editar el PDF y volver a subir el archivo. Muy difícil de hacer en tiempo real.',
            'Puede gestionarse desde el menú en pocos segundos y en tiempo real',
          ],
          [
            'Fotografías',
            'Integradas en el documento',
            'Asociadas a cada producto: puedes sacar las fotos directamente desde tu móvil al momento de actualizar la carta o seleccionarlas desde cualquier dispositivo',
          ],
          [
            'Organización por categorías',
            'Habitualmente estática',
            'Navegación mediante secciones. El menú muestra las categorías y el cliente elige cuál quiere ver (Entradas, Principales, Bebidas, etc.)',
          ],
          ['Personalización', 'Mediante herramientas de diseño', 'Mediante opciones de la plataforma'],
          [
            'Impresión',
            'Puede imprimirse directamente',
            'Depende de las funciones disponibles. Appmenuqr.com te permite imprimir tu carta digital en papel para administrar todo desde un mismo lugar',
          ],
          ['Mantenimiento', 'Manual, mediante archivos', 'Centralizado en un panel'],
        ],
      },
      {
        type: 'p',
        content: [
          {
            strong:
              'La principal ventaja del menú QR dinámico es la facilidad para mantener la carta actualizada sin tener que editar y publicar un documento completo.',
          },
        ],
      },
      {
        type: 'p',
        content: [
          'Esto no significa que el PDF sea una mala opción. La elección dependerá de cómo funciona cada negocio y de la frecuencia con la que necesita modificar su oferta.',
        ],
      },
      {
        type: 'h2',
        id: 'razones-elegir-menu-qr',
        text: '5 razones para elegir un menú QR dinámico en tu restaurante',
      },
      { type: 'h3', text: '1. Cambia los precios sin imprimir ni rediseñar la carta' },
      {
        type: 'p',
        content: [
          'Los precios de los productos pueden variar por cambios en los costos, promociones o ajustes comerciales.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con una carta en PDF, normalmente es necesario modificar el documento y publicar la nueva versión.',
        ],
      },
      {
        type: 'p',
        content: [
          'En cambio, con un menú QR dinámico puedes entrar al panel de administración, cambiar el precio y guardar la modificación.',
        ],
      },
      {
        type: 'p',
        content: ['El código QR que ya se encuentra en las mesas sigue siendo válido.'],
      },
      {
        type: 'image',
        src: '/blog/menu-qr-vs-pdf-editar-producto.jpg',
        alt: 'Panel de App Menu QR para editar un producto: nombre, descripción y precio sin rediseñar un PDF',
        width: 1000,
        height: 1022,
        caption: 'Actualiza un producto y su precio desde el panel de administración en pocos clics.',
      },
      { type: 'h3', text: '2. Agrega o modifica productos fácilmente' },
      {
        type: 'p',
        content: [
          'Los restaurantes suelen incorporar platos de temporada, nuevas bebidas o propuestas especiales.',
        ],
      },
      {
        type: 'p',
        content: [
          'Un menú digital administrable permite agregar productos sin tener que reorganizar manualmente el diseño de un documento.',
        ],
      },
      {
        type: 'image',
        src: '/blog/menu-qr-vs-pdf-edicion-menu.jpg',
        alt: 'Editor de menú en App Menu QR con productos organizados por secciones como cortes a la parrilla y parrilladas',
        width: 1024,
        height: 728,
        caption: 'Organiza los productos por categorías y gestiona toda la carta desde un mismo lugar.',
      },
      {
        type: 'p',
        content: [
          'También puedes modificar las descripciones, actualizar las fotografías y reorganizar las categorías según las necesidades del negocio.',
        ],
      },
      {
        type: 'image',
        src: '/blog/menu-qr-vs-pdf-foto-producto.jpg',
        alt: 'Herramienta para recortar la foto de un producto en App Menu QR, con guardado en WebP',
        width: 1024,
        height: 700,
        caption: 'Saca o selecciona la foto del producto y ajusta el encuadre antes de publicarla en la carta.',
      },
      { type: 'h3', text: '3. Oculta productos que no están disponibles' },
      {
        type: 'p',
        content: [
          'Imagina que uno de los platos más solicitados se agota durante el servicio.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si utilizas una carta impresa o un PDF, es posible que el producto siga apareciendo y que los clientes continúen solicitándolo.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con una plataforma que permita gestionar la visibilidad de los productos, puedes ocultarlo temporalmente y volver a mostrarlo cuando esté disponible.',
        ],
      },
      {
        type: 'p',
        content: [
          'Esto ayuda a evitar confusiones y mejora la comunicación entre el negocio y sus clientes.',
        ],
      },
      { type: 'h3', text: '4. Ofrece una mejor experiencia desde el teléfono' },
      {
        type: 'p',
        content: [
          'La mayoría de los clientes que escanean un código QR consultan la carta desde su teléfono móvil.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por eso, es importante que la información sea clara, que los textos tengan un tamaño adecuado y que los productos sean fáciles de encontrar.',
        ],
      },
      {
        type: 'p',
        content: [
          'Un menú digital diseñado para dispositivos móviles puede mostrar las categorías de manera organizada, permitiendo navegar por la carta sin tener que ampliar constantemente la pantalla.',
        ],
      },
      {
        type: 'p',
        content: [
          'Esto es especialmente útil cuando el restaurante ofrece una gran variedad de productos.',
        ],
      },
      { type: 'h3', text: '5. Personaliza el diseño de tu menú' },
      {
        type: 'p',
        content: [
          'La carta forma parte de la identidad visual de un restaurante.',
        ],
      },
      {
        type: 'p',
        content: [
          'Los colores, las tipografías, las fotografías y la distribución de los productos ayudan a transmitir el estilo del establecimiento.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con App Menu QR puedes seleccionar diferentes ',
          { link: 'plantillas', href: templatesHref },
          ' y personalizar elementos visuales para adaptar el menú a tu negocio.',
        ],
      },
      {
        type: 'p',
        content: [
          'Además, puedes realizar cambios de diseño sin necesidad de modificar individualmente todos tus productos.',
        ],
      },
      {
        type: 'h2',
        id: 'cuando-conviene-menu-pdf',
        text: '¿Cuándo conviene utilizar un menú en PDF?',
      },
      {
        type: 'p',
        content: [
          'Aunque un menú QR dinámico ofrece mayor flexibilidad para la administración diaria, existen situaciones en las que una carta en PDF puede ser suficiente.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por ejemplo, un establecimiento con una oferta pequeña y precios que prácticamente no cambian podría utilizar un PDF sin mayores inconvenientes.',
        ],
      },
      {
        type: 'p',
        content: [
          'También puede ser útil cuando el negocio necesita compartir una carta con un diseño muy específico o un documento preparado para imprimir.',
        ],
      },
      {
        type: 'p',
        content: [
          'Incluso es posible combinar ambas alternativas: utilizar un menú QR dinámico para la consulta habitual y mantener una versión impresa para los clientes que prefieran una carta tradicional.',
        ],
      },
      {
        type: 'image',
        src: '/blog/menu-qr-vs-pdf-imprimir-carta.jpg',
        alt: 'Opciones de impresión en App Menu QR con vista previa de la carta en papel de La parrilla de Pocho',
        width: 1024,
        height: 656,
        caption:
          'Imprime una versión en papel de tu carta digital desde el mismo panel para mantener ambos formatos alineados.',
      },
      {
        type: 'p',
        content: [
          {
            strong:
              'La mejor solución no siempre es eliminar el papel o los archivos PDF, sino elegir el formato que facilite el trabajo del negocio y la experiencia del cliente.',
          },
        ],
      },
      {
        type: 'h2',
        id: 'pasar-de-pdf-a-menu-qr',
        text: '¿Cómo pasar de una carta en PDF a un menú QR dinámico?',
      },
      {
        type: 'p',
        content: [
          'Si actualmente utilizas una carta en PDF y quieres comenzar a gestionar tus productos de forma más flexible, puedes dar el siguiente paso sin necesidad de conocimientos técnicos.',
        ],
      },
      {
        type: 'p',
        content: ['Con App Menu QR, el proceso es sencillo:'],
      },
      {
        type: 'ol',
        items: [
          [
            { strong: 'Crea una cuenta gratuita' },
            ' y configura los datos principales de tu restaurante.',
          ],
          [
            { strong: 'Crea tu menú' },
            ' y organiza los productos en categorías, como entradas, platos principales, bebidas y postres.',
          ],
          [
            { strong: 'Agrega tus productos' },
            ', incluyendo nombres, descripciones, precios y fotografías.',
          ],
          [
            { strong: 'Selecciona una plantilla' },
            ' y personaliza los colores y las tipografías.',
          ],
          [
            { strong: 'Descarga tu código QR' },
            ' y colócalo en las mesas o en otros lugares visibles de tu establecimiento.',
          ],
        ],
      },
      {
        type: 'p',
        content: [
          'Una vez configurado, podrás administrar tu carta desde la plataforma y realizar cambios cuando lo necesites.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si quieres conocer el proceso completo, puedes consultar nuestra guía: ',
          {
            link: 'Cómo crear un menú QR gratis para tu restaurante paso a paso',
            href: guideHref,
          },
          '.',
        ],
      },
    ],
    faqId: 'preguntas-frecuentes-menu-qr-pdf',
    faqHeading: 'Preguntas frecuentes sobre menús QR y PDF',
    faqs: [
      {
        question: '¿Un menú QR es lo mismo que un PDF con código QR?',
        answer:
          'No necesariamente. Un código QR puede abrir un documento PDF o una página web. Un menú QR administrado desde una plataforma especializada permite gestionar los productos, precios y categorías de manera independiente, sin tener que editar un documento completo.',
      },
      {
        question: '¿Puedo actualizar mi carta sin cambiar el código QR?',
        answer:
          'Sí. Si utilizas un menú QR dinámico como el de App Menu QR, puedes modificar los productos y precios sin cambiar el código impreso. También puede hacerse con un QR que apunta a una dirección fija donde se reemplaza el PDF, aunque el proceso de edición suele ser menos práctico.',
      },
      {
        question: '¿Necesito conocimientos técnicos para crear un menú QR?',
        answer:
          'No. Con App Menu QR puedes crear tu menú digital utilizando un panel de administración, sin necesidad de programar ni diseñar una página web.',
      },
      {
        question: '¿Los clientes necesitan descargar una aplicación?',
        answer:
          'No. Los clientes pueden escanear el código QR con la cámara del teléfono y acceder al menú desde su navegador.',
      },
      {
        question: '¿Es posible tener un menú digital y una carta impresa al mismo tiempo?',
        answer:
          'Sí. Ambas opciones pueden complementarse. Puedes ofrecer un menú QR para quienes prefieran consultar la carta desde su teléfono y conservar algunas cartas impresas para otros clientes. Con App Menu QR puedes imprimir una versión de tu carta en papel para administrar tus productos desde un solo lugar y evitar inconsistencias entre la carta en papel y la carta digital.',
      },
    ],
    conclusionId: 'conclusion-menu-qr-vs-pdf',
    conclusionHeading: 'Conclusión: ¿es mejor un menú QR o una carta en PDF?',
    conclusionParagraphs: [
      [
        'Tanto el menú en PDF como el menú QR pueden ser herramientas útiles para presentar los productos de un restaurante.',
      ],
      [
        'Sin embargo, cuando el negocio necesita cambiar precios, actualizar platos o modificar su oferta con frecuencia, ',
        {
          strong:
            'un menú QR dinámico suele ofrecer una experiencia de gestión más sencilla y flexible',
        },
        '.',
      ],
      [
        'La posibilidad de actualizar la información desde un panel de administración, mantener el mismo código QR y adaptar el diseño a los dispositivos móviles puede representar una ventaja importante para el funcionamiento diario del establecimiento.',
      ],
    ],
    ctaId: 'crea-tu-menu-qr-gratis',
    ctaTitle: 'Crea tu menú QR gratis con App Menu QR',
    ctaParagraphs: [
      [
        'Si buscas una manera sencilla de digitalizar la carta de tu restaurante, bar o cafetería, App Menu QR te permite crear un menú personalizado, organizar tus productos y mantener la información actualizada.',
      ],
      ['No necesitas conocimientos técnicos para comenzar.'],
    ],
    ctaLabel: 'Crea tu menú QR gratis con App Menu QR',
    ctaHref: REGISTER_HREF,
  };
}

export function getBlogArticleMenuQrVsPdf(locale: BlogUiLocale): BlogMenuQrVsPdfArticle {
  const guideHref = blogArticleHref('como-crear-un-menu-qr-gratis', locale);
  const templatesHref = plantillasCatalogPath(locale);
  return article(locale, guideHref, templatesHref);
}
