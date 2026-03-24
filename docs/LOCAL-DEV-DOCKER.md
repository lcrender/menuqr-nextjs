# Desarrollo local con Docker

## Dos archivos Compose distintos

| Archivo | Uso | API en tu PC |
|--------|-----|----------------|
| **`docker-compose.dev.yml`** | Desarrollo local con puertos abiertos | **Sí:** `http://localhost:3001` |
| **`docker-compose.yml`** (default) | Deploy con Traefik (sin `ports` en backend) | **No:** el backend **no** escucha en `localhost:3001`; solo entra por el hostname HTTPS de Traefik |

Si levantás el stack **sin** `-f docker-compose.dev.yml` y abrís `http://localhost:3001/health`, **no va a responder**: no hay mapeo de puerto al host.

### Comando correcto para local

Desde la raíz del repo:

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:3000  
- Backend health: http://localhost:3001/health  
- Swagger: http://localhost:3001/api  

### Si el health sigue sin responder

1. **Ver estado y logs del backend**
   ```bash
   docker compose -f docker-compose.dev.yml ps
   docker compose -f docker-compose.dev.yml logs backend --tail 80
   ```
2. **Contenedor reiniciando o caído**  
   Suele ser validación de `.env` (Joi) o conexión a Postgres/Redis/MinIO. Los mensajes aparecen en los logs.
3. **`.env` en la raíz del repo**  
   `docker-compose.dev.yml` usa `env_file: .env` **y** luego `environment:` sobrescribe cosas críticas (`DATABASE_URL`, `REDIS_URL`, `JWT_*`, MinIO, `PORT`, etc.).  
   `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_ACCESS_TOKEN_TEST` se pasan también por interpolación (`${...}`) para que el backend las vea siempre.  
   **Después de editar el `.env`**, recreá el backend:  
   `docker compose -f docker-compose.dev.yml up -d --force-recreate backend`  
   Comprobación:  
   `docker compose -f docker-compose.dev.yml exec backend sh -c 'test -n "$MERCADOPAGO_ACCESS_TOKEN_TEST" && echo test_ok || echo test_vacio'`  
   Si el `.env` tiene valores raros en variables **no** sobrescritas por el compose, pueden romper el arranque. Revisá logs.
4. **Conflicto de puerto**  
   Si otro proceso usa `3001` o corrés Nest **en la máquina** y Docker a la vez, uno de los dos falla.

### Frontend local + API en Docker

`NEXT_PUBLIC_API_URL` en dev compose apunta a `http://localhost:3001`. Eso solo funciona si el backend publica `3001` (archivo **dev**).

---

## Health check

El endpoint público es:

`GET /health` → `{ "status": "ok", "timestamp": "..." }`

No requiere JWT.
