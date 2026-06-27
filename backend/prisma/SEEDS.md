# Seeds de Base de Datos (Prisma)

Este proyecto incluye varios scripts de seed para poblar la base de datos con datos de ejemplo o datos de sistema.

Todos los comandos se ejecutan desde la carpeta `backend`:

```bash
cd backend
```

---

## 1. Seeds principales

### 1.1. `db:seed`

Script: `prisma/seed.ts`

```bash
npm run db:seed
# o
npx ts-node prisma/seed.ts
```

Uso típico:

- Inicializa datos base del sistema (por ejemplo, iconos, configuraciones iniciales o datos técnicos necesarios para que la app funcione).

> Revisa el contenido de `prisma/seed.ts` para ver exactamente qué crea en tu entorno.

---

## 2. Seeds de ejemplos de restaurantes

### 2.1. `db:seed:examples`

Script: `prisma/seed-examples.ts`

```bash
npm run db:seed:examples
# o
npx ts-node prisma/seed-examples.ts
```

Este script:

- Crea un tenant demo (`Restaurante Demo S.A.`) si no existe.
- Crea varios restaurantes de ejemplo (pizzería argentina, pizzería italiana, parrilla, bodegón, tapas, casa de pastas).
- Para cada restaurante de ejemplo, crea:
  - 1 menú asociado.
  - Varias secciones (`MenuSection`) según la plantilla.
  - Productos (`MenuItem`) con sus precios (`ItemPrice`) preconfigurados.

Código relevante:

- `prisma/seed-examples.ts`
  - `ensureTenantAndIcons()`: garantiza la existencia de un tenant demo.
  - `createRestaurantWithMenu(...)`: crea restaurante, menú, secciones e items.
  - Arreglo `EXAMPLES`: define las configuraciones de cada restaurante demo.

> Este seed es útil para tener una demo completa con varios restaurantes y menús públicos de ejemplo.

---

## 3. Seed de un menú demo con 29 productos para un usuario

### 3.1. `seed-single-menu-29-items.ts`

Script: `prisma/seed-single-menu-29-items.ts`

Ejemplo de uso:

```bash
cd backend
npx ts-node prisma/seed-single-menu-29-items.ts lcrender@gmail.com
```

Parámetro:

- `lcrender@gmail.com`: email del usuario al que se le quiere crear el restaurante/menú de ejemplo.

Lo que hace:

1. Lee el **email** desde la línea de comandos.
2. Busca el `User` con ese email (`User.email`) y verifica que tenga `tenantId`.
   - Si no existe o no tiene `tenantId` (por ejemplo, SUPER_ADMIN sin tenant), el script aborta.
3. Para el **tenant** asociado a ese usuario:
   - Crea (o reutiliza) un restaurante demo con:
     - `name`: `Demo 29 productos ({prefijo-email})`
     - `slug`: `demo-29-{prefijo-email}`  
       (por ejemplo, para `lcrender@gmail.com` → `demo-29-lcrender`)
4. Crea (o reutiliza) un **menú** demo para ese restaurante:
   - `name`: `Menú demo 29 productos`
   - `slug`: `menu-demo-29`
   - `status`: `PUBLISHED`
5. Crea (o reutiliza) las secciones del menú:
   - `Entradas`
   - `Platos principales`
   - `Bebidas`
6. Crea productos hasta llegar a **29 productos** totales en ese menú:
   - Nombre: `Producto demo N`
   - Descripción: `Descripción del producto demo N`
   - Sección: se reparte cíclicamente (`N % número_de_secciones`) entre las 3 secciones.
   - Precio único (en `ItemPrice`):
     - `currency`: `ARS`
     - `label`: `Precio`
     - `amount`: `1000 + N * 100` (valor de ejemplo).

Archivo relevante:

- `backend/prisma/seed-single-menu-29-items.ts`

Este seed está pensado para que, dado un usuario concreto (por email), puedas dejarle armado rápidamente:

- 1 restaurante demo
- 1 menú demo
- Secciones básicas
- 29 productos de ejemplo listos para probar plantillas y vistas públicas.

---

## 4. Seed Lumina (plantilla Gourmet)

### 4.1. `seed-lumina-gourmet.ts`

Script: `prisma/seed-lumina-gourmet.ts`

Datos alineados con la vista previa de la plantilla Gourmet (`frontend/data/preview-data.ts`): restaurante **Lumina**, menú **Carta**, 15 productos con descripciones, precios en EUR, iconos dietéticos y fotos de `/images/*.jpg`.

Ejemplo de uso:

```bash
cd backend
npm run db:seed:lumina -- usuario@ejemplo.com
# o
npx ts-node --project prisma/tsconfig.json prisma/seed-lumina-gourmet.ts usuario@ejemplo.com
```

En producción (Docker):

```bash
cd /opt/menuqr
docker compose -f docker-compose.prod.yml exec -u root backend sh -c \
  'npm install ts-node@10.9.1 typescript@5.1.3 @types/node --no-save'
docker compose -f docker-compose.prod.yml exec backend sh -c \
  './node_modules/.bin/ts-node --project prisma/tsconfig.json --skip-project --transpile-only prisma/seed-lumina-gourmet.ts usuario@ejemplo.com'
```

Parámetro:

- Email del usuario cuyo `tenantId` recibirá el restaurante.

Lo que crea:

1. Restaurante **Lumina** (`slug: lumina`, plantilla `gourmet`, colores, logo y portada de preview).
2. Menú **Carta** (`slug: carta-gourmet`, publicado).
3. Secciones: Entradas, Platos principales, Postres, Bebidas.
4. 15 productos con precios, iconos (`vegetariano`, `vegano`) y fotos en `media_assets` (rutas `/images/...` servidas por el frontend).

Es idempotente: si el restaurante o los productos ya existen, los reutiliza sin duplicar.

Archivos:

- `prisma/seed-lumina-gourmet.ts`
- `prisma/data/lumina-gourmet-data.ts`

---

## 5. Notas y buenas prácticas

- Todos los seeds usan `PrismaClient`, por lo que `DATABASE_URL` en tu `.env` debe apuntar al entorno correcto (desarrollo, staging, etc.).
- Evita ejecutar seeds de ejemplo en producción salvo que sepas exactamente qué datos crean.
- Para inspeccionar la base de datos cómodamente, puedes usar:

```bash
cd backend
npm run db:studio
```

- Si agregas nuevos scripts de seed:
  - Nómbralos claramente (`seed-*.ts`).
  - Documenta:
    - Qué crean.
    - Para qué tenant / usuario / restaurante operan.
    - Ejemplos de ejecución desde la terminal.

