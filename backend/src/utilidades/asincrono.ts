/**
 * Envoltorio para manejadores asíncronos de Express. Captura los errores de
 * promesas rechazadas y los reenvía al manejador central de errores.
 */
import { NextFunction, Request, RequestHandler, Response } from 'express';

export const manejarAsync =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
