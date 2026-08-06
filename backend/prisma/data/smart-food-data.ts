/**
 * Datos del restaurante Smart Food (plantilla smartFood).
 * Alineado con `frontend/data/preview-data.ts` → smartFoodData (4 menús ES/EN).
 * La demo de preview no incluye fotos de producto; solo logo en /preview/.
 */

export type SmartFoodPrice = { currency: string; label?: string; amount: number };

export type SmartFoodItem = {
  name: string;
  description?: string;
  prices: SmartFoodPrice[];
  icons: string[];
  photoPath?: string;
};

export type SmartFoodSection = {
  name: string;
  items: SmartFoodItem[];
};

export type SmartFoodMenu = {
  name: string;
  slug: string;
  description?: string;
  sort: number;
  sections: SmartFoodSection[];
};

export const SMART_FOOD_RESTAURANT = {
  name: 'Smart Food',
  slug: 'smart-food',
  description:
    'Comida real, equilibrada y deliciosa para tu día a día. En Smart Food priorizamos ingredientes frescos, opciones vegetarianas y veganas, y platos pensados para comer bien sin complicaciones. Ideal para almuerzos livianos, meriendas conscientes y bowls nutritivos.',
  address: 'Av. Santa Fe 3024, Palermo, Buenos Aires',
  /** Teléfono display + WhatsApp (formato panel: `phone | WhatsApp: digits`). */
  phone: '+54 11 5555-7890 | WhatsApp: 54 11 5555-7890',
  email: 'hola@smartfood.com.ar',
  website: 'https://smartfood.com.ar',
  template: 'smartFood',
  primaryColor: '#1B4332',
  secondaryColor: '#40916C',
  defaultCurrency: 'ARS',
  timezone: 'America/Argentina/Buenos_Aires',
  logoUrl: '/preview/logo-smart-food.png',
  coverUrl: null as string | null,
  templateConfig: {
    showCoverImage: false,
    showLogo: true,
    showRestaurantName: true,
    showRestaurantDescription: true,
    showTranslationFlags: false,
  },
};

