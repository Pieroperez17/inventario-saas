/**
 * Tipos compartidos del subsistema de autenticación.
 */

/** Datos del usuario autenticado que viajan en el token y en `req.usuario`. */
export interface UsuarioAutenticado {
  id: string;
  empresaId: string;
  email: string;
  rol: string;
  nombres: string;
  apellidos: string;
}
