# MenuQR: quitar puertos expuestos en el servidor

Si actualmente ves `0.0.0.0:3000->3000`, `0.0.0.0:5432->5432`, etc., los servicios están publicados al host. Para que **solo Traefik** sea la puerta de entrada (por dominio):

## 1. Quitar cualquier `ports:` del compose

- Este `docker-compose.yml` **no** define `ports:` en frontend, backend, postgres, redis ni minio.
- Si en el servidor tenés **`docker-compose.override.yml`** que añade `ports:`, borralo o renombrarlo:
  ```bash
  cd /opt/menuqr
  mv docker-compose.override.yml docker-compose.override.yml.bak   # si existe
  ```
- Si el `docker-compose.yml` que usás en el servidor tiene bloques `ports:` dentro de cada servicio, reemplazalo por el de este repo (sin ports).

## 2. Recrear los contenedores sin puertos

```bash
cd /opt/menuqr
docker compose down
docker compose up -d
```

## 3. Comprobar

```bash
docker ps
```

No deberías ver `0.0.0.0:3000`, `0.0.0.0:3001`, `0.0.0.0:5432`, `0.0.0.0:6379` ni `0.0.0.0:9000-9001` en la columna PORTS de los contenedores de MenuQR. Solo Traefik tendrá 80 y 443.

Acceso:

- Frontend: `https://menuqr.72-60-133-229.nip.io`
- API: `https://api.menuqr.72-60-133-229.nip.io`
- MinIO console (si la tenés): `https://minio.menuqr.72-60-133-229.nip.io`

## Resumen

| Antes (inseguro) | Después |
|------------------|---------|
| IP:3000 → MenuQR frontend | Solo por dominio vía Traefik |
| IP:3001 → API | Solo por dominio vía Traefik |
| IP:5432 → Postgres expuesto | Solo red Docker |
| IP:6379 → Redis expuesto | Solo red Docker |
| IP:9000-9001 → MinIO expuesto | Solo red Docker (consola por Traefik si está configurada) |

---

## Troubleshooting

### Backend no arranca: `"DATABASE_URL" must be a valid uri`

- El compose construye `DATABASE_URL` desde `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` del `.env` en `/opt/menuqr`.
- Revisá que en `.env` existan y no estén vacíos: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- Si la contraseña tiene caracteres como `@`, `#`, `:`, `/`, puede romper la URI; usá una contraseña sin esos caracteres o codificada en la URL.
- Para ver qué URL recibe el backend:  
  `docker compose -f docker-compose.prod.yml run --rm backend env | grep DATABASE_URL`

### Prisma migrate: OpenSSL / "Unexpected token E in JSON"

- Suele pasar con la imagen Alpine del backend. Asegurate de usar la imagen **slim** (ver `backend/Dockerfile`).
- En el servidor: `git pull`, luego reconstruir sin caché y levantar:
  ```bash
  cd /opt/menuqr
  docker compose -f docker-compose.prod.yml build --no-cache backend
  docker compose -f docker-compose.prod.yml up -d
  ```
- Después:  
  `docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy`
