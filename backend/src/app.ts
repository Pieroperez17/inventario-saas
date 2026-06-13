/**
 * Construcción de la aplicación Express: middlewares de seguridad, parseo,
 * logging, rate limiting, montaje del enrutador y manejo de errores.
 */
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { entorno } from './config/entorno';
import { APP } from './config/constantes';
import { enrutadorPrincipal } from './rutas/indice';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/manejadorErrores';

export function crearApp(): Application {
  const app = express();

  // Seguridad y cabeceras
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: entorno.corsOrigenes,
      credentials: true,
    }),
  );

  // Parseo de cuerpo y cookies
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging de peticiones
  if (!entorno.esPrueba) {
    app.use(morgan(entorno.esProduccion ? 'combined' : 'dev'));
  }

  // Rate limiting básico sobre la API
  const limitador = rateLimit({
    windowMs: entorno.LIMITE_VENTANA_MINUTOS * 60 * 1000,
    max: entorno.LIMITE_PETICIONES,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      exito: false,
      error: {
        codigo: 'LIMITE_PETICIONES',
        mensaje: 'Demasiadas peticiones. Inténtalo de nuevo más tarde.',
      },
    },
  });
  app.use(APP.prefijoApi, limitador);

  // Enrutador principal de la API
  app.use(APP.prefijoApi, enrutadorPrincipal);

  // 404 y manejo central de errores (siempre al final)
  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
