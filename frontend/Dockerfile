# ============================================================================
#  Imagen del frontend: build con Vite y servido por Nginx.
# ============================================================================

# --- Etapa de compilación ---
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# VITE_API_URL se deja sin definir: en producción se usa /api/v1 (proxy Nginx).
RUN npm run build

# --- Etapa de servidor ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
