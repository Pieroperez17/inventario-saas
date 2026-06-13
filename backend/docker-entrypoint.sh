#!/bin/sh
# ============================================================================
#  Arranque del contenedor de la API.
#  1) Aplica las migraciones pendientes.
#  2) Ejecuta el seed si SEMBRAR_AL_INICIAR=true.
#  3) Lanza el comando recibido (por defecto, el servidor compilado).
# ============================================================================
set -e

echo "📦 Aplicando migraciones de la base de datos..."
npx prisma migrate deploy

if [ "${SEMBRAR_AL_INICIAR:-false}" = "true" ]; then
  echo "🌱 Sembrando datos demo..."
  npx ts-node --transpile-only prisma/seed.ts || echo "⚠ El seed no se completó (continuando de todos modos)."
fi

echo "🚀 Iniciando la API..."
exec "$@"
