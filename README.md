# MenuQR - SaaS de Menús de Restaurantes

MVP funcional para gestión de menús de restaurantes con sistema multi-tenant y Row Level Security (RLS).

## 🚀 Características

- **Multi-tenant** con PostgreSQL + RLS
- **Autenticación JWT** con refresh tokens
- **Roles**: super_admin (global) y admin (por tenant)
- **Gestión de restaurantes** y menús con versionado
- **Plantillas de diseño** para menús
- **Generación de QR** para menús públicos
- **Cache Redis** para optimización
- **Sistema de íconos** (celíaco, picante, vegano, etc.)
- **Internacionalización** preparada (español por defecto)
- **Auditoría completa** de cambios
- **Rate limiting** y seguridad

## 🏗️ Arquitectura

- **Backend**: NestJS + Prisma + PostgreSQL + Redis
- **Frontend**: Next.js + Bootstrap
- **Storage**: MinIO (S3-compatible)
- **Infra**: Docker Compose
- **Seguridad**: RLS, JWT, bcrypt, rate limiting

## 📋 Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

## 🚀 Setup Rápido

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd MenuQR-CURSOR
cp .env.example .env
# Editar .env con tus configuraciones
```

### 2. Levantar servicios

**Desarrollo en tu máquina (API en `localhost:3001`):**

```bash
docker compose -f docker-compose.dev.yml up --build
```

**Stack tipo producción / Traefik** (el `docker-compose.yml` por defecto **no** expone `3001` en el host; la API no se prueba con `http://localhost:3001`):

```bash
docker compose up -d
```

Más detalle: [`docs/LOCAL-DEV-DOCKER.md`](docs/LOCAL-DEV-DOCKER.md).

### 3. Ejecutar migraciones y seeds

```bash
# En una nueva terminal
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (admin/admin123)

## 🔐 Primer Super Admin

Después de ejecutar los seeds, puedes acceder con:

- **Email**: superadmin@menuqr.com
- **Password**: SuperAdmin123!

## 🌐 Variables de Entorno

Ver `.env.example` para todas las variables disponibles. Las principales:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/menuqr"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="tu-secret-super-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret"

# MinIO
MINIO_ROOT_USER="admin"
MINIO_ROOT_PASSWORD="admin123"
```

## 🏢 Estructura del Proyecto

```
MenuQR-CURSOR/
├── backend/                 # API NestJS
├── frontend/               # Next.js App
├── docker-compose.yml      # Servicios
├── .env.example           # Variables de entorno
└── scripts/               # Scripts de utilidad
```

## 🔒 Seguridad y RLS

### Row Level Security

Todas las tablas de negocio implementan RLS:

```sql
-- Ejemplo de política
CREATE POLICY tenant_isolation ON restaurants
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Tenant Context

En cada request autenticado:

```typescript
// Middleware automáticamente setea app.tenant_id
await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, false)`;
```

## 📊 Cache y Invalidación

### Flujo de Cache

1. **Menú publicado** → Cacheado en Redis
2. **Edición de menú** → Cache invalidado automáticamente
3. **Nueva publicación** → Cache regenerado

### Endpoints Cacheables

- `GET /r/{restaurant_slug}` - Menú público
- `GET /m/{menu_slug}` - Menú específico

## 🌍 Internacionalización

### Agregar Nuevo Idioma

1. Crear archivo en `frontend/locales/{locale}.json`
2. Agregar traducciones
3. Configurar en `frontend/i18n/config.ts`

### Estructura de Traducciones

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "menu": {
    "title": "Nuestro Menú"
  }
}
```

## 🎨 Plantillas de Menú

### Agregar Nueva Plantilla

1. Crear componente en `frontend/components/templates/`
2. Agregar estilos en `frontend/styles/templates/`
3. Registrar en `frontend/config/templates.ts`

### Plantillas Disponibles

- **Classic**: Diseño tradicional y elegante
- **Modern**: Minimalista y responsive
- **Foodie**: Enfocado en imágenes y descripciones

## 🧪 Testing

```bash
# Backend
docker compose exec backend npm run test
docker compose exec backend npm run test:e2e

# Frontend
docker compose exec frontend npm run test
```

## 📈 Métricas y Monitoreo

- **Logs estructurados** en JSON
- **Request ID** en cada request
- **Auditoría** de cambios en `audit_logs`
- **Métricas básicas** para super_admin

## 🚀 Deploy

### Producción

1. Configurar variables de entorno de producción
2. Usar `docker-compose.prod.yml`
3. Configurar dominio y SSL
4. Ejecutar migraciones

### Backup y Restore

```bash
# Backup
./scripts/backup.sh

# Restore
./scripts/restore.sh backup_file.sql
```

## 🔧 Desarrollo

### Desarrollo local (recomendado)

Solo infra en Docker; backend y frontend en tu máquina (sin problemas de volúmenes ni builds):

```bash
# Terminal 1: infra
docker compose -f docker-compose.dev.yml up -d postgres redis minio

# Terminal 2: backend
cd backend && npm install && npm run start:dev

# Terminal 3: frontend
cd frontend && npm install && npm run dev
```

Primera vez (migraciones y seed):

```bash
cd backend
npx prisma migrate deploy
npm run db:seed
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:3001  
- Asegurate que `.env` tenga `DATABASE_URL`, `REDIS_URL` y MinIO apuntando a `localhost` y los puertos 5432, 6379, 9000.
- **Redis**: el contenedor corre y `REDIS_URL` es obligatoria; el backend **aún no usa Redis** para caché (usa memoria). Detalle y planes futuros: [backend/docs/REDIS.md](backend/docs/REDIS.md).

### Modo desarrollo (todo en Docker, hot reload)

Para levantar todo en modo dev con recarga al guardar cambios:

```bash
docker compose -f docker-compose.dev.yml up
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:3001  
- **Postgres**: localhost:5432 | **Redis**: localhost:6379 | **MinIO**: http://localhost:9000 (consola :9001)  
  → Redis: [backend/docs/REDIS.md](backend/docs/REDIS.md)

Primera vez (o si la base está vacía):

```bash
# Aplicar migraciones (usa imagen sin montar código, evita errores Prisma/OpenSSL)
docker compose -f docker-compose.dev.yml --profile tools run --rm backend-run npx prisma migrate deploy

# Datos de prueba (mismo servicio sin volúmenes)
docker compose -f docker-compose.dev.yml --profile tools run --rm backend-run npm run db:seed
```

Si el seed falla con error de Prisma/OpenSSL (libssl, musl), usá `backend-run` como arriba en lugar de `backend`.

### Comandos Útiles

```bash
# Ver logs
docker compose logs -f backend

# Ejecutar migración
docker compose exec backend npm run db:migrate

# Resetear base de datos
docker compose exec backend npm run db:reset

# Ejecutar seeds
docker compose exec backend npm run db:seed
```

### Estructura de Base de Datos

- **Tenants**: Organizaciones/empresas
- **Users**: Usuarios del sistema
- **Restaurants**: Restaurantes por tenant
- **Menus**: Menús por restaurante
- **Menu Items**: Productos del menú
- **Media Assets**: Imágenes y archivos
- **Icons**: Íconos para productos
- **Audit Logs**: Registro de cambios

## 📝 Licencia

MIT License

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch
3. Commit cambios
4. Push al branch
5. Crear Pull Request

## 📞 Soporte

Para dudas o problemas, crear un issue en el repositorio.

