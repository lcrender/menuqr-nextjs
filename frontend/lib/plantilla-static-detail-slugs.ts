/**
 * Slugs con landing dedicada en `pages/plantillas/<slug>.tsx`.
 * Excluir de `getStaticPaths` de `[slug].tsx` para no duplicar la ruta en el build.
 */
export const PLANTILLA_STATIC_DETAIL_SLUGS = new Set<string>([
  'classic',
  'minimalista',
  'foodie',
  'gourmet',
  'burgers',
  'italian-food',
]);
