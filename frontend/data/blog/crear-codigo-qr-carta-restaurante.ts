/**
 * Guía SEO: cómo crear un código QR para la carta del restaurante (ES + EN).
 */

import type { BlogUiLocale } from '../../lib/blog-nav';
import { blogArticleHref } from '../../lib/blog-nav';
import { funcionesHref } from '../../lib/funciones-nav';
import { plantillasCatalogPath } from '../../lib/plantillas-catalog-url';

export type BlogInline = string | { strong: string } | { em: string } | { link: string; href: string };

export type BlogBlock =
  | { type: 'p'; content: BlogInline[] }
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: BlogInline[][] }
  | { type: 'ol'; items: BlogInline[][] }
  | { type: 'note'; content: BlogInline[] }
  | { type: 'image'; src: string; alt: string; width: number; height: number; caption?: string };

export type BlogFaqItem = { question: string; answer: string };

export type BlogQrCodeArticle = {
  lead: BlogInline[];
  tocLabel: string;
  toc: { href: string; label: string }[];
  blocks: BlogBlock[];
  faqId: string;
  faqHeading: string;
  faqs: BlogFaqItem[];
  ctaId: string;
  ctaTitle: string;
  ctaParagraphs: BlogInline[][];
  ctaLabel: string;
  ctaHref: string;
};

const REGISTER_HREF = '/login?action=register';
const SUPPORT_HREF = '/soporte';

function doc(slug: string): string {
  return `/documentacion/${slug}`;
}

type Links = {
  home: string;
  templates: string;
  printFeature: string;
  dynamicFeature: string;
  guide: string;
  compare: string;
};