export const SMART_FOOD_MENUS: SmartFoodMenu[] = [
  {
    name: 'Almuerzo',
    slug: 'es-almuerzo',
    description: 'Bowls, ensaladas, platos y bebidas para el mediodía.',
    sort: 0,
    sections: [
      {
        name: 'Bowls',
        items: [
          {
            name: 'Bowl mediterráneo',
            description: 'Quinoa, hummus, tomates cherry, pepino, aceitunas y semillas',
            prices: [{ currency: 'ARS', amount: 11800 }],
            icons: ['vegano', 'sin-lactosa'],
          },
          {
            name: 'Bowl proteico',
            description: 'Arroz integral, pollo grillado, brócoli, zanahoria y limón',
            prices: [{ currency: 'ARS', label: 'Regular', amount: 13200 }],
            icons: ['celiaco'],
          },
          {
            name: 'Bowl verde',
            description: 'Espinaca, kale, palta, garbanzos y aderezo de yogur',
            prices: [
              { currency: 'ARS', label: 'Chico', amount: 9800 },
              { currency: 'ARS', label: 'Grande', amount: 12400 },
            ],
            icons: ['vegetariano', 'sin-lactosa'],
          },
          {
            name: 'Bowl asiático picante',
            description: 'Arroz jasmine, tofu, edamame, zanahoria y salsa sriracha',
            prices: [{ currency: 'ARS', amount: 12100 }],
            icons: ['vegano', 'picante'],
          },
        ],
      },
      {
        name: 'Ensaladas',
        items: [
          {
            name: 'César liviana',
            description: 'Lechuga romana, pollo, croutons integrales y parmesano',
            prices: [{ currency: 'ARS', amount: 10900 }],
            icons: ['celiaco'],
          },
          {
            name: 'Ensalada de rúcula',
            description: 'Rúcula, tomate, nueces y reducción balsámica',
            prices: [{ currency: 'ARS', label: 'Individual', amount: 9200 }],
            icons: ['vegetariano', 'sin-gluten'],
          },
          {
            name: 'Power salad',
            description: 'Mix verde, huevo, quinoa y semillas de chía',
            prices: [{ currency: 'ARS', amount: 10500 }],
            icons: ['vegetariano'],
          },
        ],
      },
      {
        name: 'Platos',
        items: [
          {
            name: 'Salmón con vegetales',
            description: 'Filet grillado con zapallo asado y pesto de albahaca',
            prices: [{ currency: 'ARS', label: 'Plato', amount: 15800 }],
            icons: ['celiaco'],
          },
          {
            name: 'Wok de verduras',
            description: 'Verduras salteadas, jengibre y salsa de soja reducida en sodio',
            prices: [{ currency: 'ARS', amount: 11200 }],
            icons: ['vegano'],
          },
          {
            name: 'Curry suave de garbanzos',
            description: 'Garbanzos, arroz basmati y cilantro fresco',
            prices: [
              { currency: 'ARS', label: 'Con arroz', amount: 10800 },
              { currency: 'ARS', label: 'Solo curry', amount: 9400 },
            ],
            icons: ['vegano', 'picante'],
          },
        ],
      },
      {
        name: 'Bebidas',
        items: [
          {
            name: 'Agua saborizada',
            description: 'Pepino y menta o frutos rojos',
            prices: [{ currency: 'ARS', label: '500 ml', amount: 2800 }],
            icons: ['vegano', 'sin-lactosa'],
          },
          {
            name: 'Limonada natural',
            description: 'Exprimida al momento, sin azúcar agregada',
            prices: [{ currency: 'ARS', amount: 3200 }],
            icons: ['vegano', 'sin-gluten'],
          },
          {
            name: 'Smoothie verde',
            description: 'Espinaca, banana, manzana verde y jengibre',
            prices: [
              { currency: 'ARS', label: '350 ml', amount: 4500 },
              { currency: 'ARS', label: '500 ml', amount: 5200 },
            ],
            icons: ['vegano', 'vegetariano'],
          },
        ],
      },
    ],
  },
  {
    name: 'Merienda',
    slug: 'es-merienda',
    description: 'Tostadas y snacks para la tarde.',
    sort: 1,
    sections: [
      {
        name: 'Tostadas',
        items: [
          {
            name: 'Tostada de palta',
            description: 'Pan integral, palta, semillas y limón',
            prices: [{ currency: 'ARS', amount: 6800 }],
            icons: ['vegetariano', 'sin-lactosa'],
          },
          {
            name: 'Tostada de hummus',
            description: 'Pan sin gluten, hummus casero y tomate',
            prices: [{ currency: 'ARS', label: 'Clásica', amount: 7200 }],
            icons: ['vegano', 'sin-gluten'],
          },
        ],
      },
      {
        name: 'Snacks',
        items: [
          {
            name: 'Mix de frutos secos',
            description: 'Almendras, nueces y castañas de cajú',
            prices: [{ currency: 'ARS', amount: 5400 }],
            icons: ['vegano', 'sin-lactosa'],
          },
          {
            name: 'Barrita energética casera',
            description: 'Avena, dátiles, cacao y mantequilla de maní',
            prices: [{ currency: 'ARS', amount: 3800 }],
            icons: ['vegetariano', 'picante'],
          },
        ],
      },
    ],
  },
  {
    name: 'Lunch',
    slug: 'en-almuerzo',
    description: 'Bowls, salads, mains and drinks for lunch.',
    sort: 2,
    sections: [
      {
        name: 'Bowls',
        items: [
          {
            name: 'Mediterranean bowl',
            description: 'Quinoa, hummus, cherry tomatoes, cucumber, olives and seeds',
            prices: [{ currency: 'ARS', amount: 11800 }],
            icons: ['vegano', 'sin-lactosa'],
          },
          {
            name: 'Protein bowl',
            description: 'Brown rice, grilled chicken, broccoli, carrot and lemon',
            prices: [{ currency: 'ARS', label: 'Regular', amount: 13200 }],
            icons: ['celiaco'],
          },
          {
            name: 'Green bowl',
            description: 'Spinach, kale, avocado, chickpeas and yogurt dressing',
            prices: [
              { currency: 'ARS', label: 'Small', amount: 9800 },
              { currency: 'ARS', label: 'Large', amount: 12400 },
            ],
            icons: ['vegetariano', 'sin-lactosa'],
          },
          {
            name: 'Spicy Asian bowl',
            description: 'Jasmine rice, tofu, edamame, carrot and sriracha sauce',
            prices: [{ currency: 'ARS', amount: 12100 }],
            icons: ['vegano', 'picante'],
          },
        ],
      },
      {
        name: 'Salads',
        items: [
          {
            name: 'Light Caesar',
            description: 'Romaine lettuce, chicken, whole-grain croutons and Parmesan',
            prices: [{ currency: 'ARS', amount: 10900 }],
            icons: ['celiaco'],
          },
          {
            name: 'Arugula salad',
            description: 'Arugula, tomato, walnuts and balsamic reduction',
            prices: [{ currency: 'ARS', label: 'Individual', amount: 9200 }],
            icons: ['vegetariano', 'sin-gluten'],
          },
          {
            name: 'Power salad',
            description: 'Mixed greens, egg, quinoa and chia seeds',
            prices: [{ currency: 'ARS', amount: 10500 }],
            icons: ['vegetariano'],
          },
        ],
      },
      {
        name: 'Mains',
        items: [
          {
            name: 'Salmon with vegetables',
            description: 'Grilled fillet with roasted squash and basil pesto',
            prices: [{ currency: 'ARS', label: 'Plate', amount: 15800 }],
            icons: ['celiaco'],
          },
          {
            name: 'Vegetable wok',
            description: 'Stir-fried vegetables, ginger and reduced-sodium soy sauce',
            prices: [{ currency: 'ARS', amount: 11200 }],
            icons: ['vegano'],
          },
          {
            name: 'Mild chickpea curry',
            description: 'Chickpeas, basmati rice and fresh cilantro',
            prices: [
              { currency: 'ARS', label: 'With rice', amount: 10800 },
              { currency: 'ARS', label: 'Curry only', amount: 9400 },
            ],
            icons: ['vegano', 'picante'],
          },
        ],
      },
      {
        name: 'Drinks',
        items: [
          {
            name: 'Flavored water',
            description: 'Cucumber and mint or berries',
            prices: [{ currency: 'ARS', label: '500 ml', amount: 2800 }],
            icons: ['vegano', 'sin-lactosa'],
          },
          {
            name: 'Fresh lemonade',
            description: 'Freshly squeezed, no added sugar',
            prices: [{ currency: 'ARS', amount: 3200 }],
            icons: ['vegano', 'sin-gluten'],
          },
          {
            name: 'Green smoothie',
            description: 'Spinach, banana, green apple and ginger',
            prices: [
              { currency: 'ARS', label: '350 ml', amount: 4500 },
              { currency: 'ARS', label: '500 ml', amount: 5200 },
            ],
            icons: ['vegano', 'vegetariano'],
          },
        ],
      },
    ],
  },
  {
    name: 'Snack',
    slug: 'en-merienda',
    description: 'Toast and snacks for the afternoon.',
    sort: 3,
    sections: [
      {
        name: 'Toast',
        items: [
          {
            name: 'Avocado toast',
            description: 'Whole-grain bread, avocado, seeds and lemon',
            prices: [{ currency: 'ARS', amount: 6800 }],
            icons: ['vegetariano', 'sin-lactosa'],
          },
          {
            name: 'Hummus toast',
            description: 'Gluten-free bread, homemade hummus and tomato',
            prices: [{ currency: 'ARS', label: 'Classic', amount: 7200 }],
            icons: ['vegano', 'sin-gluten'],
          },
        ],
      },
      {
        name: 'Snacks',
        items: [
          {
            name: 'Mixed nuts',
            description: 'Almonds, walnuts and cashews',
            prices: [{ currency: 'ARS', amount: 5400 }],
            icons: ['vegano', 'sin-lactosa'],
          },
          {
            name: 'Homemade energy bar',
            description: 'Oats, dates, cocoa and peanut butter',
            prices: [{ currency: 'ARS', amount: 3800 }],
            icons: ['vegetariano', 'picante'],
          },
        ],
      },
    ],
  },
];
