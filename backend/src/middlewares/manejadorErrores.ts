/**
 * Manejo centralizado de errores. Traduce errores de Zod, de Prisma y de la
 * aplicación a respuestas JSON con códigos HTTP coherentes.
 */
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ErrorAplicacion } from '../utilidades/errores';
import { responderError } from '../vistas/respuesta';
import { logger } from '../utilidades/logger';
import { entorno } from '../config/entorno';

/** Middleware para rutas inexistentes (404). */
export function rutaNoEncontrada(req: Request, res: Response): Response {
  return responderError(
    res,
    404,
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    'RUTA_NO_ENCONTRADA',
  );
}

/** Manejador central de errores (debe registrarse al final de la cadena). */
export function manejadorErrores(
  err: unknown,
  _req: Request,
  res: Response,
  // El cuarto parámetro es obligatorio para que Express lo trate como manejador de errores.
  _next: NextFunction,
): Response {
  // 1) Errores de validación de Zod
  if (err instanceof ZodError) {
    return responderError(
      res,
      422,
      'Los datos enviados no son válidos.',
      'VALIDACION',
      err.flatten().fieldErrors,
    );
  }

  // 2) Errores controlados de la aplicación
  if (err instanceof ErrorAplicacion) {
    return responderError(res, err.estado, err.message, err.codigo, err.detalles);
  }

  // 3) Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const objetivo = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'campo único';
      return responderError(
        res,
        409,
        `Ya existe un registro con ese valor (${objetivo}).`,
        'DUPLICADO',
      );
    }
    if (err.code === 'P2025') {
      return responderError(res, 404, 'El registro solicitado no existe.', 'NO_ENCONTRADO');
    }
    if (err.code === 'P2003') {
      return responderError(
        res,
        409,
        'No se puede completar la operación por una referencia relacionada.',
        'REFERENCIA',
      );
    }
  }

  // 4) Cualquier otro error: 500
  logger.error('Error no controlado:', err);
  const mensaje = err instanceof Error ? err.message : 'Error interno del servidor.';
  return responderError(
    res,
    500,
    entorno.esProduccion ? 'Error interno del servidor.' : mensaje,
    'ERROR_INTERNO',
    entorno.esProduccion || !(err instanceof Error) ? undefined : err.stack,
  );
}
