#!/bin/sh
set -e
cd /app
# Si node_modules está vacío, instalar deps en el contenedor (no se puede rm: es un volumen montado)
# Si ves error de bcrypt/musl, ejecutá: docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up
if [ ! -f node_modules/.node_modules-ok ]; then
  echo "Instalando dependencias en el contenedor..."
  npm install
  npm run db:generate
  touch node_modules/.node_modules-ok
fi
exec "$@"
