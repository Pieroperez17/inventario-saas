/**
 * Punto de entrada del servidor HTTP. Arranca Express, verifica la conexión a
 * la base de datos y gestiona el apagado ordenado ante señales del sistema.
 */
import http from 'http';
import { crearApp } from './app';
import { entorno } from './config/entorno';
import { conectarBaseDatos, desconectarBaseDatos, prisma } from './config/baseDatos';
import { logger } from './utilidades/logger';
import { APP } from './config/constantes';
import { inicializarCatalogos } from './servicios/catalogoServicio';

async function iniciar(): Promise<void> {
  const app = crearApp();
  const servidor = http.createServer(app);

  // Verificación de conexión a la BD (no impide el arranque, pero se registra).
  try {
    await conectarBaseDatos();
    logger.info('Conexión a la base de datos establecida.');
    // Garantiza que los catálogos (roles y permisos) existan siempre.
    await inicializarCatalogos(prisma);
    logger.info('Catálogos de roles y permisos inicializados.');
  } catch (error) {
    logger.error(
      'No se pudo conectar/inicializar la base de datos al arrancar (la API seguirá levantada).',
      error,
    );
  }

  servidor.listen(entorno.PORT, () => {
    logger.info(
      `🚀 ${APP.nombre} escuchando en http://localhost:${entorno.PORT}${APP.prefijoApi}`,
    );
    logger.info(`Entorno: ${entorno.NODE_ENV}`);
  });

  // Apagado ordenado
  const apagar = (senal: string) => {
    logger.info(`Señal ${senal} recibida. Cerrando servidor...`);
    servidor.close(() => {
      void desconectarBaseDatos().finally(() => process.exit(0));
    });
    // Salida forzada si no cierra en 10s
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => apagar('SIGINT'));
  process.on('SIGTERM', () => apagar('SIGTERM'));
}

iniciar().catch((error) => {
  logger.error('Fallo crítico al iniciar el servidor:', error);
  process.exit(1);
});
