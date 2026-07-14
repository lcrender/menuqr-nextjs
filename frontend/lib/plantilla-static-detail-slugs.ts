/**
 * Slugs con landing dedicada en `pages/caracteristicas/<slug>.tsx`.
 * Excluir de `getStaticPaths` de `[slug].tsx` para no duplicar la ruta en el build.
 */
export const PLANTILLA_STATIC_DETAIL_SLUGS = new Set<string>([
  'classic',
  'minimalista',
  'foodie',
  'gourmet',
  'modern-food',
  'night-club',
  'burgers',
  'italian-food',
  'smart-food',
  'beach-bar',
  'sol-noche',
]);
