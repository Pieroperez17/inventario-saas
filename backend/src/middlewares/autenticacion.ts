/**
 * Middleware de autenticación: valida el access token (Bearer), confirma que
 * el usuario sigue activo e inyecta `req.usuario` para el resto de la cadena.
 */
import { verificarAcceso } from '../utilidades/jwt';
import { ErrorAplicacion } from '../utilidades/errores';
import { manejarAsync } from '../utilidades/asincrono';
import { prisma } from '../config/baseDatos';

export const verificarAutenticacion = manejarAsync(async (req, _res, next) => {
  const cabecera = req.headers.authorization;
  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    throw ErrorAplicacion.noAutenticado('Falta el token de acceso.');
  }

  const token = cabecera.slice(7).trim();
  let payload;
  try {
    payload = verificarAcceso(token);
  } catch {
    throw ErrorAplicacion.noAutenticado('Token inválido o expirado.');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.sub },
    include: { rol: true },
  });

  if (!usuario || !usuario.activo) {
    throw ErrorAplicacion.noAutenticado('La cuenta no existe o está inactiva.');
  }

  req.usuario = {
    id: usuario.id,
    empresaId: usuario.empresaId,
    email: usuario.email,
    rol: usuario.rol.nombre,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
  };

  next();
});
