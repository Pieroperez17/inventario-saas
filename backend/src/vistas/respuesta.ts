/**
 * Capa de "vistas" de la API: da forma a las respuestas JSON de manera
 * consistente. Todas las respuestas comparten el envoltorio { exito, ... }.
 */
import { Response } from 'express';
import { MetaPaginacion } from '../utilidades/paginacion';

interface OpcionesExito {
  datos?: unknown;
  mensaje?: string;
  estado?: number;
  meta?: MetaPaginacion | Record<string, unknown>;
}

/** Respuesta exitosa estándar. */
export function responderExito(res: Response, opciones: OpcionesExito = {}): Response {
  const { datos = null, mensaje, estado = 200, meta } = opciones;
  return res.status(estado).json({
    exito: true,
    ...(mensaje ? { mensaje } : {}),
    datos,
    ...(meta ? { meta } : {}),
  });
}

/** Respuesta de error estándar. */
export function responderError(
  res: Response,
  estado: number,
  mensaje: string,
  codigo = 'ERROR',
  detalles?: unknown,
): Response {
  return res.status(estado).json({
    exito: false,
    error: {
      codigo,
      mensaje,
      ...(detalles ? { detalles } : {}),
    },
  });
}
