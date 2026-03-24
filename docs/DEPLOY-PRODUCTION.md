# Despliegue producción (Docker Compose + Traefik)

## Por qué “no veo los cambios” en el frontend

Next.js en producción va **compilado dentro de la imagen**. Si solo hacés `up -d` sin recrear el contenedor con una imagen nueva, o el **build** no se hizo en la misma carpeta/repo actualizado, seguís viendo el bundle viejo.

Además: **Cloudflare** (u otro CDN) puede cachear HTML/JS; probá ventana privada, “hard refresh” (Ctrl+Shift+R) o **Purge Cache** en Cloudflare.

## Orden recomendado (en el servidor, carpeta del repo)

```bash
cd /ruta/al/MenuQR-CURSOR   # mismo directorio donde está docker-compose.prod.yml
git pull

# 1) Migraciones (antes o junto al deploy del backend)
docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate
# o: docker compose -f docker-compose.prod.yml exec backend npm run db:migrate
# (el contenedor backend debe existir y tener el código nuevo)

# 2) Reconstruir Y recrear frontend (y backend si hubo cambios de API)
docker compose -f docker-compose.prod.yml build --no-cache frontend backend
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend backend
```

**Importante:** `build` solo crea la imagen; **`up -d --force-recreate`** hace que Docker levante contenedores nuevos con esa imagen. Si solo corrés `build` y después `up -d` sin `--force-recreate`, a veces el contenedor no se reemplaza.

Equivalente en un solo paso para ambos servicios:

```bash
docker compose -f docker-compose.prod.yml up -d --build --force-recreate frontend backend
```

## Comprobar que el contenedor usa imagen reciente

```bash
docker compose -f docker-compose.prod.yml ps
docker image ls | head
```

La columna **CREATED** de la imagen del frontend debería ser reciente.

## Super admin: menú “Configuración”

Ese bloque solo aparece si en `localStorage` (usuario logueado) el rol es exactamente **`SUPER_ADMIN`**. Si en producción tu usuario es **`ADMIN`**, no verás Configuración (es esperado). Comprobá en la base de datos el `role` del usuario.

## Variables en build del frontend

`docker-compose.prod.yml` pasa `NEXT_PUBLIC_*` como **build args**. Cualquier cambio en esos args requiere **rebuild** del servicio `frontend`, no solo reiniciar el contenedor.
