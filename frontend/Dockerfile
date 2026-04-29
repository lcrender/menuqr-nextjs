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

# ========================================
# Builder: compila Next (output: standalone)
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Build-time: deben coincidir con docker-compose (args) para rewrites y cliente
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_ENV
ARG INTERNAL_API_URL=http://127.0.0.1:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ========================================
# Producción: ejecuta server.js del standalone
# (incluye todas las rutas /pages, p. ej. /plantillas)
# ========================================
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
