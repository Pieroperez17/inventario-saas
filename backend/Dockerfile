# ============================================================================
#  Imagen del backend (API) — Node 22 + Prisma + PostgreSQL
# ============================================================================
FROM node:22-slim

# OpenSSL es requerido por el motor de Prisma en Debian slim.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias (incluye dev: se necesitan prisma, tsx y tsc).
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar.
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

# Entrypoint: aplica migraciones, siembra (opcional) y arranca la API.
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/servidor.js"]
