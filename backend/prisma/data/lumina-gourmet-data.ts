/**
 * Datos del restaurante Lumina (plantilla Gourmet).
 * Mantener alineado con `frontend/data/preview-data.ts` → gourmetData / gourmetMenu.
 */

export type LuminaPrice = { currency: string; label?: string; amount: number };

export type LuminaItem = {
  name: string;
  description?: string;
  prices: LuminaPrice[];
  icons: string[];
  /** Ruta pública servida por el frontend, p. ej. /images/carpaccio-de-res.jpg */
  photoPath?: string;
};

export type LuminaSection = {
  name: string;
  items: LuminaItem[];
};

export const LUMINA_GOURMET_RESTAURANT = {
  name: 'Lumina',
  slug: 'lumina',
  description:
    'En Lumina creemos que cada cena es un viaje. Nuestra cocina de autor apuesta por el producto de proximidad y de temporada, reinterpretado con técnica contemporánea y un toque personal. El equipo trabaja cada plato como una composición: texturas, contrastes y aromas al servicio del sabor. La carta cambia con las estaciones y con las ideas del chef, siempre con una base de materias primas seleccionadas y un servicio atento en un ambiente íntimo y elegante. Te invitamos a vivir una experiencia gastronómica en la que la luz, el espacio y el detalle forman parte del menú.',
  address: 'Calle Gourmet 1, Madrid',
  phone: '+34 91 555 01 02',
  email: 'reservas@lumina.es',
  website: 'https://lumina.es',
  template: 'gourmet',
  primaryColor: '#2c3e50',
  secondaryColor: '#8b6914',
  defaultCurrency: 'EUR',
  timezone: 'Europe/Madrid',
  logoUrl: '/preview/logo-gourmet.jpg',
  coverUrl: '/preview/portada-gourmet.jpg',
};

export const LUMINA_GOURMET_MENU = {
  name: 'Carta',
  slug: 'carta-gourmet',
  description: 'Platos de temporada y propuestas del chef.',
  sections: [
    {
      name: 'Entradas',
      items: [
        {
          name: 'Carpaccio de res',
          description: 'Finas láminas con rúcula, parmesano y alcaparras.',
          prices: [{ currency: 'EUR', amount: 14 }],
          icons: [],
          photoPath: '/images/carpaccio-de-res.jpg',
        },
        {
          name: 'Tartar de atún',
          description: 'Atún rojo, aguacate y chips de wonton.',
          prices: [{ currency: 'EUR', amount: 16 }],
          icons: [],
          photoPath: '/images/tartar-de-atun.jpg',
        },
        {
          name: 'Burrata con tomate',
          description: 'Burrata cremosa, tomate confitado y albahaca.',
          prices: [{ currency: 'EUR', amount: 12 }],
          icons: ['vegetariano'],
          photoPath: '/images/burrata-con-tomate.jpg',
        },
      ],
    },
    {
      name: 'Platos principales',
      items: [
        {
          name: 'Solomillo con reducción',
          description: 'Solomillo de ternera, reducción de vino tinto y puré de patata.',
          prices: [{ currency: 'EUR', amount: 28 }],
          icons: [],
          photoPath: '/images/solomillo-con-reduccion.jpg',
        },
        {
          name: 'Risotto de setas',
          description: 'Arroz cremoso con setas de temporada y trufa.',
          prices: [{ currency: 'EUR', amount: 22 }],
          icons: ['vegetariano'],
          photoPath: '/images/risotto-de-setas.jpg',
        },
        {
          name: 'Pescado del día',
          description: 'Pescado fresco según mercado, guarnición de temporada.',
          prices: [{ currency: 'EUR', amount: 24 }],
          icons: [],
          photoPath: '/images/pescado-del-dia.jpg',
        },
        {
          name: 'Cordero confitado',
          description: 'Pierna de cordero confitada con verduras glaseadas.',
          prices: [{ currency: 'EUR', amount: 26 }],
          icons: [],
          photoPath: '/images/cordero-confitado.jpg',
        },
        {
          name: 'Pechuga de pato a la naranja',
          description:
            'Pechuga sellada con reducción de naranja y especias. Guarnición de puré de boniato.',
          prices: [{ currency: 'EUR', amount: 27 }],
          icons: [],
          photoPath: '/images/pechuga-de-pato-a-la-naranja.jpg',
        },
        {
          name: 'Ravioli de langostinos',
          description: 'Ravioli relleno de langostinos con salsa de azafrán y espárragos verdes.',
          prices: [{ currency: 'EUR', amount: 25 }],
          icons: [],
          photoPath: '/images/ravioli-de-langostinos.jpg',
        },
      ],
    },
    {
      name: 'Postres',
      items: [
        {
          name: 'Soufflé de chocolate',
          description: 'Soufflé caliente con helado de vainilla.',
          prices: [{ currency: 'EUR', amount: 10 }],
          icons: ['vegetariano'],
          photoPath: '/images/souffle-de-chocolate.jpg',
        },
        {
          name: 'Tarta de queso',
          description: 'Tarta de queso cremosa con coulis de frutos rojos.',
          prices: [{ currency: 'EUR', amount: 9 }],
          icons: ['vegetariano'],
          photoPath: '/images/tarta-de-queso.jpg',
        },
        {
          name: 'Sorbete de limón',
          description: 'Sorbete refrescante con menta.',
          prices: [{ currency: 'EUR', amount: 7 }],
          icons: ['vegano', 'vegetariano'],
          photoPath: '/images/sorbete-de-limon.jpg',
        },
      ],
    },
    {
      name: 'Bebidas',
      items: [
        {
          name: 'Agua mineral',
          description: 'Con o sin gas. 500 ml.',
          prices: [{ currency: 'EUR', label: '500 ml', amount: 3 }],
          icons: [],
        },
        {
          name: 'Vino de la casa',
          description: 'Tinto o blanco. Copa o botella.',
          prices: [
            { currency: 'EUR', label: 'Copa', amount: 5 },
            { currency: 'EUR', label: 'Botella', amount: 18 },
          ],
          icons: [],
        },
        {
          name: 'Café',
          description: 'Expresso, cortado, con leche o descafeinado.',
          prices: [{ currency: 'EUR', amount: 2.5 }],
          icons: [],
        },
      ],
    },
  ] satisfies LuminaSection[],
};
