# ============================================================================
#  Imagen del frontend: build con Vite y servido por Nginx.
# ============================================================================

# --- Etapa de compilación ---
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# En Railway se inyecta VITE_API_URL=https://<backend>.railway.app/api/v1
# En local (docker-compose) se inyecta VITE_API_URL=http://localhost:4000/api/v1
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Etapa de servidor ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
