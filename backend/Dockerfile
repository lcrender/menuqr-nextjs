# Etapa de desarrollo
FROM node:18-alpine AS development

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

# Exponer puerto
EXPOSE 3001

# Comando por defecto
CMD ["npm", "run", "start:dev"]

# Etapa de producción
FROM node:18-alpine AS production

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

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Cambiar ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3001

# Comando de producción
CMD ["npm", "run", "start:prod"]

