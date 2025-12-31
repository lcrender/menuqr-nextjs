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

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

# Generar Prisma client
RUN npm run db:generate

# Construir aplicación
RUN npm run build

# Limpiar dependencias de desarrollo
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

