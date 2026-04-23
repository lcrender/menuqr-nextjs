# Seeds de menús (CSV)

Archivos CSV para importar cartas de ejemplo o de migración.

## Uso

1. Panel **Menús** → **Nuevo menú** → **Importar menú con CSV**.
2. Elegí restaurante, nombre del menú y subí el `.csv` de esta carpeta (o copiá su contenido a tu hoja).

## Formato

Cabecera compatible con la plantilla pública:

`nombre_seccion`, `nombre_producto`, `descripcion_producto`, `destacado`, `alergenos`, `moneda_1`, `etiqueta_1`, `precio_1`, … hasta 5 precios.

- **Orden de secciones**: el orden en que aparece cada `nombre_seccion` por primera vez en el archivo.
- **Varias líneas de precio** en un solo producto: usá `moneda_N`, `etiqueta_N`, `precio_N` (ej. bocadillos con dos opciones).

Moneda de estos seeds: **EUR** (importes con punto decimal).