function article(locale: BlogUiLocale, links: Links): BlogQrCodeArticle {
  if (locale === 'en') {
    return {
      lead: [
        'Want guests to open your restaurant menu on their phone?',
      ],
      tocLabel: 'In this guide',
      toc: [
        { href: '#what-is-a-restaurant-qr-code', label: 'What a restaurant QR code is' },
        { href: '#create-a-free-qr-code', label: 'Create a free QR code' },
        { href: '#where-to-place-the-qr-code', label: 'Where to place it' },
        { href: '#qr-code-or-printed-menu', label: 'QR code or printed menu' },
        { href: '#how-to-print-a-qr-code', label: 'How to print a QR code' },
        { href: '#static-vs-dynamic-qr', label: 'Static vs. dynamic QR' },
        { href: '#change-prices-without-a-new-qr', label: 'Change prices without a new code' },
        { href: '#common-qr-mistakes', label: 'Common mistakes' },
        { href: '#qr-for-pdf-or-digital-menu', label: 'QR for a PDF or a digital menu' },
        { href: '#restaurant-qr-faq', label: 'Frequently asked questions' },
      ],
      blocks: [
        {
          type: 'p',
          content: [
            'Creating a ',
            { strong: 'QR code for your restaurant menu' },
            ' is a simple way for guests to open products, descriptions, and prices by scanning a code.',
          ],
        },
        {
          type: 'p',
          content: [
            'You can place it on tables, at the counter, or anywhere people can see it. Guests open the digital menu on their phone without installing an app.',
          ],
        },
        {
          type: 'p',
          content: [
            'You can also ',
            { strong: 'combine the QR code with a printed menu' },
            ', so the venue works for different guest preferences.',
          ],
        },
        {
          type: 'p',
          content: [
            'This guide explains ',
            { strong: 'how to generate a free QR code for your restaurant' },
            ', how to print it correctly, and how to keep the menu up to date.',
          ],
        },
        {
          type: 'h2',
          id: 'what-is-a-restaurant-qr-code',
          text: 'What is a QR code for restaurants?',
        },
        {
          type: 'p',
          content: [
            'A QR code is an image made of small squares that can store information, such as a link to a web page.',
          ],
        },
        {
          type: 'p',
          content: [
            'In a restaurant, that code can send guests to a digital menu with available products, descriptions, prices, and photos.',
          ],
        },
        {
          type: 'p',
          content: ['It works like this:'],
        },
        {
          type: 'ol',
          items: [
            ['The guest opens the phone camera.'],
            ['They point it at the QR code on the table.'],
            ['They tap the link that appears on the screen.'],
            ['They open the restaurant’s digital menu.'],
          ],
        },
        {
          type: 'p',
          content: [
            'On most current phones, no extra app is required.',
          ],
        },
        {
          type: 'image',
          src: '/blog/crear-codigo-qr-carta-telefono.jpg',
          alt: 'Guest scanning a table QR code and opening the digital menu on a phone',
          width: 900,
          height: 720,
          caption: 'After the scan, the menu opens on the phone with sections, photos, and prices.',
        },
        {
          type: 'p',
          content: [
            'Restaurants, bars, cafes, quick-service venues, and other food businesses can use it to share products digitally.',
          ],
        },
        {
          type: 'h2',
          id: 'create-a-free-qr-code',
          text: 'How to create a free QR code for your restaurant menu',
        },
        {
          type: 'p',
          content: [
            'To generate a QR code you need a web address to send guests to.',
          ],
        },
        {
          type: 'p',
          content: [
            'That address can be a PDF published online or a platform built for digital menus.',
          ],
        },
        {
          type: 'p',
          content: [
            'If you want to manage products and prices easily, ',
            { link: 'App Menu QR', href: links.home },
            ' lets you build the digital menu and get the QR code in the same place.',
          ],
        },
        { type: 'h3', text: 'Step 1. Create your account and set up the restaurant' },
        {
          type: 'p',
          content: [
            'Go to ',
            { link: 'App Menu QR', href: links.home },
            ' and ',
            { link: 'create a free account', href: REGISTER_HREF },
            '.',
          ],
        },
        {
          type: 'p',
          content: [
            'After you sign up, add the main business details: name, description, and contact information. You can also upload your logo, choose currencies, and pick a menu template. The steps are in ',
            { link: 'Create a business', href: doc('crear-restaurante') },
            '.',
          ],
        },
        { type: 'h3', text: 'Step 2. Create your digital menu' },
        {
          type: 'p',
          content: [
            'Next, ',
            { link: 'create your first menu', href: doc('crear-menu') },
            ' and organize it into ',
            { link: 'categories', href: doc('crear-secciones') },
            ' so guests can browse it.',
          ],
        },
        {
          type: 'p',
          content: ['A restaurant might use:'],
        },
        {
          type: 'ul',
          items: [
            ['Starters'],
            ['Main courses'],
            ['Burgers'],
            ['Drinks'],
            ['Desserts'],
          ],
        },
        {
          type: 'p',
          content: [
            'A cafe might group coffee, tea, breakfast, pastries, and cold drinks. Clear section names help people find what they want.',
          ],
        },
        { type: 'h3', text: 'Step 3. Add products and prices' },
        {
          type: 'p',
          content: [
            'Add the products you want on the digital menu. For each one, enter the name, description, and price. Depending on your plan, you can also add photos and extra design options. See ',
            { link: 'Create products', href: doc('crear-productos') },
            '.',
          ],
        },
        {
          type: 'p',
          content: ['For example:'],
        },
        {
          type: 'note',
          content: [
            { strong: 'Margherita pizza' },
            ' — Artisan pizza with tomato sauce, fresh mozzarella, basil, and olive oil.',
          ],
        },
        {
          type: 'p',
          content: [
            'A clear description helps guests understand what each dish includes.',
          ],
        },
        { type: 'h3', text: 'Step 4. Customize the menu design' },
        {
          type: 'p',
          content: [
            'Before you download the QR code, match the digital menu to your restaurant’s identity. In App Menu QR you can choose a ',
            { link: 'template', href: links.templates },
            ' and set colors and fonts. The setup is explained in ',
            { link: 'Design templates', href: doc('plantillas') },
            '.',
          ],
        },
        {
          type: 'p',
          content: [
            'Use readable text, strong contrast, and a simple structure. Most guests will open the menu on a phone, so it needs to work on a small screen.',
          ],
        },
        { type: 'h3', text: 'Before you continue: check that the menu is published' },
        {
          type: 'p',
          content: [
            'Before you download the QR code, make sure the menu is published and available. You can check that in the App Menu QR admin panel. If the menu is not published, guests will not see it when they scan the code. Follow ',
            { link: 'Publish the menu', href: doc('publicar-menu') },
            '.',
          ],
        },
        { type: 'h3', text: 'Step 5. Download your QR code' },
        {
          type: 'p',
          content: [
            'Once the digital menu is ready, you can get the QR code for the business. Open the ',
            { strong: 'App Menu QR dashboard' },
            ', where the venue card shows the QR code. The full steps are in ',
            { link: 'Download the QR code', href: doc('descargar-qr') },
            '.',
          ],
        },
        {
          type: 'p',
          content: ['From there you can:'],
        },
        {
          type: 'ul',
          items: [
            [{ strong: 'Open the business link:' }, ' the web address of your digital menu.'],
            [{ strong: 'Preview the menu:' }, ' see what guests will get when they scan the code.'],
            [{ strong: 'Download the QR code:' }, ' save it to print or add to your materials.'],
          ],
        },
        {
          type: 'p',
          content: [
            'After you download it, use it on table cards, stickers, counter stands, or posters. You can also send the file to a designer or a print shop so they can place it on menus, promotions, or signs.',
          ],
        },
        {
          type: 'p',
          content: [
            'The code needs a readable size, enough contrast, and clear space around it so phones can scan it.',
          ],
        },
        { type: 'h3', text: 'Step 6. Print the QR code and place it in the restaurant' },
        {
          type: 'p',
          content: [
            'Place the QR code where guests can actually use it. Before a large print run, test one copy and scan it with different phones. Check that the link opens the digital menu and that products, prices, and descriptions look right.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'Need help?' },
            ' If something looks wrong, you want to adjust the design, or you have a question about the platform, contact App Menu QR support from the ',
            { link: 'Support', href: SUPPORT_HREF },
            ' section in your profile.',
          ],
        },
        {
          type: 'p',
          content: [
            'Your QR code is ready to share the menu. For a fuller walkthrough of the business setup and product organization, see ',
            {
              link: 'How to create a free QR menu for your restaurant, step by step',
              href: links.guide,
            },
            '.',
          ],
        },
        {
          type: 'h2',
          id: 'where-to-place-the-qr-code',
          text: 'Where should you place the QR code in a restaurant?',
        },
        {
          type: 'p',
          content: [
            'Placement matters so guests can find the code and scan it without trouble. These are common options.',
          ],
        },
        { type: 'h3', text: 'On the tables' },
        {
          type: 'p',
          content: [
            'This is one of the most practical options. Put the QR code on a small card, an acrylic stand, or a sticker so each guest can open the menu on their phone.',
          ],
        },
        {
          type: 'image',
          src: '/blog/crear-codigo-qr-soporte-mesa.jpg',
          alt: 'Acrylic table stand with a restaurant menu QR code',
          width: 900,
          height: 720,
          caption: 'A table stand keeps the QR code visible and easy to scan.',
        },
        { type: 'h3', text: 'At the counter' },
        {
          type: 'p',
          content: [
            'In bars, cafes, and takeaway spots, a QR near the register lets people browse products while they wait.',
          ],
        },
        { type: 'h3', text: 'At the entrance' },
        {
          type: 'p',
          content: [
            'A QR code at the door lets people review the menu before they walk in. It is useful for showing dishes, drinks, and prices.',
          ],
        },
        { type: 'h3', text: 'On promotional materials' },
        {
          type: 'p',
          content: [
            'You can also add the QR code to flyers, cards, posters, and other printed promotions so people can open the digital menu directly.',
          ],
        },
        {
          type: 'h2',
          id: 'qr-code-or-printed-menu',
          text: 'Is a QR code better than a printed menu?',
        },
        {
          type: 'p',
          content: [
            'You do not have to choose one format. ',
            { strong: 'Both can work together' },
            ' and give guests a better experience.',
          ],
        },
        {
          type: 'p',
          content: [
            'The QR code opens products and prices on the phone. A printed menu still helps people who prefer paper.',
          ],
        },
        {
          type: 'image',
          src: '/blog/crear-codigo-qr-impresa-y-digital.jpg',
          alt: 'Printed restaurant menu next to a phone showing the same offer as a digital menu',
          width: 900,
          height: 720,
          caption: 'The printed menu and the QR menu can be offered at the same table.',
        },
        {
          type: 'p',
          content: ['Keeping both can help in several situations:'],
        },
        {
          type: 'ul',
          items: [
            [{ strong: 'Guest preferences:' }, ' some people are more comfortable with a printed menu.'],
            [{ strong: 'Accessibility:' }, ' more than one format adapts better to different needs.'],
            [
              { strong: 'Connection or device issues:' },
              ' a paper menu still works if a phone has no battery, no signal, or is not available.',
            ],
            [
              { strong: 'Venue requirements:' },
              ' some businesses need physical menus for operations or local rules.',
            ],
            [
              { strong: 'Restaurant presentation:' },
              ' a well-designed printed menu can also be part of the venue’s identity.',
            ],
          ],
        },
        { type: 'h3', text: 'Can I print my menu with App Menu QR?' },
        {
          type: 'p',
          content: [
            'Yes. Besides a digital menu opened with a QR code, ',
            { strong: 'App Menu QR includes a way to print your menus' },
            '. You can generate a print-ready version and choose how sections are laid out: each category on a new page, or one continuous flow. The steps are in ',
            { link: 'Print the menu on paper', href: doc('imprimir-carta') },
            '. You can also see the feature on ',
            { link: 'print your menu', href: links.printFeature },
            '.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'The advantage is having more than one way to present the menu, without depending on only one of them.' },
          ],
        },
        {
          type: 'h2',
          id: 'how-to-print-a-qr-code',
          text: 'How to print a QR code so it scans correctly',
        },
        {
          type: 'p',
          content: [
            'A phone camera has to recognize the code easily. These details improve readability:',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'Use a suitable size.' },
            ' For short distances, about 3 × 3 centimeters can be a starting point. The right size still depends on reading distance and print quality.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'Keep strong contrast.' },
            ' A dark code on a light background is the safest option.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'Leave a quiet zone.' },
            ' Keep clear space around the QR code so phones can detect it.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'Avoid glossy surfaces.' },
            ' Highly reflective materials can make scanning harder when light hits them.',
          ],
        },
        {
          type: 'p',
          content: [
            'A short instruction helps, for example: ',
            { em: 'Scan to view our menu' },
            '.',
          ],
        },
        {
          type: 'h2',
          id: 'static-vs-dynamic-qr',
          text: 'What is the difference between a static and a dynamic QR code?',
        },
        {
          type: 'p',
          content: [
            'They can look the same, but they do not work the same way.',
          ],
        },
        { type: 'h3', text: 'Static QR code' },
        {
          type: 'p',
          content: [
            'A static QR code stores fixed information, such as a web address. Once it is generated, that encoded information cannot be changed.',
          ],
        },
        {
          type: 'p',
          content: [
            'If that address points to a page whose content you can update, the same printed code keeps working and shows the new information.',
          ],
        },
        { type: 'h3', text: 'Dynamic QR code' },
        {
          type: 'p',
          content: [
            'A dynamic QR code, in the technical sense, usually uses an intermediate address so you can change the destination without reprinting the code. That helps when you need to point the code to a different page.',
          ],
        },
        {
          type: 'p',
          content: [
            'For digital menus, ',
            { em: 'dynamic QR menu' },
            ' often means a menu whose content can be updated without changing the code. See ',
            { link: 'dynamic QR menus', href: links.dynamicFeature },
            '.',
          ],
        },
        {
          type: 'p',
          content: [
            { strong: 'For a restaurant, the important part is being able to change products and prices without generating and printing a new QR code every time something changes.' },
          ],
        },
        {
          type: 'h2',
          id: 'change-prices-without-a-new-qr',
          text: 'Can I change prices without printing another QR code?',
        },
        {
          type: 'p',
          content: [
            'Yes. With App Menu QR you can update products and prices in the admin panel and keep the same QR code.',
          ],
        },
        {
          type: 'p',
          content: [
            'If you need to change a burger price, add a drink, or hide a product for a while, you do it in the platform. The next time a guest opens the menu on their phone, they see the updated information.',
          ],
        },
        {
          type: 'p',
          content: [
            'That is one of the main advantages of a managed digital menu. If you also use printed menus, you can generate a new paper version when you need it.',
          ],
        },
        {
          type: 'h2',
          id: 'common-qr-mistakes',
          text: 'Common mistakes when using QR codes in restaurants',
        },
        {
          type: 'p',
          content: [
            'Creating a QR code is simple, but a few mistakes can hurt the guest experience.',
          ],
        },
        { type: 'h3', text: 'Printing the code too small' },
        {
          type: 'p',
          content: [
            'If the size is too small, phones may fail to read it. Make sure it scans comfortably from a normal distance.',
          ],
        },
        { type: 'h3', text: 'Not checking the link' },
        {
          type: 'p',
          content: [
            'Before you put it on the tables, confirm that the address works and the menu is reachable.',
          ],
        },
        { type: 'h3', text: 'Sending people to a hard-to-read menu' },
        {
          type: 'p',
          content: [
            'The QR code can scan perfectly and still lead to a menu with tiny text or awkward navigation. That experience is still poor.',
          ],
        },
        { type: 'h3', text: 'Leaving prices out of date' },
        {
          type: 'p',
          content: [
            'The digital menu should match the restaurant’s products and prices. Updating it regularly avoids confusion.',
          ],
        },
        { type: 'h3', text: 'Putting the QR where people cannot see it' },
        {
          type: 'p',
          content: [
            'Avoid dim spots, strong reflections, and surfaces where the code will wear out quickly.',
          ],
        },
        {
          type: 'h2',
          id: 'qr-for-pdf-or-digital-menu',
          text: 'Is it better to create a QR for a PDF or to use a digital menu?',
        },
        {
          type: 'p',
          content: [
            'Both options can share a menu through a QR code, but they are managed differently.',
          ],
        },
        {
          type: 'p',
          content: [
            'A PDF can be enough for a small menu that rarely changes. If you often change prices, manage categories, add products, or adjust the design, a dedicated platform is usually more practical.',
          ],
        },
        {
          type: 'p',
          content: [
            'For a closer comparison, read ',
            {
              link: 'QR menu vs. PDF: which is the better option for your restaurant?',
              href: links.compare,
            },
            '.',
          ],
        },
      ],
      faqId: 'restaurant-qr-faq',
      faqHeading: 'Frequently asked questions about restaurant QR codes',
      faqs: [
        {
          question: 'Can I create a QR code for a restaurant for free?',
          answer:
            'Yes. There are free tools to generate QR codes. You can also use a platform such as App Menu QR to create a digital menu with its QR code, within the features of the free plan.',
        },
        {
          question: 'Do I need my own website?',
          answer:
            'No. You do not need to build your own website. With App Menu QR you create the digital menu and share it with its QR code.',
        },
        {
          question: 'Do guests need to install an app?',
          answer:
            'No. On most modern phones, guests scan the QR code with the camera and open the menu in the browser.',
        },
        {
          question: 'Does the QR code stop working if I change prices?',
          answer:
            'No. If you change prices in App Menu QR, the QR code keeps working and opens the updated menu.',
        },
        {
          question: 'Can I print the same QR code more than once?',
          answer:
            'Yes. You can use the same QR code on different tables, posters, or promotional materials, as long as you want guests to open the same digital menu.',
        },
        {
          question: 'What size should a printed QR code be?',
          answer:
            'It depends on the reading distance and the design. For a card on a table, start around 3 × 3 centimeters and make it larger if needed.',
        },
        {
          question: 'Can I offer a digital menu and a printed menu at the same time?',
          answer:
            'Yes. Both formats can work together. With App Menu QR you can share the menu with a QR code and also use the print feature for a paper version.',
        },
      ],
      ctaId: 'create-your-qr-code',
      ctaTitle: 'Create your QR code and give guests more ways to read the menu',
      ctaParagraphs: [
        [
          'Generating a QR code for your restaurant is a simple way to let guests open the menu on their phone.',
        ],
        [
          'With App Menu QR you can create the digital menu, organize products, customize the design, and get a QR code to share.',
        ],
        [
          'You can also print the menu for people who prefer paper, and combine both formats.',
        ],
        [
          'When you need to update a price, add a product, or make a change, you do it in the platform without changing the QR code.',
        ],
      ],
      ctaLabel: 'Create your free digital menu with App Menu QR',
      ctaHref: REGISTER_HREF,
    };
  }

  return {
    lead: [
      '¿Quieres que tus clientes puedan consultar la carta de tu restaurante directamente desde su teléfono móvil?',
    ],
    tocLabel: 'En esta guía',
    toc: [
      { href: '#que-es-un-codigo-qr-para-restaurantes', label: 'Qué es un código QR para restaurantes' },
      { href: '#crear-codigo-qr-gratis', label: 'Crear un código QR gratis' },
      { href: '#donde-colocar-el-codigo-qr', label: 'Dónde colocar el código QR' },
      { href: '#codigo-qr-o-carta-impresa', label: 'Código QR o carta impresa' },
      { href: '#como-imprimir-un-codigo-qr', label: 'Cómo imprimir un código QR' },
      { href: '#codigo-qr-estatico-o-dinamico', label: 'QR estático o dinámico' },
      { href: '#cambiar-precios-sin-otro-qr', label: 'Cambiar precios sin otro código' },
      { href: '#errores-comunes-codigos-qr', label: 'Errores comunes' },
      { href: '#qr-para-pdf-o-carta-digital', label: 'QR para un PDF o carta digital' },
      { href: '#preguntas-frecuentes-codigo-qr', label: 'Preguntas frecuentes' },
    ],
    blocks: [
      {
        type: 'p',
        content: [
          'Crear un ',
          { strong: 'código QR para la carta de tu restaurante' },
          ' es una solución sencilla que permite acceder a tus productos, descripciones y precios con solo escanear un código.',
        ],
      },
      {
        type: 'p',
        content: [
          'Puedes colocarlo en las mesas, en el mostrador o en cualquier lugar visible de tu negocio. Así, los clientes podrán consultar la carta digital desde su teléfono móvil, sin necesidad de instalar aplicaciones.',
        ],
      },
      {
        type: 'p',
        content: [
          'Además, ',
          { strong: 'puedes combinar el código QR con una carta impresa' },
          ', ofreciendo ambas opciones para adaptarte a las preferencias de tus clientes y a las necesidades de tu establecimiento.',
        ],
      },
      {
        type: 'p',
        content: [
          'En esta guía te explicamos ',
          { strong: 'cómo generar un código QR para tu restaurante gratis' },
          ', cómo imprimirlo correctamente y qué debes tener en cuenta para mantener tu carta actualizada.',
        ],
      },
      {
        type: 'h2',
        id: 'que-es-un-codigo-qr-para-restaurantes',
        text: '¿Qué es un código QR para restaurantes?',
      },
      {
        type: 'p',
        content: [
          'Un código QR es una imagen formada por pequeños cuadrados que permite almacenar información, como un enlace a una página web.',
        ],
      },
      {
        type: 'p',
        content: [
          'En un restaurante, este código puede dirigir a los clientes hacia una carta digital con los productos disponibles, sus descripciones, precios y fotografías.',
        ],
      },
      {
        type: 'p',
        content: ['El funcionamiento es muy sencillo:'],
      },
      {
        type: 'ol',
        items: [
          ['El cliente abre la cámara de su teléfono móvil.'],
          ['Apunta hacia el código QR ubicado en la mesa.'],
          ['Toca el enlace que aparece en la pantalla.'],
          ['Accede directamente a la carta digital del restaurante.'],
        ],
      },
      {
        type: 'p',
        content: [
          'En la mayoría de los teléfonos móviles actuales, no es necesario descargar ninguna aplicación adicional.',
        ],
      },
      {
        type: 'image',
        src: '/blog/crear-codigo-qr-carta-telefono.jpg',
        alt: 'Cliente escaneando un código QR de mesa y consultando la carta digital en el teléfono',
        width: 900,
        height: 720,
        caption: 'Al escanear el código, la carta se abre en el teléfono con secciones, fotos y precios.',
      },
      {
        type: 'p',
        content: [
          'Esta tecnología puede utilizarse en restaurantes, bares, cafeterías, establecimientos de comida rápida y otros negocios que quieran compartir sus productos de forma digital.',
        ],
      },
      {
        type: 'h2',
        id: 'crear-codigo-qr-gratis',
        text: 'Cómo crear un código QR para la carta de tu restaurante gratis',
      },
      {
        type: 'p',
        content: [
          'Para generar un código QR necesitas una dirección web a la que dirigir a tus clientes.',
        ],
      },
      {
        type: 'p',
        content: [
          'Puedes utilizar un documento PDF publicado en internet o una plataforma especializada en cartas digitales.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si quieres administrar tus productos y precios fácilmente, una solución como ',
          { link: 'App Menu QR', href: links.home },
          ' te permite crear tu carta digital y obtener el código QR desde un mismo lugar.',
        ],
      },
      { type: 'h3', text: 'Paso 1. Crea tu cuenta y configura tu restaurante' },
      {
        type: 'p',
        content: [
          'Accede a ',
          { link: 'App Menu QR', href: links.home },
          ' y ',
          { link: 'crea una cuenta gratuita', href: REGISTER_HREF },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Una vez registrado, completa los datos principales de tu negocio, como el nombre, la descripción y la información de contacto. También puedes incorporar tu logotipo, seleccionar las divisas que utilizarás y elegir una plantilla para el diseño de tu carta. El detalle está en la guía ',
          { link: 'Crear un comercio', href: doc('crear-restaurante') },
          '.',
        ],
      },
      { type: 'h3', text: 'Paso 2. Crea tu carta digital' },
      {
        type: 'p',
        content: [
          'El siguiente paso consiste en ',
          { link: 'crear tu primer menú', href: doc('crear-menu') },
          ' y organizarlo en ',
          { link: 'categorías', href: doc('crear-secciones') },
          ' para facilitar la navegación.',
        ],
      },
      {
        type: 'p',
        content: ['Por ejemplo, un restaurante puede utilizar las siguientes secciones:'],
      },
      {
        type: 'ul',
        items: [
          ['Entradas'],
          ['Platos principales'],
          ['Hamburguesas'],
          ['Bebidas'],
          ['Postres'],
        ],
      },
      {
        type: 'p',
        content: [
          'Si tienes una cafetería, puedes organizar los productos en café, infusiones, desayunos, pastelería y bebidas frías. Lo importante es crear una estructura clara para que tus clientes encuentren rápidamente lo que buscan.',
        ],
      },
      { type: 'h3', text: 'Paso 3. Agrega tus productos y precios' },
      {
        type: 'p',
        content: [
          'Incorpora los productos que deseas mostrar en tu carta digital. Para cada producto puedes completar su nombre, descripción y precio. Según el plan que utilices, también podrás incorporar fotografías y acceder a opciones adicionales de personalización. Consulta ',
          { link: 'Crear productos', href: doc('crear-productos') },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['Por ejemplo:'],
      },
      {
        type: 'note',
        content: [
          { strong: 'Pizza Margarita' },
          ' — Pizza artesanal con salsa de tomate, mozzarella fresca, albahaca y aceite de oliva.',
        ],
      },
      {
        type: 'p',
        content: [
          'Una buena descripción ayuda a tus clientes a comprender qué incluye cada plato y facilita la elección.',
        ],
      },
      { type: 'h3', text: 'Paso 4. Personaliza el diseño de tu carta' },
      {
        type: 'p',
        content: [
          'Antes de descargar el código QR, puedes adaptar la apariencia de tu carta digital a la identidad de tu restaurante. Con App Menu QR puedes seleccionar una ',
          { link: 'plantilla', href: links.templates },
          ' y configurar elementos visuales como colores y tipografías. El proceso está en ',
          { link: 'Plantillas de diseño', href: doc('plantillas') },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Procura utilizar textos fáciles de leer, un buen contraste de colores y una organización sencilla. Recuerda que muchos clientes accederán a la carta desde su teléfono móvil, por lo que es importante que el contenido se visualice correctamente en pantallas pequeñas.',
        ],
      },
      { type: 'h3', text: 'Antes de continuar: verifica que tu menú esté publicado' },
      {
        type: 'p',
        content: [
          'Antes de descargar el código QR, asegúrate de que tu menú se encuentre publicado y disponible para tus clientes. Puedes comprobarlo desde el panel de administración de App Menu QR. Si tu menú no está publicado, los clientes no podrán consultarlo correctamente al escanear el código QR. Sigue los pasos de ',
          { link: 'Publicar el menú', href: doc('publicar-menu') },
          '.',
        ],
      },
      { type: 'h3', text: 'Paso 5. Descarga tu código QR' },
      {
        type: 'p',
        content: [
          'Una vez configurada tu carta digital, podrás obtener el código QR correspondiente a tu negocio. Dirígete al ',
          { strong: 'Dashboard de App Menu QR' },
          ', donde encontrarás la ficha de tu comercio junto con su código QR. La guía completa está en ',
          { link: 'Descargar código QR', href: doc('descargar-qr') },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['Desde allí tendrás diferentes opciones:'],
      },
      {
        type: 'ul',
        items: [
          [
            { strong: 'Acceder al enlace de tu comercio:' },
            ' abre la dirección web de tu carta digital.',
          ],
          [
            { strong: 'Previsualizar tu carta:' },
            ' comprueba cómo verán tus clientes el menú al escanear el código QR.',
          ],
          [
            { strong: 'Descargar el código QR:' },
            ' guarda el código para imprimirlo o incorporarlo en tus materiales.',
          ],
        ],
      },
      {
        type: 'p',
        content: [
          'Una vez descargado, puedes utilizarlo en tarjetas de mesa, adhesivos, soportes de mostrador o carteles. También puedes enviar el código QR a tu diseñador gráfico o a una imprenta para que lo incorporen al diseño de tus cartas, materiales promocionales o elementos de señalización.',
        ],
      },
      {
        type: 'p',
        content: [
          'Recuerda que el código QR debe tener un tamaño adecuado, suficiente contraste y espacio libre alrededor para que pueda escanearse fácilmente.',
        ],
      },
      { type: 'h3', text: 'Paso 6. Imprime y coloca el código QR en tu restaurante' },
      {
        type: 'p',
        content: [
          'Ahora solo necesitas colocar el código QR en los lugares donde tus clientes podrán utilizarlo. Antes de imprimir grandes cantidades, realiza una prueba de impresión y escanea el código con diferentes teléfonos móviles. Comprueba que el enlace abre tu carta digital y que los productos, precios y descripciones aparecen como esperabas.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: '¿Necesitas ayuda?' },
          ' Si encuentras algún error, quieres ajustar algún detalle del diseño o tienes dudas sobre el funcionamiento de la plataforma, puedes contactar con el equipo de soporte técnico de App Menu QR desde la sección ',
          { link: 'Soporte', href: SUPPORT_HREF },
          ' de tu perfil.',
        ],
      },
      {
        type: 'p',
        content: [
          'Tu código QR ya está preparado para compartir tu carta con los clientes. Si quieres conocer con más detalle cómo configurar tu negocio y organizar tus productos, consulta nuestra guía: ',
          {
            link: 'Cómo crear un menú QR gratis para tu restaurante paso a paso',
            href: links.guide,
          },
          '.',
        ],
      },
      {
        type: 'h2',
        id: 'donde-colocar-el-codigo-qr',
        text: '¿Dónde colocar el código QR en un restaurante?',
      },
      {
        type: 'p',
        content: [
          'La ubicación del código QR es importante para que tus clientes puedan encontrarlo y escanearlo sin dificultades. Estas son algunas de las opciones más habituales.',
        ],
      },
      { type: 'h3', text: 'En las mesas' },
      {
        type: 'p',
        content: [
          'Es una de las alternativas más prácticas. Puedes colocar el código QR en una pequeña tarjeta, un soporte acrílico o un adhesivo. Así, cada cliente podrá consultar la carta desde su teléfono móvil cuando lo necesite.',
        ],
      },
      {
        type: 'image',
        src: '/blog/crear-codigo-qr-soporte-mesa.jpg',
        alt: 'Soporte acrílico de mesa con el código QR de la carta de un restaurante',
        width: 900,
        height: 720,
        caption: 'Un soporte en la mesa deja el código QR visible y fácil de escanear.',
      },
      { type: 'h3', text: 'En el mostrador' },
      {
        type: 'p',
        content: [
          'En bares, cafeterías y establecimientos de comida para llevar, colocar el QR cerca de la caja permite que los clientes consulten los productos mientras esperan.',
        ],
      },
      { type: 'h3', text: 'En la entrada del establecimiento' },
      {
        type: 'p',
        content: [
          'Un código QR en la entrada permite revisar la carta antes de ingresar al restaurante. Esta opción puede resultar útil para mostrar la variedad de platos, bebidas y precios.',
        ],
      },
      { type: 'h3', text: 'En material promocional' },
      {
        type: 'p',
        content: [
          'También puedes incluir el código QR en folletos, tarjetas, carteles y otros materiales publicitarios. De esta manera, las personas interesadas podrán acceder directamente a tu carta digital.',
        ],
      },
      {
        type: 'h2',
        id: 'codigo-qr-o-carta-impresa',
        text: '¿Es mejor utilizar un código QR o una carta impresa?',
      },
      {
        type: 'p',
        content: [
          'No es necesario elegir entre una carta digital y una carta tradicional. ',
          { strong: 'Ambas opciones pueden complementarse' },
          ' y ofrecer una mejor experiencia a los clientes.',
        ],
      },
      {
        type: 'p',
        content: [
          'El código QR permite consultar los productos y precios desde el teléfono móvil, mientras que la carta impresa sigue siendo una alternativa útil para quienes prefieren un formato físico.',
        ],
      },
      {
        type: 'image',
        src: '/blog/crear-codigo-qr-impresa-y-digital.jpg',
        alt: 'Carta impresa de un restaurante junto a un teléfono con la misma oferta en formato digital',
        width: 900,
        height: 720,
        caption: 'La carta impresa y el menú QR pueden convivir en la misma mesa.',
      },
      {
        type: 'p',
        content: [
          'Mantener ambas opciones también puede resultar conveniente en distintas situaciones:',
        ],
      },
      {
        type: 'ul',
        items: [
          [
            { strong: 'Preferencias de los clientes:' },
            ' algunas personas se sienten más cómodas consultando una carta impresa.',
          ],
          [
            { strong: 'Accesibilidad:' },
            ' ofrecer diferentes formatos permite adaptarse mejor a las necesidades de cada cliente.',
          ],
          [
            { strong: 'Problemas de conexión o dispositivos:' },
            ' una carta física puede utilizarse cuando un cliente no tiene batería, conexión o un teléfono móvil disponible.',
          ],
          [
            { strong: 'Requisitos del establecimiento:' },
            ' algunos negocios necesitan mantener cartas físicas por cuestiones operativas o normativas locales.',
          ],
          [
            { strong: 'Presentación del restaurante:' },
            ' una carta impresa con un buen diseño también puede formar parte de la identidad y la experiencia del establecimiento.',
          ],
        ],
      },
      { type: 'h3', text: '¿Puedo imprimir mi carta con App Menu QR?' },
      {
        type: 'p',
        content: [
          'Sí. Además de crear una carta digital accesible mediante un código QR, ',
          { strong: 'App Menu QR cuenta con una función para imprimir tus cartas' },
          '. Puedes generar una versión preparada para impresión y elegir cómo organizar las secciones, ya sea comenzando cada categoría en una página nueva o presentándolas de manera continua. Los pasos están en ',
          { link: 'Imprimir la carta en papel', href: doc('imprimir-carta') },
          '. También puedes ver la función en ',
          { link: 'imprimir tu carta', href: links.printFeature },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          {
            strong:
              'La ventaja es tener diferentes formas de presentar la carta de tu negocio, sin depender exclusivamente de una de ellas.',
          },
        ],
      },
      {
        type: 'h2',
        id: 'como-imprimir-un-codigo-qr',
        text: 'Cómo imprimir un código QR para que funcione correctamente',
      },
      {
        type: 'p',
        content: [
          'Un código QR debe ser fácil de reconocer por la cámara del teléfono móvil. Para mejorar su legibilidad, ten en cuenta estas recomendaciones:',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Utiliza un tamaño adecuado.' },
          ' Para distancias cortas, un código de aproximadamente 3 × 3 centímetros puede funcionar como punto de partida. Sin embargo, el tamaño necesario depende de la distancia de lectura y las condiciones de impresión.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Mantén un buen contraste.' },
          ' Lo más recomendable es utilizar un código oscuro sobre un fondo claro.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Respeta el margen de seguridad.' },
          ' Deja suficiente espacio libre alrededor del código QR para facilitar su reconocimiento.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Evita superficies reflectantes.' },
          ' Los materiales con mucho brillo pueden dificultar el escaneo cuando hay reflejos de luz.',
        ],
      },
      {
        type: 'p',
        content: [
          'También es conveniente acompañarlo con una instrucción breve, por ejemplo: ',
          { em: 'Escanea para consultar nuestra carta' },
          '.',
        ],
      },
      {
        type: 'h2',
        id: 'codigo-qr-estatico-o-dinamico',
        text: '¿Qué diferencia hay entre un código QR estático y uno dinámico?',
      },
      {
        type: 'p',
        content: [
          'Aunque visualmente pueden parecer iguales, existen diferencias importantes.',
        ],
      },
      { type: 'h3', text: 'Código QR estático' },
      {
        type: 'p',
        content: [
          'Un código QR estático contiene información fija, como una dirección web. Una vez generado, no es posible modificar la información codificada.',
        ],
      },
      {
        type: 'p',
        content: [
          'Sin embargo, si esa dirección apunta a una página cuyo contenido puedes actualizar, el mismo código continuará funcionando y mostrará la información nueva.',
        ],
      },
      { type: 'h3', text: 'Código QR dinámico' },
      {
        type: 'p',
        content: [
          'Un código QR dinámico, en sentido técnico, suele utilizar una dirección intermedia que permite cambiar el destino del enlace sin modificar el código impreso. Esto ofrece mayor flexibilidad cuando necesitas dirigir el código QR hacia una página diferente.',
        ],
      },
      {
        type: 'p',
        content: [
          'En el caso de las cartas digitales, también es habitual utilizar la expresión ',
          { em: 'menú QR dinámico' },
          ' para describir una carta cuyo contenido puede actualizarse sin necesidad de cambiar el código. Puedes ver cómo funciona en ',
          { link: 'menú QR dinámico', href: links.dynamicFeature },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          {
            strong:
              'Para un restaurante, lo más importante es poder modificar los productos y precios sin tener que generar e imprimir un nuevo código QR cada vez que realiza un cambio.',
          },
        ],
      },
      {
        type: 'h2',
        id: 'cambiar-precios-sin-otro-qr',
        text: '¿Puedo cambiar los precios sin imprimir otro código QR?',
      },
      {
        type: 'p',
        content: [
          'Sí. Con App Menu QR puedes actualizar los productos y precios desde el panel de administración y mantener el mismo código QR.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por ejemplo, si necesitas cambiar el precio de una hamburguesa, agregar una bebida o desactivar temporalmente un producto, puedes hacerlo desde la plataforma. Cuando el cliente vuelva a consultar la carta desde su teléfono móvil, podrá acceder a la información actualizada.',
        ],
      },
      {
        type: 'p',
        content: [
          'Esta es una de las principales ventajas de utilizar una carta digital administrable. Además, si también utilizas cartas impresas, puedes generar una nueva versión en papel cuando sea necesario, manteniendo la presentación de tu negocio.',
        ],
      },
      {
        type: 'h2',
        id: 'errores-comunes-codigos-qr',
        text: 'Errores comunes al utilizar códigos QR en restaurantes',
      },
      {
        type: 'p',
        content: [
          'Crear un código QR es sencillo, pero hay algunos errores que pueden afectar la experiencia de tus clientes.',
        ],
      },
      { type: 'h3', text: 'Imprimir el código demasiado pequeño' },
      {
        type: 'p',
        content: [
          'Si el tamaño es insuficiente, los teléfonos móviles pueden tener dificultades para reconocerlo. Asegúrate de que pueda escanearse fácilmente desde una distancia cómoda.',
        ],
      },
      { type: 'h3', text: 'No comprobar el enlace' },
      {
        type: 'p',
        content: [
          'Antes de colocarlo en las mesas, verifica que la dirección funcione y que la carta sea accesible.',
        ],
      },
      { type: 'h3', text: 'Utilizar una carta difícil de leer' },
      {
        type: 'p',
        content: [
          'Un código QR puede funcionar perfectamente, pero si dirige a una carta con textos demasiado pequeños o una navegación incómoda, la experiencia no será buena.',
        ],
      },
      { type: 'h3', text: 'No mantener los precios actualizados' },
      {
        type: 'p',
        content: [
          'La carta digital debe reflejar correctamente los productos y precios del restaurante. Actualizar la información de manera regular ayuda a evitar confusiones.',
        ],
      },
      { type: 'h3', text: 'Colocar el QR en lugares poco visibles' },
      {
        type: 'p',
        content: [
          'Evita ubicaciones con poca iluminación, reflejos excesivos o superficies donde el código pueda deteriorarse fácilmente.',
        ],
      },
      {
        type: 'h2',
        id: 'qr-para-pdf-o-carta-digital',
        text: '¿Es mejor crear un QR para un PDF o utilizar una carta digital?',
      },
      {
        type: 'p',
        content: [
          'Ambas opciones permiten compartir una carta mediante un código QR, pero su funcionamiento es diferente.',
        ],
      },
      {
        type: 'p',
        content: [
          'Un documento PDF puede ser suficiente para negocios con cartas pequeñas y pocos cambios. Sin embargo, si necesitas modificar precios, administrar categorías, agregar productos o personalizar la presentación con frecuencia, una plataforma especializada puede resultar más práctica.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si quieres conocer las diferencias en detalle, te recomendamos leer nuestro artículo: ',
          {
            link: 'Menú QR vs. PDF: ¿cuál es la mejor opción para tu restaurante?',
            href: links.compare,
          },
          '.',
        ],
      },
    ],
    faqId: 'preguntas-frecuentes-codigo-qr',
    faqHeading: 'Preguntas frecuentes sobre códigos QR para restaurantes',
    faqs: [
      {
        question: '¿Se puede crear un código QR para un restaurante gratis?',
        answer:
          'Sí. Existen herramientas gratuitas para generar códigos QR. También puedes utilizar plataformas como App Menu QR para crear una carta digital con un código QR asociado, dentro de las funcionalidades de su plan gratuito.',
      },
      {
        question: '¿Necesito tener una página web?',
        answer:
          'No necesitas desarrollar una página web propia. Con App Menu QR puedes crear tu carta digital y compartirla mediante su correspondiente código QR.',
      },
      {
        question: '¿Los clientes necesitan instalar una aplicación?',
        answer:
          'No. En la mayoría de los teléfonos móviles modernos, los clientes pueden escanear el código QR desde la cámara y abrir la carta directamente en el navegador.',
      },
      {
        question: '¿El código QR deja de funcionar si cambio los precios?',
        answer:
          'No. Si modificas los precios desde App Menu QR, el código QR continúa funcionando y permite acceder a la carta actualizada.',
      },
      {
        question: '¿Puedo imprimir el mismo código QR varias veces?',
        answer:
          'Sí. Puedes utilizar el mismo código QR en diferentes mesas, carteles o materiales promocionales, siempre que quieras dirigir a los clientes a la misma carta digital.',
      },
      {
        question: '¿Qué tamaño debe tener un código QR para imprimir?',
        answer:
          'Depende de la distancia de lectura y del diseño. Para una tarjeta colocada sobre una mesa, puedes comenzar probando un tamaño aproximado de 3 × 3 centímetros y aumentarlo si es necesario.',
      },
      {
        question: '¿Puedo ofrecer una carta digital y una impresa al mismo tiempo?',
        answer:
          'Sí. Ambas opciones pueden complementarse. Con App Menu QR puedes compartir tu carta mediante un código QR y también utilizar su función de impresión para ofrecer una versión en papel.',
      },
    ],
    ctaId: 'crea-tu-codigo-qr',
    ctaTitle: 'Crea tu código QR y ofrece más opciones a tus clientes',
    ctaParagraphs: [
      [
        'Generar un código QR para tu restaurante es una manera sencilla de ofrecer a tus clientes acceso a la carta desde su teléfono móvil.',
      ],
      [
        'Con App Menu QR puedes crear tu carta digital, organizar los productos, personalizar su diseño y obtener un código QR para compartirlo con tus clientes.',
      ],
      [
        'Además, puedes imprimir tu carta para quienes prefieran consultarla en papel, combinando lo mejor de ambos formatos.',
      ],
      [
        'Y cuando necesites actualizar un precio, agregar un producto o realizar cambios, podrás hacerlo desde la plataforma sin necesidad de modificar el código QR.',
      ],
    ],
    ctaLabel: 'Crea tu carta digital gratis con App Menu QR',
    ctaHref: REGISTER_HREF,
  };
}

export function getBlogArticleCrearCodigoQr(locale: BlogUiLocale): BlogQrCodeArticle {
  return article(locale, {
    home: locale === 'en' ? '/en' : '/',
    templates: plantillasCatalogPath(locale),
    printFeature: funcionesHref('imprimir-menu', locale),
    dynamicFeature: funcionesHref('menu-qr-dinamico', locale),
    guide: blogArticleHref('como-crear-un-menu-qr-gratis', locale),
    compare: blogArticleHref('menu-qr-vs-pdf', locale),
  });
}
