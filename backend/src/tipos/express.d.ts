/**
 * Aumenta el tipo Request de Express para incluir el usuario autenticado,
 * inyectado por el middleware `verificarAutenticacion`.
 */
import { UsuarioAutenticado } from './autenticacion';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
