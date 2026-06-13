/**
 * Middlewares de autorización por rol y de aislamiento multiempresa.
 * Deben usarse siempre después de `verificarAutenticacion`.
 */
import { NextFunction, Request, Response } from 'express';
import { ErrorAplicacion } from '../utilidades/errores';

/** Permite el acceso solo a los roles indicados. */
export function verificarRol(...rolesPermitidos: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return next(ErrorAplicacion.noAutenticado());
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        ErrorAplicacion.prohibido(
          `No tienes permisos. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}.`,
        ),
      );
    }
    next();
  };
}

/**
 * Garantiza que la petición está asociada a una empresa (tenant). El
 * aislamiento real se aplica en la capa de servicios, donde TODA consulta se
 * filtra por `empresaId = req.usuario.empresaId`.
 */
export function aislarPorEmpresa(req: Request, _res: Response, next: NextFunction) {
  if (!req.usuario?.empresaId) {
    return next(ErrorAplicacion.noAutenticado('No se pudo determinar la empresa del usuario.'));
  }
  next();
}
