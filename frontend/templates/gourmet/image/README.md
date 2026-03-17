# Imágenes del menú de ejemplo (Gourmet)

Cada archivo corresponde a un producto del menú de vista previa. El nombre del archivo sigue el título del producto en minúsculas y con guiones, por ejemplo: `solomillo-con-reduccion.svg`.

Para usar fotos reales en lugar de los SVG, puedes reemplazar estos archivos por `.jpg` con el **mismo nombre** (p. ej. `solomillo-con-reduccion.jpg`) y actualizar en `frontend/data/preview-data.ts` la función `GOURMET_IMAGE` para usar la extensión `.jpg` en lugar de `.svg`. Las mismas imágenes deben existir en `public/preview/gourmet/` para que se sirvan en la vista previa.
