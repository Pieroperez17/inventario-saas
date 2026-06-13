/**
 * Middlewares de validación con Zod. Los errores de validación se delegan al
 * manejador central, que responde con 422 y el detalle por campo.
 */
import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

/** Valida y normaliza `req.body` con el esquema dado. */
export const validarCuerpo =
  (esquema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = esquema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

/** Valida `req.query` sin reasignarlo (Express expone query como solo lectura). */
export const validarConsulta =
  (esquema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      esquema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
