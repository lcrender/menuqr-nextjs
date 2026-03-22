# Etapa de desarrollo
FROM node:18-alpine AS development

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

CMD ["npm", "run", "dev"]

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Build-time args para URLs públicas y modo producción (Next.js)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_ENV
# URL interna del backend para rewrites (/api-proxy → backend). En Docker: http://backend:3001
ARG INTERNAL_API_URL=http://127.0.0.1:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV INTERNAL_API_URL=$INTERNAL_API_URL

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando de producción
CMD ["npm", "run", "start"]

