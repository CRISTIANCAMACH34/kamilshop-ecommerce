# ==============================================================================
# Dockerfile para Frontend React / Vite (E-COMERCE TIO Y CAMILA)
# Multi-stage: Compilación con Node 20 y servicio ultra-rápido con Nginx Alpine
# ==============================================================================

# Etapa 1: Compilación de la aplicación
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias limpias
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar para producción (genera /app/dist)
RUN npm run build


# Etapa 2: Imagen final de producción con Nginx
FROM nginx:1.27-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar la compilación desde la etapa previa
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
