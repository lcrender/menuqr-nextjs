# Etapa de desarrollo
FROM node:18-slim AS development

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Generar Prisma client
RUN npm run db:generate

# Entrypoint para dev: si node_modules está vacío (volumen), instala deps en el contenedor
COPY scripts/docker-dev-entrypoint.sh /docker-dev-entrypoint.sh
RUN chmod +x /docker-dev-entrypoint.sh

# Exponer puerto
EXPOSE 3001

ENTRYPOINT ["/docker-dev-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# Etapa de producción
FROM node:18-slim AS production

# Prisma schema/query engine requiere OpenSSL en runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incl. dev para nest build)
RUN npm install

# Copiar código fuente
COPY . .

# Generar Prisma client y construir aplicación
RUN npm run db:generate && npm run build

# Quitar devDependencies para imagen final
RUN npm prune --production

# Crear usuario no-root (Debian: groupadd/useradd)
RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --shell /bin/false --create-home nestjs

# Cambiar ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3001

# Comando de producción
CMD ["npm", "run", "start:prod"]

