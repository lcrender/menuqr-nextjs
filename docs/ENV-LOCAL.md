# Variables de entorno en desarrollo local

## Dónde va cada cosa

| Qué | Archivo / origen |
|-----|-------------------|
| API Nest (DB, JWT, MinIO, SMTP, CORS, límites de plan, MP server-side) | `backend/.env` (y opcional `backend/.env.local`) |
| Next en el **navegador** (`NEXT_PUBLIC_*`) y URL pública | `frontend/.env.local` (plantilla: `frontend/.env.example`) |
| Proxy interno de Next (`/api-proxy` → API) | `INTERNAL_API_URL` en el entorno del **proceso** que ejecuta Next (por defecto `http://127.0.0.1:3001` en `next.config.js`) |
| Docker Compose dev | Raíz `.env` + `environment:` en `docker-compose.dev.yml` (sobrescribe `NODE_ENV`, DB en red Docker, etc.) |

## Reglas importantes

1. **`NODE_ENV` en `backend/.env`**: para trabajo local debe ser **`development`**. Con `production`, el login exige email verificado aunque exista `SKIP_EMAIL_VERIFICATION` (la excepción de verificación solo aplica en desarrollo en código).
2. **No duplicar la fuente de verdad sin motivo**: si usás solo `npm run start:dev` en `backend/`, Nest **no** lee el `.env` de la raíz del monorepo. Copiá ahí las variables que necesites (p. ej. Mercado Pago) o usá Docker.
3. **Mercado Pago**: tokens de servidor (`MERCADOPAGO_ACCESS_TOKEN*`) van al **backend**. Claves públicas Bricks (`NEXT_PUBLIC_MERCADOPAGO_*`) van al **frontend** (`frontend/.env.local` o variables del servicio `frontend` en Docker).
4. **`FREE_PLAN_*`**: deben coincidir entre lo que use el backend en tu entorno y lo documentado en `env.example`, para no confundir límites al seedear o probar planes.

## Comandos típicos

- Backend: `cd backend && npm run start:dev` → carga `backend/.env`.
- Frontend: `cd frontend && cp .env.example .env.local` → editá y `npm run dev`.
- Todo en Docker: `docker compose -f docker-compose.dev.yml up` → raíz `.env` + overrides del compose.
