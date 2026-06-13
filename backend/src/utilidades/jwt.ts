/**
 * Firma y verificación de JSON Web Tokens (access y refresh).
 */
import jwt from 'jsonwebtoken';
import { entorno } from '../config/entorno';

export interface PayloadToken {
  /** Id del usuario (subject). */
  sub: string;
  empresaId: string;
  rol: string;
  email: string;
}

export function firmarAcceso(payload: PayloadToken): string {
  return jwt.sign(payload, entorno.JWT_ACCESO_SECRETO, {
    expiresIn: entorno.JWT_ACCESO_EXPIRA,
  } as jwt.SignOptions);
}

export function firmarRefresh(payload: PayloadToken): string {
  return jwt.sign(payload, entorno.JWT_REFRESH_SECRETO, {
    expiresIn: entorno.JWT_REFRESH_EXPIRA,
  } as jwt.SignOptions);
}

export function verificarAcceso(token: string): PayloadToken {
  return jwt.verify(token, entorno.JWT_ACCESO_SECRETO) as PayloadToken;
}

export function verificarRefresh(token: string): PayloadToken {
  return jwt.verify(token, entorno.JWT_REFRESH_SECRETO) as PayloadToken;
}

/** Fecha de expiración (claim `exp`) de un token ya firmado. */
export function fechaExpiracion(token: string): Date {
  const decodificado = jwt.decode(token) as { exp?: number } | null;
  if (!decodificado?.exp) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(decodificado.exp * 1000);
}
