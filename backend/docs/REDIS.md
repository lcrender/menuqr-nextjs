# Redis en AppMenuQR

Documentación del rol de **Redis** en el stack (desarrollo y producción) y del estado actual del código.

## Estado actual

| Aspecto | Detalle |
|--------|---------|
| **Servicio Docker** | Redis está definido en `docker-compose.prod.yml`, `docker-compose.dev.yml` y `docker-compose.yml` (imagen `redis:7-alpine`, `appendonly` para persistencia, volumen de datos). |
| **Variable `REDIS_URL`** | Obligatoria en la validación de entorno (`backend/src/common/config/validation.schema.ts`). Ejemplo en Docker: `redis://redis:6379`. |
| **Arranque en producción** | El backend declara `depends_on` con condición `service_healthy` sobre Redis. |
| **Uso en la aplicación** | **Hoy el backend no abre conexión a Redis.** No hay cliente Redis registrado en módulos Nest. |

### Caché HTTP (rutas públicas)

- En `app.module.ts`, `CacheModule.registerAsync` solo configura `ttl` y `max`: usa el **store en memoria por defecto** de `@nestjs/cache-manager`.
- `PublicController` usa `CacheInterceptor` y `@CacheTTL(300)`: la caché vive **en el proceso Node** (por instancia), no en Redis.
- Implicaciones: al reiniciar el backend se pierde esa caché; con **varias réplicas** cada una tiene su propia caché (no compartida).

## Por qué Redis sigue en el proyecto

- Infraestructura **preparada para el futuro**: caché distribuida, colas de trabajos, rate limiting compartido, sesiones, etc.
- En `backend/package.json` ya existen dependencias relacionadas (`redis`, `cache-manager-ioredis`, `cache-manager-redis-store`) que **no están cableadas** en `AppModule` para sustituir el store en memoria.

## Próximos pasos (cuando se quiera usar Redis de verdad)

1. **Caché HTTP con Redis**  
   - Configurar `CacheModule.registerAsync` con un store Redis (p. ej. vía `cache-manager-ioredis` o el paquete que prefieran) usando `REDIS_URL` desde `ConfigService`.  
   - Definir prefijo de claves por entorno y revisar TTL por ruta (`@CacheTTL`).

2. **Operación**  
   - Mantener backups del volumen Redis si la política de negocio lo requiere (además de Postgres y MinIO).

3. **Otras ideas**  
   - Colas: Bull/BullMQ sobre Redis.  
   - Límites de peticiones compartidos entre instancias (si se deja de usar solo memoria).

## Referencias en el código

- Validación env: `backend/src/common/config/validation.schema.ts` (`REDIS_URL`).
- Caché global: `backend/src/app.module.ts` (`CacheModule.registerAsync`).
- Caché en rutas públicas: `backend/src/public/public.controller.ts` (`CacheInterceptor`, `CacheTTL`).
- Módulo `common/cache`: placeholder vacío (`backend/src/common/cache/cache.module.ts`); candidato a centralizar cliente Redis en el futuro.
