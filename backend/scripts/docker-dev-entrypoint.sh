#!/bin/sh
set -e
cd /app
# Volumen anónimo /app/node_modules: si agregás deps en package.json, el volumen viejo no las trae.
# Re-ejecutamos npm install cuando cambia package.json / package-lock.json (mtime vs marca).
# Si ves error de bcrypt/musl: docker compose -f docker-compose.dev.yml down -v && docker compose ... up
STAMP="node_modules/.docker-dev-deps-stamp"
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
fi

exec "$@"
