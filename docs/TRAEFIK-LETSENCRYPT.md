# Let's Encrypt con Traefik (AppMenuQR en producción)

Los contenedores de AppMenuQR solo dicen **qué dominio** usan y **qué certresolver** debe emitir el certificado (`tls.certresolver=mytlschallenge` en `docker-compose.prod.yml`). **Traefik** (instalación global en el VPS) es quien habla con Let's Encrypt y guarda los certificados.

## Requisitos previos

1. **DNS**: cada host (`appmenuqr.com`, `www`, `api.appmenuqr.com`, `s3.appmenuqr.com`, `minio.appmenuqr.com`) con registro **A** (o AAAA) apuntando a la **IP pública del VPS**.
2. **Puertos** en el VPS (firewall / Hostinger): **80** y **443** abiertos hacia Traefik.
3. **Red Docker**: los servicios AppMenuQR están en `root_default` y Traefik debe poder alcanzarlos (misma red, como en `traefik.docker.network=root_default`).

## Nombre del certresolver

En `docker-compose.prod.yml` se usa **`mytlschallenge`**. Ese nombre tiene que existir **exactamente igual** en la configuración estática de Traefik (`certificatesResolvers`).

Si en tu servidor el resolver se llama distinto (por ejemplo `letsencrypt`), o bien:

- cambias las labels en `docker-compose.prod.yml` a ese nombre, **o**
- renombras el bloque en Traefik a `mytlschallenge`.

## Ejemplo: Traefik v2 / v3 con TLS challenge (recomendado si 443 ya lo usa Traefik)

Archivo estático (p. ej. `traefik.yml`):

```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  mytlschallenge:
    acme:
      email: tu-email@ejemplo.com   # email de Let's Encrypt (avisos de expiración)
      storage: /letsencrypt/acme.json
      tlsChallenge: {}
```

- `tlsChallenge`: Let's Encrypt valida el dominio por el puerto **443** (Traefik responde al challenge TLS).
- **Alternativa** `httpChallenge` con `entryPoint: web`: validación por **puerto 80** (útil si 443 no está disponible para el challenge).

Ejemplo con HTTP challenge:

```yaml
certificatesResolvers:
  mytlschallenge:
    acme:
      email: tu-email@ejemplo.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

En ese caso el entrypoint `web` debe estar escuchando en **:80** sin bloquear la ruta `/.well-known/acme-challenge/` (Traefik la sirve solo para ACME).

## Comando Docker de Traefik (referencia)

Asegurate de:

- Montar un **volumen** para `acme.json` (persistencia de certificados).
- Publicar **`-p 80:80` y `-p 443:443`**.
- Conectar Traefik a la red **`root_default`** (`--providers.docker.network=root_default` o equivalente).

Ejemplo mínimo de flags (adaptar rutas y versión de imagen):

```bash
docker run -d \
  -p 80:80 -p 443:443 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /opt/traefik/letsencrypt/acme.json:/letsencrypt/acme.json \
  -v /opt/traefik/traefik.yml:/etc/traefik/traefik.yml:ro \
  --network root_default \
  traefik:v3.0 \
  --api.dashboard=true \
  --providers.docker=true \
  --providers.docker.exposedbydefault=false \
  --entrypoints.web.address=:80 \
  --entrypoints.websecure.address=:443 \
  --certificatesresolvers.mytlschallenge.acme.tlschallenge=true \
  --certificatesresolvers.mytlschallenge.acme.email=tu@email.com \
  --certificatesresolvers.mytlschallenge.acme.storage=/letsencrypt/acme.json
```

Crear `acme.json` vacío y permisos restrictivos **antes** del primer arranque:

```bash
touch /opt/traefik/letsencrypt/acme.json
chmod 600 /opt/traefik/letsencrypt/acme.json
```

## Cómo comprobar que funciona

1. Levantar Traefik y luego `docker compose -f docker-compose.prod.yml up -d`.
2. Ver logs de Traefik: deberían aparecer mensajes de obtención de certificado para cada host (o errores claros si falla DNS o el puerto).
3. Abrir `https://appmenuqr.com` y revisar el candado del navegador (certificado emitido por Let's Encrypt).

