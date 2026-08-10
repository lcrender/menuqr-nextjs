/**
 * Contenido EN del artículo: Smart Food template + dietary filters.
 */

export const BLOG_ARTICLE_SMART_FOOD_EN = {
  slug: 'plantilla-smart-food-filtros-alimentarios',
  youtubeVideoId: '7emaNwmnLyI',
  demoHref: '/preview/smart-food',
  featuresHref: '/caracteristicas/smart-food',
  relatedHref: '/en/features/allergen-menu',
  lead: 'App Menu QR adds a new free template built for businesses that need a clear menu and dietary filters visible on mobile.',
  intro:
    'The Smart Food template is now available. It is aimed at restaurants, cafés, and healthy venues that want an organized digital QR menu—with navigation by menus and sections—and the ability to filter products by dietary preferences.',
  bodyFilters:
    'The main addition is the tag filter system: each product can carry labels such as gluten-free, lactose-free, vegetarian, vegan, or spicy. On the public menu, guests turn on one or more filters and only see matching dishes. If a filter does not apply to any product, it is hidden to keep the UI clean.',
  filterLabels: {
    glutenFree: 'gluten-free',
    lactoseFree: 'lactose-free',
    vegetarian: 'vegetarian',
    vegan: 'vegan',
    spicy: 'spicy',
  },
  closing:
    'Smart Food does not use a cover image: it prioritizes logo, restaurant name, description, and a fast menu scan. It is a free option—ideal if your offer focuses on vegan, gluten-free, or other dietary needs.',
  tagTranslationNote:
    'Default tag names translate automatically when the menu detects the language code: Spanish, English, Italian, French, German, and Russian. Labels appear in the language the guest is browsing.',
  bullets: [
    'Visible dietary filters (tags) with a clear-filters option',
    'Default tag names translated to the menu language (ES, EN, IT, FR, DE, RU)',
    'Navigation by menus (for example lunch and afternoon snack) and sections',
    'Clean, mobile-first design with QR access',
    'Free template, available on every plan',
  ],
  ctaDemoLabel: 'View Smart Food demo',
  ctaFeaturesLabel: 'View template features',
  videoHeading: 'Video: Smart Food in action',
  videoCaption: 'A walkthrough of the template and dietary filters.',
  openYoutube: 'Open on YouTube',
  videoIframeTitle: 'Smart Food template: dietary filters in App Menu QR',
  includesHeading: 'What’s included',
  relatedBefore: 'You can also read more about',
  relatedLinkLabel: 'allergen menus and dietary icons',
  relatedAfter: 'in the features section.',
} as const;
