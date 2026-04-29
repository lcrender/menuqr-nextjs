/**
 * Datos de ejemplo para la vista previa de cada plantilla.
 * Cada plantilla tiene un restaurante de fantasía con menú y precios en la moneda indicada.
 */

export interface ItemPrice {
  currency: string;
  label?: string;
  amount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  prices: ItemPrice[];
  icons: string[];
  photos?: string[];
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface PreviewRestaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  whatsapp?: string;
  country?: string;
  template?: string;
  primaryColor?: string;
  secondaryColor?: string;
  /** Misma forma que en el menú público (opciones guardadas por plantilla). */
  templateConfig?: Record<string, unknown>;
}

export interface PreviewMenu {
  id: string;
  slug: string;
  name: string;
  description?: string;
  template?: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  sections: MenuSection[];
}

const TEMPLATE_IDS = ['classic', 'minimalist', 'foodie', 'burgers', 'italianFood', 'gourmet'] as const;
export type PreviewTemplateId = typeof TEMPLATE_IDS[number];

/** Clásica: Bodegón Argentino, ARS */
const classicData: { restaurant: PreviewRestaurant; menu: PreviewMenu } = {
  restaurant: {
    id: 'preview-classic',
    name: 'Bodegón El Rincón',
    slug: 'preview-classic',
    description: 'Desde 1985 en el barrio. Cocina de barrio, platos abundantes y el mejor trato. Reservas para grupos.',
    address: 'Av. Corrientes 1200, C1043 CABA',
    phone: '+54 11 4321-5678',
    email: 'contacto@bodegonelrincon.com.ar',
    website: 'https://bodegonelrincon.com.ar',
    template: 'classic',
    primaryColor: '#8B4513',
    secondaryColor: '#654321',
    country: 'Argentina',
    whatsapp: '54 11 4321-5678',
    logoUrl: '/preview/logo-classic.jpg',
    coverUrl: '/preview/portada-classic.jpg',
  },
  menu: {
    id: 'preview-classic-menu',
    slug: 'carta',
    name: 'Carta',
    description: 'Platos del día, minutas y carta fija. Consultar por promociones de mediodía.',
    restaurantId: 'preview-classic',
    restaurantName: 'Bodegón El Rincón',
    restaurantSlug: 'preview-classic',
    template: 'classic',
    sections: [
      {
        id: 'sec-entradas',
        name: 'Entradas',
        items: [
          { id: 'c-e1', name: 'Provoleta', description: 'Queso provolone gratinado con orégano y aceite de oliva. Porción individual.', prices: [{ currency: 'ARS', amount: 1800 }], icons: ['vegetariano'] },
          { id: 'c-e2', name: 'Empanadas de carne', description: 'Tres unidades. Carne cortada a cuchillo con aceitunas y huevo.', prices: [{ currency: 'ARS', amount: 2200 }], icons: [] },
          { id: 'c-e3', name: 'Rabas', description: 'Porción de calamares rebozados y fritos. Acompañadas con limón y mayonesa casera.', prices: [{ currency: 'ARS', amount: 3500 }], icons: [] },
          { id: 'c-e4', name: 'Ensalada mixta', description: 'Lechuga, tomate, cebolla, huevo duro y aceitunas. Opción para compartir.', prices: [{ currency: 'ARS', label: 'Individual', amount: 1400 }, { currency: 'ARS', label: 'Para 2', amount: 2400 }], icons: ['vegano', 'vegetariano'] },
        ],
      },
      {
        id: 'sec-platos',
        name: 'Platos del día',
        items: [
          { id: 'c-p1', name: 'Milanesa con puré', description: 'Milanesa de ternera con puré de papas cremoso. Incluye ensalada o papas fritas.', prices: [{ currency: 'ARS', amount: 4200 }], icons: [] },
          { id: 'c-p2', name: 'Milanesa a la napolitana', description: 'Con salsa de tomate, jamón y queso gratinado. Guarnición a elección.', prices: [{ currency: 'ARS', amount: 4500 }], icons: [] },
          { id: 'c-p3', name: 'Tallarines con estofado', description: 'Tallarines caseros con estofado de carne. Porción abundante.', prices: [{ currency: 'ARS', amount: 3800 }], icons: [] },
          { id: 'c-p4', name: 'Pollo al horno con ensalada', description: 'Medio pollo al horno con hierbas. Ensalada verde de acompañamiento.', prices: [{ currency: 'ARS', amount: 4000 }], icons: [] },
          { id: 'c-p5', name: 'Bife de chorizo con papas', description: 'Corte de 300 g aprox. Con papas fritas o ensalada. Chimichurri a elección.', prices: [{ currency: 'ARS', amount: 6200 }], icons: [] },
          { id: 'c-p6', name: 'Ravioles con tuco o salsa blanca', description: 'Ravioles de verdura o carne. Salsa a elección.', prices: [{ currency: 'ARS', amount: 3500 }], icons: ['vegetariano'] },
        ],
      },
      {
        id: 'sec-minutas',
        name: 'Minutas',
        items: [
          { id: 'c-m1', name: 'Omelette con jamón y queso', description: 'Tres huevos. Acompañado con tostadas.', prices: [{ currency: 'ARS', amount: 2800 }], icons: ['vegetariano'] },
          { id: 'c-m2', name: 'Revuelto de gramajo', description: 'Huevo revuelto con papas fritas y jamón. Clásico de bodegón.', prices: [{ currency: 'ARS', amount: 3200 }], icons: [] },
          { id: 'c-m3', name: 'Fideos con manteca y queso', description: 'Fideos tirabuzón con manteca, queso rallado y nuez moscada.', prices: [{ currency: 'ARS', amount: 2600 }], icons: ['vegetariano'] },
          { id: 'c-m4', name: 'Sándwich de milanesa', description: 'Milanesa de ternera en pan francés con lechuga, tomate y mayonesa.', prices: [{ currency: 'ARS', amount: 3400 }], icons: [] },
        ],
      },
      {
        id: 'sec-guarniciones',
        name: 'Guarniciones',
        items: [
          { id: 'c-g1', name: 'Papas fritas', description: 'Porción individual.', prices: [{ currency: 'ARS', amount: 900 }], icons: ['vegano'] },
          { id: 'c-g2', name: 'Puré de papas', prices: [{ currency: 'ARS', amount: 800 }], icons: ['vegano', 'vegetariano'] },
          { id: 'c-g3', name: 'Ensalada mixta', prices: [{ currency: 'ARS', amount: 700 }], icons: ['vegano', 'vegetariano'] },
          { id: 'c-g4', name: 'Huevo frito', description: 'Unidad.', prices: [{ currency: 'ARS', amount: 500 }], icons: ['vegetariano'] },
        ],
      },
      {
        id: 'sec-postres',
        name: 'Postres',
        items: [
          { id: 'c-d1', name: 'Flan con dulce de leche', description: 'Flan casero con dulce de leche y crema. Opción con nuez.', prices: [{ currency: 'ARS', amount: 1100 }], icons: ['vegetariano'] },
          { id: 'c-d2', name: 'Ensalada de frutas', description: 'Frutas de estación. Porción individual.', prices: [{ currency: 'ARS', amount: 950 }], icons: ['vegano', 'vegetariano'] },
          { id: 'c-d3', name: 'Helado', description: 'Dos bochas. Sabores: vainilla, dulce de leche, chocolate, frutilla.', prices: [{ currency: 'ARS', amount: 1200 }], icons: ['vegetariano'] },
          { id: 'c-d4', name: 'Budín de pan', description: 'Con salsa de whisky o dulce de leche.', prices: [{ currency: 'ARS', amount: 1000 }], icons: ['vegetariano'] },
        ],
      },
      {
        id: 'sec-bebidas',
        name: 'Bebidas',
        items: [
          { id: 'c-b1', name: 'Café', description: 'Expresso, cortado o americano.', prices: [{ currency: 'ARS', amount: 600 }], icons: [] },
          { id: 'c-b2', name: 'Café con leche', prices: [{ currency: 'ARS', amount: 900 }], icons: [] },
          { id: 'c-b3', name: 'Agua mineral', description: 'Con o sin gas. 500 ml.', prices: [{ currency: 'ARS', label: '500 ml', amount: 500 }], icons: [] },
          { id: 'c-b4', name: 'Gaseosa', description: 'Lata 354 ml. Coca-Cola, Sprite, Fanta.', prices: [{ currency: 'ARS', label: 'Lata', amount: 700 }], icons: [] },
          { id: 'c-b5', name: 'Cerveza', description: 'Porrón 340 ml. Lager o rubia.', prices: [{ currency: 'ARS', label: 'Porrón', amount: 950 }], icons: [] },
          { id: 'c-b6', name: 'Vino tinto / blanco', description: 'Copa de la casa.', prices: [{ currency: 'ARS', label: 'Copa', amount: 1300 }], icons: [] },
        ],
      },
    ],
  },
};

