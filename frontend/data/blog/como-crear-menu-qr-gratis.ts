/**
 * Guía SEO: cómo crear un menú QR gratis (ES + EN).
 */

import type { BlogUiLocale } from '../../lib/blog-nav';
import { blogArticleHref } from '../../lib/blog-nav';
import { funcionesHref } from '../../lib/funciones-nav';
import { plantillasCatalogPath } from '../../lib/plantillas-catalog-url';

export type BlogInline = string | { strong: string } | { link: string; href: string };

export type BlogBlock =
  | { type: 'p'; content: BlogInline[] }
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'example'; title: string; body: string }
  | { type: 'note'; text: string }
  | { type: 'image'; src: string; alt: string; width: number; height: number };

export type BlogFaqItem = { question: string; answer: string };

export type BlogGuideArticle = {
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

function article(
  locale: BlogUiLocale,
  dynamicHref: string,
  templatesHref: string,
  homeHref: string,
  compareHref: string,
): BlogGuideArticle {
  const productsHref = funcionesHref('gestionar-productos-menu', locale);
  const scheduleHref = funcionesHref('programar-menus', locale);
  const languagesHref = funcionesHref('menu-multidioma', locale);
  if (locale === 'en') {
    return {
      lead: [
        'Want a digital menu for your restaurant, bar, or cafe without printing a new menu every time a price changes? A QR menu lets guests check products, descriptions, and prices on their phone by scanning a code. This guide explains ',
        { strong: 'how to create a free QR menu' },
        ', match it to your brand, and publish it in a few steps, with no coding or web design experience.',
      ],
      tocLabel: 'In this guide',
      toc: [
        { href: '#what-is-a-qr-menu', label: 'What a QR menu is' },
        { href: '#how-to-create-a-free-qr-menu', label: 'Create a free QR menu in 6 steps' },
        { href: '#dynamic-qr-menu-benefits', label: 'Benefits of a dynamic QR menu' },
        { href: '#qr-menu-vs-pdf', label: 'QR menu or PDF menu' },
        { href: '#qr-menu-tips', label: 'Tips for an easy-to-use menu' },
        { href: '#qr-menu-faq', label: 'Frequently asked questions' },
      ],
      blocks: [
        {
          type: 'h2',
          id: 'what-is-a-qr-menu',
          text: 'What is a QR menu and how does it work?',
        },
        {
          type: 'p',
          content: [
            'A QR menu is a digital menu guests open by scanning a QR code with their phone camera. Instead of handing out a printed menu, you place the code on tables, at the counter, or anywhere people can see it.',
          ],
        },
        {
          type: 'p',
          content: [
            'After the scan, the menu opens in the phone browser. Guests can choose among different menus, such as a lunch menu, a dinner menu, a dessert menu, or the menu in English. Each menu is organized into sections — starters, mains, sides, desserts, or drinks — and each section lists the products with their description, photo, allergens, and price. There is no need to download an app.',
          ],
        },
        {
          type: 'image',
          src: '/blog/que-es-un-menu-qr.jpg',
          alt: 'Table tent with a QR code next to a phone showing a digital restaurant menu with sections and dish photos.',
          width: 900,
          height: 1024,
        },
        {
          type: 'p',
          content: [
            'If you use a platform with ',
            { link: 'dynamic QR menus', href: dynamicHref },
            ', you can update that information without generating or printing a new code each time something changes. That is especially useful for restaurants, bars, and cafes that adjust prices, add dishes, or rotate the offer often.',
          ],
        },
        {
          type: 'h2',
          id: 'how-to-create-a-free-qr-menu',
          text: 'How to create a free QR menu in 6 steps',
        },
        {
          type: 'p',
          content: [
            'Setting up a digital menu is simpler than it looks. With ',
            { link: 'App Menu QR', href: homeHref },
            ' you add your business, organize products, and get a QR code ready to print or share.',
          ],
        },
        { type: 'h3', text: 'Step 1. Create your App Menu QR account' },
        {
          type: 'p',
          content: [
            'Start by ',
            { link: 'creating a free account', href: REGISTER_HREF },
            '. From the dashboard you can set up the business without installing software or writing code.',
          ],
        },
        { type: 'h3', text: 'Step 2. Add your business details' },
        {
          type: 'p',
          content: [
            'Enter the venue name, a short description, contact details, and location. Upload your logo and a cover image so the menu is recognizable at a glance. You also choose the currency, or currencies, used to display prices.',
          ],
        },
        { type: 'h3', text: 'Step 3. Create your first menu and organize sections' },
        {
          type: 'p',
          content: [
            'Create the menu and split it into categories that are easy to scan. A restaurant might use:',
          ],
        },
        {
          type: 'ul',
          items: ['Starters', 'Main courses', 'Drinks', 'Desserts'],
        },
        {
          type: 'p',
          content: [
            'A cafe might group breakfast, coffee, tea, pastries, and cold drinks. Use clear category names. The simpler the structure, the faster guests find what they want.',
          ],
        },
        { type: 'h3', text: 'Step 4. Add products, descriptions, and prices' },
        {
          type: 'p',
          content: [
            'For each item, add the name, a specific description, and the price. A well-lit photo helps people decide, as long as it shows the dish the way you serve it.',
          ],
        },
        {
          type: 'example',
          title: 'Classic burger',
          body: 'Grilled beef burger with cheese, lettuce, tomato, and house sauce, served with fries.',
        },
        {
          type: 'p',
          content: [
            'A short description explains what is included and cuts down questions at the table. Prefer sharp photos with good light and a clean frame.',
          ],
        },
        {
          type: 'image',
          src: '/blog/agregar-productos-menu-qr.jpg',
          alt: 'App Menu QR dashboard for adding products to a menu, grouped into sections with name, description, and price.',
          width: 1024,
          height: 728,
        },
        { type: 'h3', text: 'Step 5. Customize the design' },
        {
          type: 'p',
          content: [
            'The layout is part of your brand. In App Menu QR you can pick a ',
            { link: 'template', href: templatesHref },
            ' and adjust colors and fonts: restrained for a traditional restaurant, more visual for a modern cafe. Keep contrast and type size comfortable on a phone, because most guests will open the menu on mobile.',
          ],
        },
        { type: 'h3', text: 'Step 6. Download and print your QR code' },
        {
          type: 'p',
          content: [
            'When the menu is ready, download your business QR code. Print it and place it on tables, at the entrance, or on the counter, at a size and height that is easy to scan. Before you leave it in the dining room, test it on your own phone: confirm the menu opens, prices match, and photos load.',
          ],
        },
        {
          type: 'note',
          text: 'Your QR menu is ready for guests. If you change a price later, the same code still points to the updated menu.',
        },
        {
          type: 'h2',
          id: 'dynamic-qr-menu-benefits',
          text: 'What are the benefits of a dynamic QR menu?',
        },
        {
          type: 'p',
          content: [
            'Beyond replacing a reprinted menu for every change, a dynamic QR menu simplifies day-to-day service.',
          ],
        },
        { type: 'h3', text: 'Update prices without reprinting' },
        {
          type: 'p',
          content: [
            'You change the price in the platform and the digital menu updates. The QR code already on the tables stays the same.',
          ],
        },
        { type: 'h3', text: 'Add new products without redesigning the menu' },
        {
          type: 'p',
          content: [
            'A seasonal drink, a daily special, or a new dessert goes into the right section. You do not redesign or reprint the whole menu.',
          ],
        },
        { type: 'h3', text: 'Keep the offer organized' },
        {
          type: 'p',
          content: [
            'Categories separate starters, mains, drinks, or promotions. Guests reach the item sooner, and the team works from a single menu.',
          ],
        },
        { type: 'h3', text: 'Present each dish more clearly' },
        {
          type: 'p',
          content: [
            'Photos and descriptions give more context than a list of names and prices. A clear layout is easier to read and more appealing.',
          ],
        },
        { type: 'h3', text: 'Hide what is out of stock and show a menu for a specific day' },
        {
          type: 'p',
          content: [
            'If a dish runs out, you can ',
            { link: 'turn it off temporarily', href: productsHref },
            '. It disappears from the digital menu and comes back when it is in stock again, without changing the QR code. For a particular day — a holiday, a Sunday lunch, or an event dinner — you can publish a dedicated menu and ',
            { link: 'schedule it', href: scheduleHref },
            ' so guests only see it then. The code already on the tables stays the same.',
          ],
        },
        { type: 'h3', text: 'Offer the menu in several languages' },
        {
          type: 'p',
          content: [
            'The same menu can be read in more than one language. Guests pick theirs on the phone and see names, descriptions, and allergens, without a separate printed version or a new QR code. You manage every translation from ',
            { link: 'one multilingual menu', href: languagesHref },
            '.',
          ],
        },
        { type: 'h3', text: 'Print less, without dropping paper entirely' },
        {
          type: 'p',
          content: [
            'The digital menu covers frequent changes. You can still keep a few printed menus for guests who prefer paper, or for moments when a phone is not practical.',
          ],
        },
        {
          type: 'h2',
          id: 'qr-menu-vs-pdf',
          text: 'Is a QR menu better than a PDF menu?',
        },
        {
          type: 'p',
          content: [
            'Both open on a phone, but they are not used the same way. A PDF usually reproduces a layout made for print. On a small screen, guests often have to pinch and zoom to read prices or descriptions. Every change means editing the file and replacing the link or the code.',
          ],
        },
        {
          type: 'p',
          content: [
            'A QR menu built on a dedicated platform is managed from a dashboard: you update one product, keep a mobile-friendly layout, and reuse the same code. If your offer changes often, a ',
            { link: 'dynamic QR menu', href: dynamicHref },
            ' is more practical than a PDF menu. For a fuller comparison, see ',
            { link: 'QR menu vs. PDF', href: compareHref },
            '.',
          ],
        },
        {
          type: 'h2',
          id: 'qr-menu-tips',
          text: 'Tips to make your QR menu easy to use',
        },
        {
          type: 'p',
          content: ['Before you share it, check these points:'],
        },
        {
          type: 'ul',
          items: [
            'Group products into categories and avoid one very long list.',
            'Write short descriptions: what the item includes, without filler.',
            'Use sharp, well-lit photos.',
            'Make sure menu prices match the prices at the register.',
            'Place the QR code somewhere visible, flat, and bright enough for a camera.',
            'Test the menu on different phones and check text, photos, and load time.',
          ],
        },
        {
          type: 'p',
          content: [
            'A digital menu should look good, and it should also open quickly and make sense on the first glance.',
          ],
        },
      ],
      faqId: 'qr-menu-faq',
      faqHeading: 'Frequently asked questions about QR menus',
      faqs: [
        {
          question: 'Can I create a QR menu for free?',
          answer:
            'Yes. App Menu QR includes a free option to start your digital menu. Some extra features depend on the plan you choose.',
        },
        {
          question: 'Do I need to know how to code?',
          answer:
            'No. You create and customize the menu from a dashboard, without writing code or building a website from scratch.',
        },
        {
          question: 'Do guests need to download an app?',
          answer:
            'No. They scan the QR code with their phone camera and the menu opens in the browser.',
        },
        {
          question: 'Can I change prices after printing the QR code?',
          answer:
            'Yes. With an App Menu QR dynamic menu you can edit prices and products without replacing the code you already printed.',
        },
        {
          question: 'Can I use a QR menu in a cafe or a bar?',
          answer:
            'Yes. QR menus work for restaurants, bars, cafes, and other businesses that need to show products and prices in an organized way.',
        },
        {
          question: 'Do I have to remove my printed menus?',
          answer:
            'No. You can combine the QR menu with paper menus and let each guest choose how to browse the offer.',
        },
      ],
      ctaId: 'create-your-free-qr-menu',
      ctaTitle: 'Create your free QR menu with App Menu QR',
      ctaParagraphs: [
        [
          'Digitizing your menu does not have to be complicated. With App Menu QR you build the menu, organize products, customize the design, and generate a QR code so guests can read it on their phone.',
        ],
        [
          'When you need to change a price, add a product, or adjust the offer, you do it in the platform and the printed code stays valid.',
        ],
      ],
      ctaLabel: 'Create your free QR menu',
      ctaHref: REGISTER_HREF,
    };
  }

  return {
    lead: [
      '¿Quieres un menú digital para tu restaurante, bar o cafetería sin imprimir cartas nuevas cada vez que cambia un precio? Un menú QR permite que tus clientes consulten productos, descripciones y precios desde el móvil, solo con escanear un código. En esta guía te explicamos ',
      { strong: 'cómo crear un menú QR gratis' },
      ', adaptarlo a tu negocio y publicarlo en pocos pasos, sin conocimientos de programación ni de diseño web.',
    ],
    tocLabel: 'En esta guía',
    toc: [
      { href: '#que-es-un-menu-qr', label: 'Qué es un menú QR' },
      { href: '#como-crear-un-menu-qr-gratis', label: 'Crear un menú QR gratis en 6 pasos' },
      { href: '#ventajas-menu-qr-dinamico', label: 'Ventajas de un menú QR dinámico' },
      { href: '#menu-qr-o-carta-pdf', label: 'Menú QR o carta en PDF' },
      { href: '#consejos-menu-qr', label: 'Consejos de uso' },
      { href: '#preguntas-frecuentes-menu-qr', label: 'Preguntas frecuentes' },
    ],
    blocks: [
      {
        type: 'h2',
        id: 'que-es-un-menu-qr',
        text: '¿Qué es un menú QR y cómo funciona?',
      },
      {
        type: 'p',
        content: [
          'Un menú QR es una carta digital a la que tus clientes acceden escaneando un código QR con la cámara del teléfono. En lugar de entregar una carta impresa, colocas el código en las mesas, en el mostrador o en cualquier punto visible del local.',
        ],
      },
        {
          type: 'p',
          content: [
            'Al escanearlo, el menú se abre en el navegador del teléfono. Desde ahí el cliente puede elegir entre distintos menús, por ejemplo el del día, el de la noche, el de postres o la carta en inglés. Cada menú se organiza en secciones —entradas, platos principales, secundarios, postres o bebidas— y, dentro de cada sección, aparecen los productos con su descripción, fotografía, alérgenos y precio. No hace falta descargar una aplicación.',
          ],
        },
        {
          type: 'image',
          src: '/blog/que-es-un-menu-qr.jpg',
          alt: 'Cartel de mesa con código QR junto a un teléfono que muestra la carta digital de un restaurante, con secciones y fotos de los platos.',
          width: 900,
          height: 1024,
        },
      {
        type: 'p',
        content: [
          'Si utilizas una plataforma con ',
          { link: 'menús QR dinámicos', href: dynamicHref },
          ', puedes actualizar esa información sin generar ni imprimir un código nuevo cada vez que haces un cambio. Resulta especialmente útil en restaurantes, bares y cafeterías que modifican precios, incorporan platos o renuevan la oferta con frecuencia.',
        ],
      },
      {
        type: 'h2',
        id: 'como-crear-un-menu-qr-gratis',
        text: 'Cómo crear un menú QR gratis en 6 pasos',
      },
      {
        type: 'p',
        content: [
          'Configurar la carta digital es más sencillo de lo que parece. Con ',
          { link: 'App Menu QR', href: homeHref },
          ' das de alta el negocio, organizas los productos y obtienes un código QR listo para imprimir o compartir.',
        ],
      },
      { type: 'h3', text: 'Paso 1. Regístrate en App Menu QR' },
      {
        type: 'p',
        content: [
          'El primer paso es ',
          { link: 'crear una cuenta gratuita', href: REGISTER_HREF },
          '. Desde el panel puedes configurar el negocio sin instalar programas ni tener conocimientos técnicos.',
        ],
      },
      { type: 'h3', text: 'Paso 2. Configura la información de tu negocio' },
      {
        type: 'p',
        content: [
          'Añade el nombre del establecimiento, una descripción breve, los datos de contacto y la ubicación. Sube el logotipo y una imagen de portada para que la carta se reconozca desde el primer vistazo. En este paso también eliges la divisa, o las divisas, con las que mostrarás los precios.',
        ],
      },
      { type: 'h3', text: 'Paso 3. Crea tu primer menú y organiza las secciones' },
      {
        type: 'p',
        content: [
          'Crea el menú y divídelo en categorías fáciles de recorrer. Un restaurante puede usar:',
        ],
      },
      {
        type: 'ul',
        items: ['Entradas', 'Platos principales', 'Bebidas', 'Postres'],
      },
      {
        type: 'p',
        content: [
          'Una cafetería puede agrupar desayunos, café, infusiones, pastelería y bebidas frías. Utiliza nombres de categoría claros: cuanto más simple sea la estructura, antes encuentra el cliente lo que busca.',
        ],
      },
      { type: 'h3', text: 'Paso 4. Agrega productos, descripciones y precios' },
      {
        type: 'p',
        content: [
          'En cada producto indica el nombre, una descripción concreta y el precio. Una fotografía bien iluminada ayuda a decidir, siempre que represente el plato tal como se sirve.',
        ],
      },
      {
        type: 'example',
        title: 'Hamburguesa clásica',
        body: 'Hamburguesa de carne a la parrilla con queso, lechuga, tomate y salsa especial, acompañada de papas fritas.',
      },
      {
        type: 'p',
        content: [
          'Una descripción breve aclara qué incluye el plato y reduce preguntas en sala. Prioriza fotos nítidas, con buena luz y un encuadre limpio.',
        ],
      },
      {
        type: 'image',
        src: '/blog/agregar-productos-menu-qr.jpg',
        alt: 'Panel de App Menu QR para cargar productos en un menú, organizados por secciones, con nombre, descripción y precio.',
        width: 1024,
        height: 728,
      },
      { type: 'h3', text: 'Paso 5. Personaliza el diseño de tu carta digital' },
      {
        type: 'p',
        content: [
          'El diseño forma parte de la imagen del local. En App Menu QR puedes elegir una ',
          { link: 'plantilla', href: templatesHref },
          ' y ajustar colores y tipografías al estilo del negocio: sobrio en un restaurante tradicional, más visual en una cafetería moderna. Cuida el contraste y el tamaño de letra para el móvil, porque la mayoría de tus clientes abrirá la carta desde el teléfono.',
        ],
      },
      { type: 'h3', text: 'Paso 6. Descarga e imprime tu código QR' },
      {
        type: 'p',
        content: [
          'Cuando la carta esté lista, descarga el código QR del negocio. Imprímelo y colócalo en las mesas, en la entrada o en el mostrador, a una altura y con un tamaño fáciles de escanear. Antes de dejarlo en sala, pruébalo con tu propio teléfono: comprueba que el menú abre, que los precios coinciden y que las fotos cargan.',
        ],
      },
      {
        type: 'note',
        text: 'Tu menú QR ya puede recibir visitas. Si más adelante cambias un precio, el mismo código seguirá apuntando a la carta actualizada.',
      },
      {
        type: 'h2',
        id: 'ventajas-menu-qr-dinamico',
        text: '¿Qué ventajas tiene un menú QR dinámico?',
      },
      {
        type: 'p',
        content: [
          'Además de evitar una impresión nueva en cada cambio, un menú QR dinámico simplifica la gestión diaria del negocio.',
        ],
      },
      { type: 'h3', text: 'Actualiza los precios sin volver a imprimir' },
      {
        type: 'p',
        content: [
          'Modificas el precio en la plataforma y el cambio se ve en el menú digital. El código QR que ya está en las mesas sigue siendo el mismo.',
        ],
      },
      { type: 'h3', text: 'Agrega productos nuevos sin rehacer la carta' },
      {
        type: 'p',
        content: [
          'Una bebida de temporada, un plato del día o un postre nuevo se incorpora a la sección correspondiente, sin rediseñar ni reimprimir toda la carta.',
        ],
      },
      { type: 'h3', text: 'Mantén la oferta ordenada' },
      {
        type: 'p',
        content: [
          'Las categorías separan entrantes, principales, bebidas o promociones. El cliente llega antes al producto y el equipo trabaja con una sola carta de referencia.',
        ],
      },
      { type: 'h3', text: 'Muestra mejor cada plato' },
      {
        type: 'p',
        content: [
          'Las fotografías y las descripciones aportan más contexto que una lista de nombres y precios. Una presentación clara suele hacer la carta más fácil de leer y más atractiva.',
        ],
      },
      { type: 'h3', text: 'Oculta lo que no tiene stock y muestra una carta para un día concreto' },
      {
        type: 'p',
        content: [
          'Si un plato se agota, puedes ',
          { link: 'desactivarlo de forma temporal', href: productsHref },
          '. Deja de verse en la carta digital y vuelve a aparecer cuando hay stock, sin cambiar el código QR. Para un día concreto —un feriado, un almuerzo de domingo o una cena de evento— puedes publicar una carta especial y ',
          { link: 'programarla', href: scheduleHref },
          ' para que los clientes la vean solo entonces. El código que ya está en las mesas sigue siendo el mismo.',
        ],
      },
      { type: 'h3', text: 'Ofrece la carta en varios idiomas' },
      {
        type: 'p',
        content: [
          'La misma carta puede consultarse en más de un idioma. El cliente elige el suyo desde el teléfono y lee nombres, descripciones y alérgenos, sin una versión impresa distinta ni otro código QR. Todas las traducciones se gestionan desde ',
          { link: 'un mismo menú multidioma', href: languagesHref },
          '.',
        ],
      },
      { type: 'h3', text: 'Reduce impresiones, sin eliminar el papel' },
      {
        type: 'p',
        content: [
          'El menú digital cubre los cambios frecuentes. Puedes conservar algunas cartas impresas para quien prefiera el papel o para momentos en los que el móvil no resulta práctico.',
        ],
      },
      {
        type: 'h2',
        id: 'menu-qr-o-carta-pdf',
        text: '¿Es mejor un menú QR que una carta en PDF?',
      },
      {
        type: 'p',
        content: [
          'Las dos opciones se abren en el teléfono, pero no se consultan igual. Una carta en PDF suele reproducir un diseño pensado para imprimir. En pantallas pequeñas, el cliente a menudo tiene que ampliar para leer precios o descripciones. Cada cambio obliga a editar el archivo y a sustituir el enlace o el código.',
        ],
      },
      {
        type: 'p',
        content: [
          'Un menú QR creado en una plataforma especializada se administra desde un panel: actualizas un producto, conservas un diseño adaptado al móvil y mantienes el mismo código. Si tu oferta cambia con frecuencia, un ',
          { link: 'menú QR dinámico', href: dynamicHref },
          ' resulta más práctico que una carta en PDF. Para una comparación más completa, consulta ',
          { link: 'Menú QR vs. PDF', href: compareHref },
          '.',
        ],
      },
      {
        type: 'h2',
        id: 'consejos-menu-qr',
        text: 'Consejos para que tu menú QR sea fácil de utilizar',
      },
      {
        type: 'p',
        content: ['Antes de compartirlo con tus clientes, revisa estos puntos:'],
      },
      {
        type: 'ul',
        items: [
          'Organiza los productos por categorías y evita una lista única demasiado larga.',
          'Escribe descripciones breves: qué incluye el producto, sin información de relleno.',
          'Usa fotografías nítidas y bien iluminadas.',
          'Comprueba que los precios del menú coincidan con los de caja.',
          'Coloca el código QR en un lugar visible, plano y con luz suficiente para la cámara.',
          'Prueba la carta en distintos teléfonos y revisa texto, fotos y tiempo de carga.',
        ],
      },
      {
        type: 'p',
        content: [
          'Un menú digital tiene que verse bien y, sobre todo, abrirse rápido y entenderse a la primera.',
        ],
      },
    ],
    faqId: 'preguntas-frecuentes-menu-qr',
    faqHeading: 'Preguntas frecuentes sobre los menús QR',
    faqs: [
      {
        question: '¿Puedo crear un menú QR gratis?',
        answer:
          'Sí. App Menu QR ofrece una opción gratuita para empezar a crear tu carta digital. Algunas funciones adicionales dependen del plan que contrates.',
      },
      {
        question: '¿Necesito conocimientos de programación?',
        answer:
          'No. Creas y personalizas el menú desde un panel de gestión, sin escribir código ni montar una web desde cero.',
      },
      {
        question: '¿Mis clientes tienen que descargar una aplicación?',
        answer:
          'No. Escanean el código QR con la cámara del teléfono y la carta se abre en el navegador.',
      },
      {
        question: '¿Puedo cambiar los precios después de imprimir el código QR?',
        answer:
          'Sí. Con el menú QR dinámico de App Menu QR puedes modificar precios y productos sin cambiar el código que ya imprimiste.',
      },
      {
        question: '¿Puedo usar un menú QR en una cafetería o un bar?',
        answer:
          'Sí. Sirve para restaurantes, bares, cafeterías y otros comercios que necesiten mostrar productos y precios de forma ordenada.',
      },
      {
        question: '¿Tengo que eliminar las cartas impresas?',
        answer:
          'No. Puedes combinar el menú QR con cartas en papel y dejar que cada cliente elija cómo consultar la oferta.',
      },
    ],
    ctaId: 'crea-tu-menu-qr-gratis',
    ctaTitle: 'Crea tu menú QR gratis con App Menu QR',
    ctaParagraphs: [
      [
        'Digitalizar la carta no tiene por qué ser complicado. Con App Menu QR creas el menú, organizas los productos, personalizas el diseño y generas un código QR para que tus clientes consulten la información desde el teléfono.',
      ],
      [
        'Cuando necesites cambiar un precio, sumar un producto o ajustar la oferta, lo haces desde la plataforma y el código impreso sigue siendo válido.',
      ],
    ],
    ctaLabel: 'Crea tu menú QR gratis',
    ctaHref: REGISTER_HREF,
  };
}

export function getBlogArticleCrearMenuQrGratis(locale: BlogUiLocale): BlogGuideArticle {
  const dynamicHref = funcionesHref('menu-qr-dinamico', locale);
  const templatesHref = plantillasCatalogPath(locale);
  const homeHref = locale === 'en' ? '/en' : '/';
  const compareHref = blogArticleHref('menu-qr-vs-pdf', locale);
  return article(locale, dynamicHref, templatesHref, homeHref, compareHref);
}
