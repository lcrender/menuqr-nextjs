#!/bin/sh
set -e
cd /app
# Volumen anónimo /app/node_modules: si agregás deps en package.json, el volumen viejo no las trae.
# Re-ejecutamos npm install cuando cambia package.json / package-lock.json (mtime vs marca).
# Si ves error de bcrypt/musl: docker compose -f docker-compose.dev.yml down -v && docker compose ... up
STAMP="node_modules/.docker-dev-deps-stamp"
PRISMA_SCHEMA_STAMP="node_modules/.prisma-schema-stamp"
need_install=
if [ ! -f "$STAMP" ]; then
  need_install=1
elif [ package.json -nt "$STAMP" ]; then
  need_install=1
elif [ -f package-lock.json ] && [ package-lock.json -nt "$STAMP" ]; then
  need_install=1
fi

if [ -n "$need_install" ]; then
  echo "Sincronizando dependencias en el contenedor (npm install)..."
  npm install
  npm run db:generate
  touch "$STAMP"
  touch "$PRISMA_SCHEMA_STAMP"
fi

# Sin cambiar package.json, el schema de Prisma puede haberse actualizado (git pull, nuevas migraciones).
# Si no regeneramos, Nest falla con "supportTicket does not exist on PrismaService".
if [ -f prisma/schema.prisma ]; then
  if [ ! -f "$PRISMA_SCHEMA_STAMP" ] || [ prisma/schema.prisma -nt "$PRISMA_SCHEMA_STAMP" ]; then
    echo "Prisma: regenerando cliente (@prisma/client) porque cambió prisma/schema.prisma..."
    npm run db:generate
    touch "$PRISMA_SCHEMA_STAMP"
  fi
fi

exec "$@"