/** Minimalista: Tapas españolas, EUR. Dos menús: Menú Día y Menú Noche */
const menuDiaMinimalist: PreviewMenu = {
  id: 'preview-minimalist-menu-dia',
  slug: 'menu-dia',
  name: 'Menú Día',
  restaurantId: 'preview-minimalist',
  restaurantName: 'Tapas & Vino',
  restaurantSlug: 'preview-minimalist',
  template: 'minimalist',
  sections: [
    {
      id: 'sec-1',
      name: 'Tapas',
      items: [
        { id: 'i1', name: 'Tortilla española', description: 'Porción', prices: [{ currency: 'EUR', amount: 4.5 }], icons: [] },
        { id: 'i2', name: 'Patatas bravas', prices: [{ currency: 'EUR', amount: 5 }], icons: [] },
        { id: 'i3', name: 'Jamón ibérico', description: 'Ración 80g', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 't4', name: 'Croquetas de jamón', description: 'Cuatro unidades', prices: [{ currency: 'EUR', amount: 6 }], icons: [] },
        { id: 't5', name: 'Gambas al ajillo', prices: [{ currency: 'EUR', amount: 9 }], icons: [] },
        { id: 't6', name: 'Pimientos de padrón', description: 'Con sal gorda', prices: [{ currency: 'EUR', amount: 5.5 }], icons: ['vegetariano'] },
        { id: 't7', name: 'Berenjenas con miel', prices: [{ currency: 'EUR', amount: 5 }], icons: ['vegetariano'] },
        { id: 't8', name: 'Boquerones en vinagre', description: 'Porción', prices: [{ currency: 'EUR', amount: 6.5 }], icons: [] },
        { id: 't9', name: 'Queso manchego', description: 'Con membrillo. 80g', prices: [{ currency: 'EUR', amount: 7 }], icons: ['vegetariano'] },
        { id: 't10', name: 'Aceitunas y encurtidos', prices: [{ currency: 'EUR', amount: 3.5 }], icons: ['vegano'] },
      ],
    },
    {
      id: 'sec-2',
      name: 'Raciones',
      items: [
        { id: 'i4', name: 'Pulpo a la gallega', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
        { id: 'i5', name: 'Paella valenciana', description: 'Para 2 personas', prices: [{ currency: 'EUR', amount: 22 }], icons: [] },
        { id: 'r6', name: 'Carrillada ibérica', description: 'Estofado con puré', prices: [{ currency: 'EUR', amount: 16 }], icons: [] },
        { id: 'r7', name: 'Calamares a la romana', prices: [{ currency: 'EUR', amount: 13 }], icons: [] },
        { id: 'r8', name: 'Ensaladilla rusa', description: 'Porción grande', prices: [{ currency: 'EUR', amount: 8 }], icons: ['vegetariano'] },
        { id: 'r9', name: 'Chipirones en su tinta', prices: [{ currency: 'EUR', amount: 15 }], icons: [] },
        { id: 'r10', name: 'Huevos rotos con jamón', description: 'Con patatas', prices: [{ currency: 'EUR', amount: 11 }], icons: [] },
        { id: 'r11', name: 'Secreto ibérico', description: 'Con pimientos asados', prices: [{ currency: 'EUR', amount: 18 }], icons: [] },
        { id: 'r12', name: 'Cazón en adobo', description: 'Porción', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'r13', name: 'Migas con chorizo', description: 'Para compartir', prices: [{ currency: 'EUR', amount: 10 }], icons: [] },
      ],
    },
    {
      id: 'sec-postres',
      name: 'Postres',
      items: [
        { id: 'p1', name: 'Flan de la casa', description: 'Con nata o caramelo', prices: [{ currency: 'EUR', amount: 4 }], icons: ['vegetariano'] },
        { id: 'p2', name: 'Torrijas', description: 'Con helado de vainilla', prices: [{ currency: 'EUR', amount: 5 }], icons: ['vegetariano'] },
        { id: 'p3', name: 'Tarta de Santiago', description: 'Almendra. Porción', prices: [{ currency: 'EUR', amount: 5.5 }], icons: ['vegetariano'] },
        { id: 'p4', name: 'Churros con chocolate', description: 'Porción 4 unidades', prices: [{ currency: 'EUR', amount: 4.5 }], icons: ['vegetariano'] },
        { id: 'p5', name: 'Arroz con leche', prices: [{ currency: 'EUR', amount: 4 }], icons: ['vegetariano'] },
        { id: 'p6', name: 'Cuajada con miel', description: 'Y nueces', prices: [{ currency: 'EUR', amount: 4.5 }], icons: ['vegetariano'] },
      ],
    },
    {
      id: 'sec-vinos',
      name: 'Vinos',
      items: [
        { id: 'v1', name: 'Rioja Crianza', description: 'Tinto. Copa o botella', prices: [{ currency: 'EUR', label: 'Copa', amount: 4 }, { currency: 'EUR', label: 'Botella', amount: 18 }], icons: [] },
        { id: 'v2', name: 'Rueda Verdejo', description: 'Blanco', prices: [{ currency: 'EUR', label: 'Copa', amount: 3.5 }, { currency: 'EUR', label: 'Botella', amount: 16 }], icons: [] },
        { id: 'v3', name: 'Navarra Rosado', description: 'Copa o botella', prices: [{ currency: 'EUR', label: 'Copa', amount: 3.5 }, { currency: 'EUR', label: 'Botella', amount: 15 }], icons: [] },
        { id: 'v4', name: 'Cava Brut', description: 'Espumoso', prices: [{ currency: 'EUR', label: 'Copa', amount: 5 }, { currency: 'EUR', label: 'Botella', amount: 22 }], icons: [] },
        { id: 'v5', name: 'Vino de la casa', description: 'Tinto o blanco', prices: [{ currency: 'EUR', label: 'Copa', amount: 3 }, { currency: 'EUR', label: 'Jarra 50cl', amount: 6 }], icons: [] },
      ],
    },
    {
      id: 'sec-3',
      name: 'Bebidas',
      items: [
        { id: 'b9', name: 'Agua mineral', description: '500 ml', prices: [{ currency: 'EUR', label: '500ml', amount: 2 }], icons: [] },
        { id: 'b10', name: 'Refresco', description: 'Lata 33cl', prices: [{ currency: 'EUR', label: 'Lata', amount: 2.2 }], icons: [] },
        { id: 'b8', name: 'Cerveza', description: 'Caña o jarra', prices: [{ currency: 'EUR', label: 'Caña 33cl', amount: 2.5 }, { currency: 'EUR', label: 'Jarra 50cl', amount: 3.5 }], icons: [] },
        { id: 'b12', name: 'Café', description: 'Solo, con leche o cortado. +0,20€ con leche, +0,30€ leche soja o avena', prices: [{ currency: 'EUR', label: 'Solo / cortado', amount: 1.8 }, { currency: 'EUR', label: 'Con leche', amount: 2 }, { currency: 'EUR', label: 'Leche soja o avena', amount: 2.1 }], icons: [] },
        { id: 'i7', name: 'Sangría jarra', description: '1L', prices: [{ currency: 'EUR', label: '1L', amount: 12 }], icons: [] },
        { id: 'b13', name: 'Vermut', description: 'Copa', prices: [{ currency: 'EUR', amount: 4 }], icons: [] },
      ],
    },
  ],
};

const menuNocheMinimalist: PreviewMenu = {
  id: 'preview-minimalist-menu-noche',
  slug: 'menu-noche',
  name: 'Menú Noche',
  description: 'Tapas y raciones para cenar',
  restaurantId: 'preview-minimalist',
  restaurantName: 'Tapas & Vino',
  restaurantSlug: 'preview-minimalist',
  template: 'minimalist',
  sections: [
    {
      id: 'sec-n1',
      name: 'Tapas',
      items: [
        { id: 'n1', name: 'Tortilla española', description: 'Porción', prices: [{ currency: 'EUR', amount: 4.5 }], icons: [] },
        { id: 'n2', name: 'Patatas bravas', prices: [{ currency: 'EUR', amount: 5 }], icons: [] },
        { id: 'n3', name: 'Jamón ibérico', description: 'Ración 80g', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'n4', name: 'Croquetas de jamón', description: 'Cuatro unidades', prices: [{ currency: 'EUR', amount: 6 }], icons: [] },
        { id: 'n5', name: 'Gambas al ajillo', prices: [{ currency: 'EUR', amount: 9 }], icons: [] },
        { id: 'n6', name: 'Queso curado con nueces', description: 'Tabla 100g', prices: [{ currency: 'EUR', amount: 8 }], icons: ['vegetariano'] },
        { id: 'n7', name: 'Anchoas del Cantábrico', prices: [{ currency: 'EUR', amount: 7 }], icons: [] },
      ],
    },
    {
      id: 'sec-n2',
      name: 'Raciones',
      items: [
        { id: 'n8', name: 'Pulpo a la gallega', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
        { id: 'n9', name: 'Carrillada ibérica', description: 'Estofado con puré', prices: [{ currency: 'EUR', amount: 16 }], icons: [] },
        { id: 'n10', name: 'Secreto ibérico', description: 'Con pimientos asados', prices: [{ currency: 'EUR', amount: 18 }], icons: [] },
        { id: 'n11', name: 'Chipirones en su tinta', prices: [{ currency: 'EUR', amount: 15 }], icons: [] },
        { id: 'n12', name: 'Paella de marisco', description: 'Para 2 personas', prices: [{ currency: 'EUR', amount: 26 }], icons: [] },
      ],
    },
    {
      id: 'sec-n-postres',
      name: 'Postres',
      items: [
        { id: 'np1', name: 'Flan de la casa', description: 'Con nata o caramelo', prices: [{ currency: 'EUR', amount: 4 }], icons: ['vegetariano'] },
        { id: 'np2', name: 'Torrijas', description: 'Con helado de vainilla', prices: [{ currency: 'EUR', amount: 5 }], icons: ['vegetariano'] },
        { id: 'np3', name: 'Tarta de Santiago', description: 'Almendra. Porción', prices: [{ currency: 'EUR', amount: 5.5 }], icons: ['vegetariano'] },
        { id: 'np4', name: 'Churros con chocolate', description: 'Porción 4 unidades', prices: [{ currency: 'EUR', amount: 4.5 }], icons: ['vegetariano'] },
      ],
    },
    {
      id: 'sec-n-vinos',
      name: 'Vinos',
      items: [
        { id: 'nv1', name: 'Rioja Crianza', description: 'Tinto. Copa o botella', prices: [{ currency: 'EUR', label: 'Copa', amount: 4 }, { currency: 'EUR', label: 'Botella', amount: 18 }], icons: [] },
        { id: 'nv2', name: 'Rueda Verdejo', description: 'Blanco', prices: [{ currency: 'EUR', label: 'Copa', amount: 3.5 }, { currency: 'EUR', label: 'Botella', amount: 16 }], icons: [] },
        { id: 'nv3', name: 'Navarra Rosado', description: 'Copa o botella', prices: [{ currency: 'EUR', label: 'Copa', amount: 3.5 }, { currency: 'EUR', label: 'Botella', amount: 15 }], icons: [] },
        { id: 'nv4', name: 'Cava Brut', description: 'Espumoso', prices: [{ currency: 'EUR', label: 'Copa', amount: 5 }, { currency: 'EUR', label: 'Botella', amount: 22 }], icons: [] },
        { id: 'nv5', name: 'Vino de la casa', description: 'Tinto o blanco', prices: [{ currency: 'EUR', label: 'Copa', amount: 3 }, { currency: 'EUR', label: 'Jarra 50cl', amount: 6 }], icons: [] },
      ],
    },
    {
      id: 'sec-n3',
      name: 'Bebidas',
      items: [
        { id: 'n14', name: 'Sangría jarra', description: '1L', prices: [{ currency: 'EUR', label: '1L', amount: 12 }], icons: [] },
        { id: 'n15', name: 'Cerveza', description: 'Caña o jarra', prices: [{ currency: 'EUR', label: 'Caña 33cl', amount: 2.5 }, { currency: 'EUR', label: 'Jarra 50cl', amount: 3.5 }], icons: [] },
        { id: 'n16', name: 'Vermut', description: 'Copa', prices: [{ currency: 'EUR', amount: 4 }], icons: [] },
      ],
    },
  ],
};

const minimalistData: { restaurant: PreviewRestaurant; menu: PreviewMenu; menus: PreviewMenu[] } = {
  restaurant: {
    id: 'preview-minimalist',
    name: 'Tapas & Vino',
    slug: 'preview-minimalist',
    description: 'Tapas, raciones y vinos españoles',
    address: 'Calle Mayor 15, Madrid',
    phone: '+34 91 123 45 67',
    email: 'hola@tapasyvino.es',
    whatsapp: '34 91 123 45 67',
    template: 'minimalist',
    primaryColor: '#2c3e50',
    secondaryColor: '#c0392b',
    country: 'España',
    logoUrl: '/preview/logo-minimalist.jpg',
  },
  menu: menuDiaMinimalist,
  menus: [menuDiaMinimalist, menuNocheMinimalist],
};

/** Foodie: Pastas, ARS. Tres menús: Español, English, Italiano */
const menuEspanolFoodie: PreviewMenu = {
  id: 'preview-foodie-menu-espanol',
  slug: 'espanol',
  name: 'Español',
  restaurantId: 'preview-foodie',
  restaurantName: 'Casa de Pastas',
  restaurantSlug: 'preview-foodie',
  template: 'foodie',
  sections: [
    {
      id: 'sec-1',
      name: 'Pastas',
      items: [
        { id: 'i1', name: 'Ñoquis de papa', description: 'Porción 400g', prices: [{ currency: 'ARS', amount: 3200 }], icons: [] },
        { id: 'i2', name: 'Ravioles de verdura', prices: [{ currency: 'ARS', amount: 3500 }], icons: [] },
        { id: 'i3', name: 'Sorrentinos de jamón y queso', prices: [{ currency: 'ARS', amount: 3800 }], icons: [] },
        { id: 'f1', name: 'Fettuccine', description: 'Cintas anchas al huevo. Porción 350g', prices: [{ currency: 'ARS', amount: 3000 }], icons: [] },
        { id: 'f2', name: 'Tallarines', description: 'Pasta larga casera. Porción 350g', prices: [{ currency: 'ARS', amount: 2900 }], icons: [] },
        { id: 'f3', name: 'Canelones', description: 'Tres unidades rellenas de verdura o carne con salsa a elección', prices: [{ currency: 'ARS', amount: 3600 }], icons: [] },
        { id: 'f4', name: 'Lasagna', description: 'Porción individual. Carne y bechamel', prices: [{ currency: 'ARS', amount: 3900 }], icons: [] },
        { id: 'f5', name: 'Cintas', description: 'Cintas al huevo. Porción 350g', prices: [{ currency: 'ARS', amount: 3100 }], icons: [] },
        { id: 'f6', name: 'Capeletis', description: 'Rellenos de ricotta y espinaca. Porción 350g', prices: [{ currency: 'ARS', amount: 3700 }], icons: [] },
      ],
    },
    {
      id: 'sec-2',
      name: 'Salsas',
      items: [
        { id: 'i4', name: 'Tuco', prices: [{ currency: 'ARS', amount: 800 }], icons: [] },
        { id: 'i5', name: 'Salsa blanca', prices: [{ currency: 'ARS', amount: 900 }], icons: [] },
        { id: 'i6', name: 'Salsa cuatro quesos', prices: [{ currency: 'ARS', amount: 1100 }], icons: [] },
        { id: 's1', name: 'Salsa bolognesa', description: 'Carne molida y tomate', prices: [{ currency: 'ARS', amount: 950 }], icons: [] },
        { id: 's2', name: 'Salsa fileto', description: 'Tomate natural sin piel', prices: [{ currency: 'ARS', amount: 850 }], icons: [] },
        { id: 's3', name: 'Salsa pesto', description: 'Albahaca, ajo, piñones y parmesano', prices: [{ currency: 'ARS', amount: 1200 }], icons: [] },
      ],
    },
    {
      id: 'sec-3',
      name: 'Bebidas',
      items: [
        { id: 'i7', name: 'Gaseosa', description: 'Coca-Cola, Coca-Cola Zero, Sprite, Fanta, Aquarius pomelo', prices: [{ currency: 'ARS', label: '500ml', amount: 700 }], icons: [] },
        { id: 'i8', name: 'Agua con gas', prices: [{ currency: 'ARS', label: '500ml', amount: 500 }], icons: [] },
        { id: 'b1', name: 'Agua sin gas', prices: [{ currency: 'ARS', label: '500ml', amount: 450 }], icons: [] },
      ],
    },
  ],
};

const menuEnglishFoodie: PreviewMenu = {
  id: 'preview-foodie-menu-english',
  slug: 'english',
  name: 'English',
  restaurantId: 'preview-foodie',
  restaurantName: 'Casa de Pastas',
  restaurantSlug: 'preview-foodie',
  template: 'foodie',
  sections: [
    {
      id: 'sec-1',
      name: 'Pasta',
      items: [
        { id: 'i1', name: 'Potato gnocchi', description: '400g portion', prices: [{ currency: 'ARS', amount: 3200 }], icons: [] },
        { id: 'i2', name: 'Vegetable ravioli', prices: [{ currency: 'ARS', amount: 3500 }], icons: [] },
        { id: 'i3', name: 'Ham and cheese sorrentinos', prices: [{ currency: 'ARS', amount: 3800 }], icons: [] },
        { id: 'f1', name: 'Fettuccine', description: 'Egg ribbon pasta. 350g portion', prices: [{ currency: 'ARS', amount: 3000 }], icons: [] },
        { id: 'f2', name: 'Tagliatelle', description: 'Fresh egg pasta. 350g portion', prices: [{ currency: 'ARS', amount: 2900 }], icons: [] },
        { id: 'f3', name: 'Cannelloni', description: 'Three pieces stuffed with vegetables or meat, sauce of your choice', prices: [{ currency: 'ARS', amount: 3600 }], icons: [] },
        { id: 'f4', name: 'Lasagna', description: 'Single portion. Meat and béchamel', prices: [{ currency: 'ARS', amount: 3900 }], icons: [] },
        { id: 'f5', name: 'Ribbon pasta', description: 'Egg ribbons. 350g portion', prices: [{ currency: 'ARS', amount: 3100 }], icons: [] },
        { id: 'f6', name: 'Capeletis', description: 'Stuffed with ricotta and spinach. 350g portion', prices: [{ currency: 'ARS', amount: 3700 }], icons: [] },
      ],
    },
    {
      id: 'sec-2',
      name: 'Sauces',
      items: [
        { id: 'i4', name: 'Tomato sauce', prices: [{ currency: 'ARS', amount: 800 }], icons: [] },
        { id: 'i5', name: 'White sauce', prices: [{ currency: 'ARS', amount: 900 }], icons: [] },
        { id: 'i6', name: 'Four cheese sauce', prices: [{ currency: 'ARS', amount: 1100 }], icons: [] },
        { id: 's1', name: 'Bolognese sauce', description: 'Ground meat and tomato', prices: [{ currency: 'ARS', amount: 950 }], icons: [] },
        { id: 's2', name: 'Fileto sauce', description: 'Natural skinless tomato', prices: [{ currency: 'ARS', amount: 850 }], icons: [] },
        { id: 's3', name: 'Pesto sauce', description: 'Basil, garlic, pine nuts and parmesan', prices: [{ currency: 'ARS', amount: 1200 }], icons: [] },
      ],
    },
    {
      id: 'sec-3',
      name: 'Drinks',
      items: [
        { id: 'i7', name: 'Soft drink', description: 'Coca-Cola, Coca-Cola Zero, Sprite, Fanta, grapefruit Aquarius', prices: [{ currency: 'ARS', label: '500ml', amount: 700 }], icons: [] },
        { id: 'i8', name: 'Sparkling water', prices: [{ currency: 'ARS', label: '500ml', amount: 500 }], icons: [] },
        { id: 'b1', name: 'Still water', prices: [{ currency: 'ARS', label: '500ml', amount: 450 }], icons: [] },
      ],
    },
  ],
};

const menuItalianoFoodie: PreviewMenu = {
  id: 'preview-foodie-menu-italiano',
  slug: 'italiano',
  name: 'Italiano',
  restaurantId: 'preview-foodie',
  restaurantName: 'Casa de Pastas',
  restaurantSlug: 'preview-foodie',
  template: 'foodie',
  sections: [
    {
      id: 'sec-1',
      name: 'Paste',
      items: [
        { id: 'i1', name: 'Gnocchi di patate', description: 'Porzione 400g', prices: [{ currency: 'ARS', amount: 3200 }], icons: [] },
        { id: 'i2', name: 'Ravioli di verdura', prices: [{ currency: 'ARS', amount: 3500 }], icons: [] },
        { id: 'i3', name: 'Sorrentini prosciutto e formaggio', prices: [{ currency: 'ARS', amount: 3800 }], icons: [] },
        { id: 'f1', name: 'Fettuccine', description: 'Pasta all\'uovo. Porzione 350g', prices: [{ currency: 'ARS', amount: 3000 }], icons: [] },
        { id: 'f2', name: 'Tagliatelle', description: 'Pasta lunga fresca. Porzione 350g', prices: [{ currency: 'ARS', amount: 2900 }], icons: [] },
        { id: 'f3', name: 'Cannelloni', description: 'Tre pezzi ripieni di verdura o carne, salsa a scelta', prices: [{ currency: 'ARS', amount: 3600 }], icons: [] },
        { id: 'f4', name: 'Lasagna', description: 'Porzione singola. Carne e besciamella', prices: [{ currency: 'ARS', amount: 3900 }], icons: [] },
        { id: 'f5', name: 'Cintas', description: 'Pasta all\'uovo. Porzione 350g', prices: [{ currency: 'ARS', amount: 3100 }], icons: [] },
        { id: 'f6', name: 'Capeleti', description: 'Ripieni di ricotta e spinaci. Porzione 350g', prices: [{ currency: 'ARS', amount: 3700 }], icons: [] },
      ],
    },
    {
      id: 'sec-2',
      name: 'Salse',
      items: [
        { id: 'i4', name: 'Sugo al pomodoro', prices: [{ currency: 'ARS', amount: 800 }], icons: [] },
        { id: 'i5', name: 'Salsa bianca', prices: [{ currency: 'ARS', amount: 900 }], icons: [] },
        { id: 'i6', name: 'Salsa quattro formaggi', prices: [{ currency: 'ARS', amount: 1100 }], icons: [] },
        { id: 's1', name: 'Salsa bolognese', description: 'Carne e pomodoro', prices: [{ currency: 'ARS', amount: 950 }], icons: [] },
        { id: 's2', name: 'Salsa filetto', description: 'Pomodoro naturale senza pelle', prices: [{ currency: 'ARS', amount: 850 }], icons: [] },
        { id: 's3', name: 'Salsa pesto', description: 'Basilico, aglio, pinoli e parmigiano', prices: [{ currency: 'ARS', amount: 1200 }], icons: [] },
      ],
    },
    {
      id: 'sec-3',
      name: 'Bevande',
      items: [
        { id: 'i7', name: 'Bibita', description: 'Coca-Cola, Coca-Cola Zero, Sprite, Fanta, Aquarius pompelmo', prices: [{ currency: 'ARS', label: '500ml', amount: 700 }], icons: [] },
        { id: 'i8', name: 'Acqua frizzante', prices: [{ currency: 'ARS', label: '500ml', amount: 500 }], icons: [] },
        { id: 'b1', name: 'Acqua naturale', prices: [{ currency: 'ARS', label: '500ml', amount: 450 }], icons: [] },
      ],
    },
  ],
};

const foodieData: { restaurant: PreviewRestaurant; menu: PreviewMenu; menus: PreviewMenu[] } = {
  restaurant: {
    id: 'preview-foodie',
    name: 'Casa de Pastas',
    slug: 'preview-foodie',
    description: 'En Casa de Pastas elaboramos pastas frescas cada día con recetas de la casa y materia prima seleccionada. Nuestras salsas son caseras: desde el tuco que cocinamos horas hasta el pesto y la salsa blanca. Elegí tu tipo de pasta y después la salsa que más te guste. Un lugar acogedor para comer en familia o con amigos, con porciones abundantes. Te esperamos de martes a domingo.',
    address: 'Av. Santa Fe 2500, Buenos Aires',
    phone: '+54 11 5555-1234',
    email: 'info@casadepastas.com',
    template: 'foodie',
    primaryColor: '#A52A2A',
    secondaryColor: '#D2B48C',
    country: 'Argentina',
    logoUrl: '/preview/logo-foodie.jpg',
    coverUrl: '/preview/portada-foodie.jpg',
  },
  menu: menuItalianoFoodie,
  menus: [menuItalianoFoodie, menuEspanolFoodie, menuEnglishFoodie],
};

/** Burgers: Hamburguesería, ARS */
const burgersData: { restaurant: PreviewRestaurant; menu: PreviewMenu } = {
  restaurant: {
    id: 'preview-burgers',
    name: "Big Daddy's Burgers & Grill",
    slug: 'preview-burgers',
    description: 'En Big Daddy\'s preparamos hamburguesas artesanales con carne de primera, pan recién horneado y los mejores ingredientes. También ofrecemos opciones a la parrilla, papas crujientes y salsas de la casa. Un lugar para disfrutar en familia o con amigos, con porciones generosas y el mejor trato. Te esperamos de lunes a domingo.',
    address: 'Av. Córdoba 1800, Buenos Aires',
    phone: '+54 11 4444-9999',
    email: 'pedidos@bigdaddysburgers.com',
    whatsapp: '54 11 4444-9999',
    website: 'https://bigdaddysburgers.com',
    template: 'burgers',
    primaryColor: '#ce6605',
    secondaryColor: '#c0392b',
    country: 'Argentina',
    logoUrl: '/preview/logo-burgers.jpg',
    coverUrl: '/preview/portada-burgers.jpg',
    templateConfig: {
      sectionTitleFontSize: 'large',
    },
  },
  menu: {
    id: 'preview-burgers-menu',
    slug: 'menu',
    name: 'Menu',
    restaurantId: 'preview-burgers',
    restaurantName: "Big Daddy's Burgers & Grill",
    restaurantSlug: 'preview-burgers',
    template: 'burgers',
    sections: [
      {
        id: 'sec-1',
        name: 'Hamburguesas',
        items: [
          { id: 'i1', name: 'Clásica', description: 'Carne, lechuga, tomate, cebolla', prices: [{ currency: 'ARS', amount: 13500 }], icons: [] },
          { id: 'i2', name: 'Doble con queso', description: 'Doble medallón y queso cheddar', prices: [{ currency: 'ARS', amount: 14200 }], icons: [] },
          { id: 'i3', name: 'Bacon & BBQ', description: 'Bacon crocante y salsa BBQ', prices: [{ currency: 'ARS', amount: 14500 }], icons: [] },
          { id: 'h4', name: 'Cheese Burger', description: 'Doble queso, pickles y salsa especial', prices: [{ currency: 'ARS', amount: 14300 }], icons: [] },
          { id: 'h5', name: 'Pollo crispy', description: 'Pechuga empanada, lechuga y mayonesa', prices: [{ currency: 'ARS', amount: 14000 }], icons: [] },
          { id: 'h6', name: 'Vegetariana', description: 'Medallón de garbanzos, rúcula y tomate', prices: [{ currency: 'ARS', amount: 13800 }], icons: ['vegetariano'] },
          { id: 'h7', name: 'Big Daddy', description: 'Doble carne, bacon, huevo y queso', prices: [{ currency: 'ARS', amount: 15200 }], icons: [] },
          { id: 'h8', name: 'Hawaiiana', description: 'Jamón, ananá grillado y queso', prices: [{ currency: 'ARS', amount: 14400 }], icons: [] },
          { id: 'h9', name: 'Picante', description: 'Jalapeños, salsa picante y queso', prices: [{ currency: 'ARS', amount: 14300 }], icons: ['picante'] },
          { id: 'h10', name: 'Blue Cheese', description: 'Queso azul, cebolla caramelizada', prices: [{ currency: 'ARS', amount: 14600 }], icons: [] },
          { id: 'h11', name: 'Stacker', description: 'Triple carne y triple queso', prices: [{ currency: 'ARS', amount: 15800 }], icons: [] },
          { id: 'h12', name: 'Smash', description: 'Carne aplastada a la plancha, crujiente', prices: [{ currency: 'ARS', amount: 14100 }], icons: [] },
        ],
      },
      {
        id: 'sec-2',
        name: 'Acompañamientos',
        items: [
          { id: 'i4', name: 'Papas fritas', prices: [{ currency: 'ARS', amount: 4200 }], icons: [] },
          { id: 'i5', name: 'Papas cheddar', description: 'Con queso cheddar y bacon', prices: [{ currency: 'ARS', amount: 4500 }], icons: [] },
          { id: 'a6', name: 'Aros de cebolla', description: 'Porción con salsa para dipping', prices: [{ currency: 'ARS', amount: 4400 }], icons: [] },
        ],
      },
      {
        id: 'sec-3',
        name: 'Bebidas',
        items: [
          { id: 'i6', name: 'Agua', description: 'Con o sin gas. 500ml', prices: [{ currency: 'ARS', label: '500ml', amount: 1200 }], icons: [] },
          { id: 'i7', name: 'Refrescos', description: 'Coca-Cola, Coca-Cola Zero, Sprite, Fanta, Aquarius', prices: [{ currency: 'ARS', label: '330ml', amount: 3500 }], icons: [] },
          { id: 'i8', name: 'Cerveza artesanal', description: 'Lager o IPA/APA', prices: [{ currency: 'ARS', label: '500ml', amount: 8500 }, { currency: 'ARS', label: 'IPA/APA', amount: 12000 }], icons: [] },
        ],
      },
    ],
  },
};

/** Italian Food: La Pizza del nonno, EUR. Tres menús: Italiano, Español, English */
const menuItalianoItalianFood: PreviewMenu = {
  id: 'preview-italianfood-menu-italiano',
  slug: 'italiano',
  name: 'Italiano',
  restaurantId: 'preview-italianfood',
  restaurantName: 'La Pizza del nonno',
  restaurantSlug: 'preview-italianfood',
  template: 'italianFood',
  sections: [
    {
      id: 'sec-1',
      name: 'Pizze',
      items: [
        { id: 'i1', name: 'Margherita', description: 'Pomodoro, mozzarella, basilico', prices: [{ currency: 'EUR', amount: 10 }], icons: [] },
        { id: 'i2', name: 'Quattro Formaggi', description: 'Mozzarella, gorgonzola, parmigiano, fontina', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
        { id: 'i3', name: 'Diavola', description: 'Pomodoro, mozzarella, salame piccante', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'p6', name: 'Prosciutto e funghi', description: 'Mozzarella, prosciutto cotto, funghi', prices: [{ currency: 'EUR', amount: 13 }], icons: [] },
        { id: 'p7', name: 'Calzone', description: 'Ripieno di pomodoro, mozzarella, prosciutto', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'p8', name: 'Napoletana', description: 'Pomodoro, mozzarella, acciughe, olive', prices: [{ currency: 'EUR', amount: 13 }], icons: [] },
        { id: 'p4', name: 'Marinara', description: 'Pomodoro, aglio, origano', prices: [{ currency: 'EUR', amount: 8 }], icons: ['vegano'] },
        { id: 'p5', name: 'Funghi', description: 'Pomodoro, mozzarella, funghi freschi', prices: [{ currency: 'EUR', amount: 11 }], icons: ['vegetariano'] },
        { id: 'p9', name: 'Ortolana', description: 'Mozzarella, melanzane, zucchine, peperoni', prices: [{ currency: 'EUR', amount: 12 }], icons: ['vegetariano'] },
      ],
    },
    {
      id: 'sec-2',
      name: 'Antipasti',
      items: [
        { id: 'i4', name: 'Bruschetta al pomodoro', description: 'Pane tostato con pomodoro fresco, aglio e basilico', prices: [{ currency: 'EUR', amount: 6 }], icons: [] },
        { id: 'i5', name: 'Caprese', description: 'Mozzarella, pomodoro, basilico', prices: [{ currency: 'EUR', amount: 8 }], icons: [] },
        { id: 'a6', name: 'Antipasto misto', description: 'Salumi, formaggi, olive e pane', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
      ],
    },
    {
      id: 'sec-3',
      name: 'Bevande',
      items: [
        { id: 'i6', name: 'Acqua naturale', description: '500ml', prices: [{ currency: 'EUR', label: '500ml', amount: 2.5 }], icons: [] },
        { id: 'i7', name: 'Bibite', description: 'Coca-Cola, Coca-Cola Zero, Sprite, Fanta, Aquarius', prices: [{ currency: 'EUR', label: '33cl', amount: 2.5 }], icons: [] },
        { id: 'b8', name: 'Birra', description: '33cl', prices: [{ currency: 'EUR', label: '33cl', amount: 3.5 }], icons: [] },
        { id: 'b9', name: 'Acqua frizzante', description: '500ml', prices: [{ currency: 'EUR', label: '500ml', amount: 2.5 }], icons: [] },
        { id: 'b11', name: 'Limonata', description: 'Fatta in casa. 33cl', prices: [{ currency: 'EUR', label: '33cl', amount: 3 }], icons: [] },
        { id: 'b12', name: 'Caffè espresso', prices: [{ currency: 'EUR', amount: 1.2 }], icons: [] },
        { id: 'b13', name: 'Cappuccino', prices: [{ currency: 'EUR', amount: 1.8 }], icons: [] },
        { id: 'b14', name: 'Caffè latte', prices: [{ currency: 'EUR', amount: 2 }], icons: [] },
        { id: 'b15', name: 'Decaffeinato', prices: [{ currency: 'EUR', amount: 1.5 }], icons: [] },
      ],
    },
  ],
};

const menuEspanolItalianFood: PreviewMenu = {
  id: 'preview-italianfood-menu-espanol',
  slug: 'espanol',
  name: 'Español',
  restaurantId: 'preview-italianfood',
  restaurantName: 'La Pizza del nonno',
  restaurantSlug: 'preview-italianfood',
  template: 'italianFood',
  sections: [
    {
      id: 'sec-1',
      name: 'Pizzas',
      items: [
        { id: 'i1', name: 'Margarita', description: 'Tomate, mozzarella, albahaca', prices: [{ currency: 'EUR', amount: 10 }], icons: [] },
        { id: 'i2', name: 'Cuatro quesos', description: 'Mozzarella, gorgonzola, parmesano, fontina', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
        { id: 'i3', name: 'Diavola', description: 'Tomate, mozzarella, salami picante', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'p6', name: 'Jamón y champiñones', description: 'Mozzarella, jamón cocido, champiñones', prices: [{ currency: 'EUR', amount: 13 }], icons: [] },
        { id: 'p7', name: 'Calzone', description: 'Relleno de tomate, mozzarella y jamón', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'p8', name: 'Napolitana', description: 'Tomate, mozzarella, anchoas, aceitunas', prices: [{ currency: 'EUR', amount: 13 }], icons: [] },
        { id: 'p4', name: 'Marinera', description: 'Tomate, ajo, orégano', prices: [{ currency: 'EUR', amount: 8 }], icons: ['vegano'] },
        { id: 'p5', name: 'Champiñones', description: 'Tomate, mozzarella, champiñones frescos', prices: [{ currency: 'EUR', amount: 11 }], icons: ['vegetariano'] },
        { id: 'p9', name: 'Vegetal', description: 'Mozzarella, berenjena, calabacín, pimiento', prices: [{ currency: 'EUR', amount: 12 }], icons: ['vegetariano'] },
      ],
    },
    {
      id: 'sec-2',
      name: 'Entrantes',
      items: [
        { id: 'i4', name: 'Bruschetta de tomate', description: 'Pan tostado con tomate fresco, ajo y albahaca', prices: [{ currency: 'EUR', amount: 6 }], icons: [] },
        { id: 'i5', name: 'Caprese', description: 'Mozzarella, tomate, albahaca', prices: [{ currency: 'EUR', amount: 8 }], icons: [] },
        { id: 'a6', name: 'Entrante surtido', description: 'Embutidos, quesos, aceitunas y pan', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
      ],
    },
    {
      id: 'sec-3',
      name: 'Bebidas',
      items: [
        { id: 'i6', name: 'Agua natural', description: '500ml', prices: [{ currency: 'EUR', label: '500ml', amount: 2.5 }], icons: [] },
        { id: 'i7', name: 'Refrescos', description: 'Coca-Cola, Coca-Cola Zero, Sprite, Fanta, Aquarius', prices: [{ currency: 'EUR', label: '33cl', amount: 2.5 }], icons: [] },
        { id: 'b8', name: 'Cerveza', description: '33cl', prices: [{ currency: 'EUR', label: '33cl', amount: 3.5 }], icons: [] },
        { id: 'b9', name: 'Agua con gas', description: '500ml', prices: [{ currency: 'EUR', label: '500ml', amount: 2.5 }], icons: [] },
        { id: 'b11', name: 'Limonada', description: 'Casera. 33cl', prices: [{ currency: 'EUR', label: '33cl', amount: 3 }], icons: [] },
        { id: 'b12', name: 'Café espresso', prices: [{ currency: 'EUR', amount: 1.2 }], icons: [] },
        { id: 'b13', name: 'Cappuccino', prices: [{ currency: 'EUR', amount: 1.8 }], icons: [] },
        { id: 'b14', name: 'Café con leche', prices: [{ currency: 'EUR', amount: 2 }], icons: [] },
        { id: 'b15', name: 'Descafeinado', prices: [{ currency: 'EUR', amount: 1.5 }], icons: [] },
      ],
    },
  ],
};

const menuEnglishItalianFood: PreviewMenu = {
  id: 'preview-italianfood-menu-english',
  slug: 'english',
  name: 'English',
  restaurantId: 'preview-italianfood',
  restaurantName: 'La Pizza del nonno',
  restaurantSlug: 'preview-italianfood',
  template: 'italianFood',
  sections: [
    {
      id: 'sec-1',
      name: 'Pizzas',
      items: [
        { id: 'i1', name: 'Margherita', description: 'Tomato, mozzarella, basil', prices: [{ currency: 'EUR', amount: 10 }], icons: [] },
        { id: 'i2', name: 'Four cheeses', description: 'Mozzarella, gorgonzola, parmesan, fontina', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
        { id: 'i3', name: 'Diavola', description: 'Tomato, mozzarella, spicy salami', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'p6', name: 'Ham and mushrooms', description: 'Mozzarella, cooked ham, mushrooms', prices: [{ currency: 'EUR', amount: 13 }], icons: [] },
        { id: 'p7', name: 'Calzone', description: 'Filled with tomato, mozzarella and ham', prices: [{ currency: 'EUR', amount: 12 }], icons: [] },
        { id: 'p8', name: 'Neapolitan', description: 'Tomato, mozzarella, anchovies, olives', prices: [{ currency: 'EUR', amount: 13 }], icons: [] },
        { id: 'p4', name: 'Marinara', description: 'Tomato, garlic, oregano', prices: [{ currency: 'EUR', amount: 8 }], icons: ['vegano'] },
        { id: 'p5', name: 'Mushroom', description: 'Tomato, mozzarella, fresh mushrooms', prices: [{ currency: 'EUR', amount: 11 }], icons: ['vegetariano'] },
        { id: 'p9', name: 'Vegetable', description: 'Mozzarella, aubergine, courgette, pepper', prices: [{ currency: 'EUR', amount: 12 }], icons: ['vegetariano'] },
      ],
    },
    {
      id: 'sec-2',
      name: 'Starters',
      items: [
        { id: 'i4', name: 'Bruschetta with tomato', description: 'Toasted bread with fresh tomato, garlic and basil', prices: [{ currency: 'EUR', amount: 6 }], icons: [] },
        { id: 'i5', name: 'Caprese', description: 'Mozzarella, tomato, basil', prices: [{ currency: 'EUR', amount: 8 }], icons: [] },
        { id: 'a6', name: 'Mixed starter', description: 'Cold cuts, cheeses, olives and bread', prices: [{ currency: 'EUR', amount: 14 }], icons: [] },
      ],
    },
    {
      id: 'sec-3',
      name: 'Drinks',
      items: [
        { id: 'i6', name: 'Still water', description: '500ml', prices: [{ currency: 'EUR', label: '500ml', amount: 2.5 }], icons: [] },
        { id: 'i7', name: 'Soft drinks', description: 'Coca-Cola, Coca-Cola Zero, Sprite, Fanta, Aquarius', prices: [{ currency: 'EUR', label: '33cl', amount: 2.5 }], icons: [] },
        { id: 'b8', name: 'Beer', description: '33cl', prices: [{ currency: 'EUR', label: '33cl', amount: 3.5 }], icons: [] },
        { id: 'b9', name: 'Sparkling water', description: '500ml', prices: [{ currency: 'EUR', label: '500ml', amount: 2.5 }], icons: [] },
        { id: 'b11', name: 'Lemonade', description: 'Homemade. 33cl', prices: [{ currency: 'EUR', label: '33cl', amount: 3 }], icons: [] },
        { id: 'b12', name: 'Espresso', prices: [{ currency: 'EUR', amount: 1.2 }], icons: [] },
        { id: 'b13', name: 'Cappuccino', prices: [{ currency: 'EUR', amount: 1.8 }], icons: [] },
        { id: 'b14', name: 'Latte', prices: [{ currency: 'EUR', amount: 2 }], icons: [] },
        { id: 'b15', name: 'Decaf', prices: [{ currency: 'EUR', amount: 1.5 }], icons: [] },
      ],
    },
  ],
};

const italianFoodData: { restaurant: PreviewRestaurant; menu: PreviewMenu; menus: PreviewMenu[] } = {
  restaurant: {
    id: 'preview-italianfood',
    name: 'La Pizza del nonno',
    slug: 'preview-italianfood',
    description: 'La Pizza del nonno è una pizzeria a Napoli dove la tradizione si incontra con il gusto. Usiamo solo ingredienti freschi e la nostra pasta viene preparata ogni giorno. Il forno a legna dona alle pizze il sapore autentico della cucina napoletana. Venite a trovarci per una vera esperienza italiana in famiglia.',
    address: 'Via Roma 42, Napoli',
    phone: '+39 081 123 4567',
    email: 'info@lapizzadelnonno.it',
    template: 'italianFood',
    primaryColor: '#009246',
    secondaryColor: '#CE2B37',
    country: 'Italia',
    logoUrl: '/preview/logo-italianFood.jpg',
    coverUrl: '/preview/portada-italianFood.jpg',
  },
  menu: menuItalianoItalianFood,
  menus: [menuItalianoItalianFood, menuEspanolItalianFood, menuEnglishItalianFood],
};

/** Imágenes reales del menú gourmet, servidas desde /images/ (frontend/public/images). */
const GOURMET_IMAGE = (name: string) => `/images/${name}.jpg`;

/** Gourmet: restaurante fino, algunos ítems con foto y otros sin (vista previa sin placeholder). */
const gourmetMenu: PreviewMenu = {
  id: 'preview-gourmet-menu',
  slug: 'carta-gourmet',
  name: 'Carta',
  description: 'Platos de temporada y propuestas del chef.',
  restaurantId: 'preview-gourmet',
  restaurantName: 'Lumina',
  restaurantSlug: 'preview-gourmet',
  template: 'gourmet',
  sections: [
    {
      id: 'g-entradas',
      name: 'Entradas',
      items: [
        { id: 'g-e1', name: 'Carpaccio de res', description: 'Finas láminas con rúcula, parmesano y alcaparras.', prices: [{ currency: 'EUR', amount: 14 }], icons: [], photos: [GOURMET_IMAGE('carpaccio-de-res')] },
        { id: 'g-e2', name: 'Tartar de atún', description: 'Atún rojo, aguacate y chips de wonton.', prices: [{ currency: 'EUR', amount: 16 }], icons: [], photos: [GOURMET_IMAGE('tartar-de-atun')] },
        { id: 'g-e3', name: 'Burrata con tomate', description: 'Burrata cremosa, tomate confitado y albahaca.', prices: [{ currency: 'EUR', amount: 12 }], icons: ['vegetariano'], photos: [GOURMET_IMAGE('burrata-con-tomate')] },
      ],
    },
    {
      id: 'g-principales',
      name: 'Platos principales',
      items: [
        { id: 'g-p1', name: 'Solomillo con reducción', description: 'Solomillo de ternera, reducción de vino tinto y puré de patata.', prices: [{ currency: 'EUR', amount: 28 }], icons: [], photos: [GOURMET_IMAGE('solomillo-con-reduccion')] },
        { id: 'g-p2', name: 'Risotto de setas', description: 'Arroz cremoso con setas de temporada y trufa.', prices: [{ currency: 'EUR', amount: 22 }], icons: ['vegetariano'], photos: [GOURMET_IMAGE('risotto-de-setas')] },
        { id: 'g-p3', name: 'Pescado del día', description: 'Pescado fresco según mercado, guarnición de temporada.', prices: [{ currency: 'EUR', amount: 24 }], icons: [], photos: [GOURMET_IMAGE('pescado-del-dia')] },
        { id: 'g-p4', name: 'Cordero confitado', description: 'Pierna de cordero confitada con verduras glaseadas.', prices: [{ currency: 'EUR', amount: 26 }], icons: [], photos: [GOURMET_IMAGE('cordero-confitado')] },
        { id: 'g-p5', name: 'Pechuga de pato a la naranja', description: 'Pechuga sellada con reducción de naranja y especias. Guarnición de puré de boniato.', prices: [{ currency: 'EUR', amount: 27 }], icons: [], photos: [GOURMET_IMAGE('pechuga-de-pato-a-la-naranja')] },
        { id: 'g-p6', name: 'Ravioli de langostinos', description: 'Ravioli relleno de langostinos con salsa de azafrán y espárragos verdes.', prices: [{ currency: 'EUR', amount: 25 }], icons: [], photos: [GOURMET_IMAGE('ravioli-de-langostinos')] },
      ],
    },
    {
      id: 'g-postres',
      name: 'Postres',
      items: [
        { id: 'g-d1', name: 'Soufflé de chocolate', description: 'Soufflé caliente con helado de vainilla.', prices: [{ currency: 'EUR', amount: 10 }], icons: ['vegetariano'], photos: [GOURMET_IMAGE('souffle-de-chocolate')] },
        { id: 'g-d2', name: 'Tarta de queso', description: 'Tarta de queso cremosa con coulis de frutos rojos.', prices: [{ currency: 'EUR', amount: 9 }], icons: ['vegetariano'], photos: [GOURMET_IMAGE('tarta-de-queso')] },
        { id: 'g-d3', name: 'Sorbete de limón', description: 'Sorbete refrescante con menta.', prices: [{ currency: 'EUR', amount: 7 }], icons: ['vegano', 'vegetariano'], photos: [GOURMET_IMAGE('sorbete-de-limon')] },
      ],
    },
    {
      id: 'g-bebidas',
      name: 'Bebidas',
      items: [
        { id: 'g-b1', name: 'Agua mineral', description: 'Con o sin gas. 500 ml.', prices: [{ currency: 'EUR', label: '500 ml', amount: 3 }], icons: [] },
        { id: 'g-b2', name: 'Vino de la casa', description: 'Tinto o blanco. Copa o botella.', prices: [{ currency: 'EUR', label: 'Copa', amount: 5 }, { currency: 'EUR', label: 'Botella', amount: 18 }], icons: [] },
        { id: 'g-b3', name: 'Café', description: 'Expresso, cortado, con leche o descafeinado.', prices: [{ currency: 'EUR', amount: 2.5 }], icons: [] },
      ],
    },
  ],
};

const gourmetData: { restaurant: PreviewRestaurant; menu: PreviewMenu; menus: PreviewMenu[] } = {
  restaurant: {
    id: 'preview-gourmet',
    name: 'Lumina',
    slug: 'preview-gourmet',
    description: 'En Lumina creemos que cada cena es un viaje. Nuestra cocina de autor apuesta por el producto de proximidad y de temporada, reinterpretado con técnica contemporánea y un toque personal. El equipo trabaja cada plato como una composición: texturas, contrastes y aromas al servicio del sabor. La carta cambia con las estaciones y con las ideas del chef, siempre con una base de materias primas seleccionadas y un servicio atento en un ambiente íntimo y elegante. Te invitamos a vivir una experiencia gastronómica en la que la luz, el espacio y el detalle forman parte del menú.',
    address: 'Calle Gourmet 1, Madrid',
    phone: '+34 91 555 01 02',
    email: 'reservas@lumina.es',
    website: 'https://lumina.es',
    template: 'gourmet',
    primaryColor: '#2c3e50',
    secondaryColor: '#8b6914',
    country: 'España',
    logoUrl: '/preview/logo-gourmet.jpg',
    coverUrl: '/preview/portada-gourmet.jpg',
  },
  menu: gourmetMenu,
  menus: [gourmetMenu],
};

export type PreviewDataResult = { restaurant: PreviewRestaurant; menu: PreviewMenu; menus?: PreviewMenu[] };

const previewData: Record<PreviewTemplateId, PreviewDataResult> = {
  classic: classicData,
  minimalist: minimalistData,
  foodie: foodieData,
  burgers: burgersData,
  italianFood: italianFoodData,
  gourmet: gourmetData,
};

export function getPreviewData(templateId: string): PreviewDataResult | null {
  if (TEMPLATE_IDS.includes(templateId as PreviewTemplateId)) {
    return previewData[templateId as PreviewTemplateId];
  }
  return null;
}

export function getPreviewTemplateIds(): PreviewTemplateId[] {
  return [...TEMPLATE_IDS];
}

/** Orden fijo de `TEMPLATE_IDS`; anterior/siguiente con bucle. */
export function getAdjacentPreviewTemplateIds(
  templateId: string,
): { prevId: PreviewTemplateId; nextId: PreviewTemplateId } | null {
  const ids = getPreviewTemplateIds();
  const idx = ids.indexOf(templateId as PreviewTemplateId);
  if (idx < 0) return null;
  const len = ids.length;
  const prevId = ids[(idx - 1 + len) % len];
  const nextId = ids[(idx + 1) % len];
  if (prevId == null || nextId == null) return null;
  return { prevId, nextId };
}