## Errores que suelen verse en logs (producción)

### `Router uses a nonexistent certificate resolver certificateResolver=letsencrypt`

En Traefik **no está definido** un resolver llamado `letsencrypt`, pero otros stacks (paneles-mgi, server-admin-v, etc.) tienen en las labels `tls.certresolver=letsencrypt`.

**Solución (elegí una):**

- En la **config estática de Traefik**, duplicar el bloque ACME con el nombre `letsencrypt` apuntando al mismo `storage` y email que `mytlschallenge`, **o**
- Cambiar las labels de esos proyectos a `tls.certresolver=mytlschallenge` (mismo nombre que AppMenuQR).

AppMenuQR en `docker-compose.prod.yml` usa **`mytlschallenge`** a propósito para coincidir con un resolver que sí exista en tu servidor.

### `cannot be linked automatically with multiple Services` (MinIO)

Ocurre cuando **un solo contenedor** define más de un `traefik.http.services.*.loadbalancer.server.port`. Traefik no sabe a qué servicio enlazar cada router.

**Solución:** en `docker-compose.prod.yml` de AppMenuQR cada router tiene `traefik.http.routers.<nombre>.service=<nombre-del-servicio>` y los servicios S3 vs consola tienen nombres distintos (`menuqr-s3` y `menuqr-minio-console`).

### ACME: `tls: no application protocol` / `error:tls :: ... no application protocol`

Let's Encrypt usa el challenge **TLS-ALPN-01** cuando configurás `tlsChallenge: {}`. A veces falla detrás de ciertos proxies o versiones de Traefik.

**Solución:** en Traefik, para `mytlschallenge`, probá **HTTP challenge** en el puerto 80:

```yaml
certificatesResolvers:
  mytlschallenge:
    acme:
      email: tu@email.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

Quitá `tlsChallenge` si lo teníais. Reiniciá Traefik y volvé a pedir certificados.

### `curl -I https://api...` → HTTP 404

Muchas APIs no tienen ruta en `/`; un **404** con cabeceras JSON de Nest puede significar que **el backend responde bien** por HTTPS. Probar: `curl -sI https://api.appmenuqr.com/health` o la ruta que exponga tu API.

Si en las cabeceras sigue apareciendo `access-control-allow-origin: https://dominio-viejo...`, actualizá en el **`.env` del backend** `CORS_ORIGIN` (y URLs públicas) y reiniciá `menuqr_backend`.

### Traefik v3: `Host(\`a\`,\`b\`)` — unexpected number of parameters

En **Traefik 3** la regla correcta para varios hosts es:

`Host(\`dominio1.com\`) || Host(\`www.dominio1.com\`)`

no `Host(\`a\`,\`b\`)` (sintaxis vieja).

## Errores frecuentes

| Problema | Causa habitual |
|----------|----------------|
| `timeout` / `connection refused` en ACME | Puerto 80 u 443 no llega al contenedor Traefik o firewall del proveedor. |
| `NXDOMAIN` / no valida el dominio | DNS del subdominio no apunta aún a la IP del VPS o propagación pendiente. |
| Certificado no se renueva | `acme.json` no persistente (se borra al recrear el contenedor). |
| Router sin TLS | Falta `tls=true` y `tls.certresolver=...` en las labels (en AppMenuQR ya están). |

## Staging (pruebas sin límite estricto de Let's Encrypt)

Para probar sin agotar cuotas, en Traefik podés usar la URL de staging de ACME; cuando todo funcione, volver a producción.

---

**Resumen:** AppMenuQR ya pide certificados con `certresolver=mytlschallenge`. Solo necesitás que Traefik en el VPS tenga ese resolver configurado con ACME (TLS o HTTP challenge), puertos 80/443 abiertos y DNS correcto hacia el VPS.
