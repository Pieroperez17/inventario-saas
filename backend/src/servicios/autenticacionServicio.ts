/**
 * Lógica de negocio de autenticación: registro de empresa (con su admin),
 * inicio de sesión, rotación de refresh tokens y cambio de contraseña.
 */
import crypto from 'crypto';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { hashearPassword, compararPassword } from '../utilidades/passwords';
import {
  firmarAcceso,
  firmarRefresh,
  verificarRefresh,
  fechaExpiracion,
  PayloadToken,
} from '../utilidades/jwt';
import { ROLES } from '../config/constantes';
import { registrarAuditoria } from './auditoriaServicio';
import { EntradaRegistroEmpresa } from '../validadores/autenticacionValidador';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Emite un par access/refresh y persiste el hash del refresh para rotación. */
async function emitirTokens(payload: PayloadToken) {
  const accessToken = firmarAcceso(payload);
  const refreshToken = firmarRefresh(payload);
  await prisma.tokenRefresh.create({
    data: {
      usuarioId: payload.sub,
      tokenHash: hashToken(refreshToken),
      expiraEn: fechaExpiracion(refreshToken),
    },
  });
  return { accessToken, refreshToken };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function limpiarUsuario(usuario: any) {
  const { passwordHash, empresa, ...resto } = usuario;
  return resto;
}

export async function registrarEmpresa(datos: EntradaRegistroEmpresa) {
  const rucExiste = await prisma.empresa.findUnique({ where: { ruc: datos.empresa.ruc } });
  if (rucExiste) throw ErrorAplicacion.conflicto('Ya existe una empresa registrada con ese RUC.');

  const emailExiste = await prisma.usuario.findUnique({
    where: { email: datos.administrador.email },
  });
  if (emailExiste) throw ErrorAplicacion.conflicto('Ya existe un usuario con ese email.');

  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: ROLES.ADMINISTRADOR } });
  if (!rolAdmin) {
    throw new ErrorAplicacion(
      'El catálogo de roles no está inicializado. Ejecuta el seed o reinicia la API.',
      500,
      'SIN_CATALOGOS',
    );
  }

  const passwordHash = await hashearPassword(datos.administrador.password);

  const { empresa, usuario } = await prisma.$transaction(async (tx) => {
    const empresa = await tx.empresa.create({
      data: {
        razonSocial: datos.empresa.razonSocial,
        ruc: datos.empresa.ruc,
        direccion: datos.empresa.direccion,
        telefono: datos.empresa.telefono,
        email: datos.empresa.email,
        moneda: datos.empresa.moneda,
        zonaHoraria: datos.empresa.zonaHoraria,
      },
    });
    const usuario = await tx.usuario.create({
      data: {
        empresaId: empresa.id,
        nombres: datos.administrador.nombres,
        apellidos: datos.administrador.apellidos,
        email: datos.administrador.email,
        passwordHash,
        rolId: rolAdmin.id,
      },
      include: { rol: true },
    });
    return { empresa, usuario };
  });

  const tokens = await emitirTokens({
    sub: usuario.id,
    empresaId: usuario.empresaId,
    rol: usuario.rol.nombre,
    email: usuario.email,
  });

  await registrarAuditoria({
    empresaId: empresa.id,
    usuarioId: usuario.id,
    accion: 'REGISTRO_EMPRESA',
    entidad: 'Empresa',
    entidadId: empresa.id,
  });

  return { usuario: limpiarUsuario(usuario), empresa, tokens };
}

export async function iniciarSesion(email: string, password: string, ip?: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { rol: true, empresa: true },
  });

  if (!usuario || !usuario.activo) {
    throw ErrorAplicacion.noAutenticado('Credenciales inválidas.');
  }

  const passwordOk = await compararPassword(password, usuario.passwordHash);
  if (!passwordOk) {
    throw ErrorAplicacion.noAutenticado('Credenciales inválidas.');
  }

  const tokens = await emitirTokens({
    sub: usuario.id,
    empresaId: usuario.empresaId,
    rol: usuario.rol.nombre,
    email: usuario.email,
  });

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcceso: new Date() },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    accion: 'LOGIN',
    entidad: 'Usuario',
    entidadId: usuario.id,
    ip,
  });

  return { usuario: limpiarUsuario(usuario), empresa: usuario.empresa, tokens };
}

export async function refrescarToken(refreshToken: string) {
  let payload: PayloadToken;
  try {
    payload = verificarRefresh(refreshToken);
  } catch {
    throw ErrorAplicacion.noAutenticado('Refresh token inválido o expirado.');
  }

  const registro = await prisma.tokenRefresh.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  });
  if (!registro || registro.revocado || registro.expiraEn < new Date()) {
    throw ErrorAplicacion.noAutenticado('Sesión no válida. Inicia sesión nuevamente.');
  }

  // Rotación: se revoca el refresh usado y se emite uno nuevo.
  await prisma.tokenRefresh.update({ where: { id: registro.id }, data: { revocado: true } });

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.sub },
    include: { rol: true },
  });
  if (!usuario || !usuario.activo) {
    throw ErrorAplicacion.noAutenticado('La cuenta no está disponible.');
  }

  const tokens = await emitirTokens({
    sub: usuario.id,
    empresaId: usuario.empresaId,
    rol: usuario.rol.nombre,
    email: usuario.email,
  });

  return { tokens };
}

export async function cerrarSesion(refreshToken: string): Promise<void> {
  await prisma.tokenRefresh.updateMany({
    where: { tokenHash: hashToken(refreshToken) },
    data: { revocado: true },
  });
}

export async function obtenerPerfil(usuarioId: string) {
  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: usuarioId },
    include: {
      rol: { include: { permisos: { include: { permiso: true } } } },
      empresa: true,
    },
  });

  const permisos = usuario.rol.permisos.map((rp) => rp.permiso.codigo);
  const { passwordHash, empresa, rol, ...resto } = usuario;

  return {
    usuario: {
      ...resto,
      rol: { id: rol.id, nombre: rol.nombre, descripcion: rol.descripcion },
    },
    empresa,
    permisos,
  };
}

export async function cambiarContrasena(
  usuarioId: string,
  actual: string,
  nueva: string,
): Promise<void> {
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
  const ok = await compararPassword(actual, usuario.passwordHash);
  if (!ok) throw ErrorAplicacion.validacion('La contraseña actual no es correcta.');

  const passwordHash = await hashearPassword(nueva);
  await prisma.usuario.update({ where: { id: usuarioId }, data: { passwordHash } });

  // Por seguridad, se revocan todas las sesiones activas.
  await prisma.tokenRefresh.updateMany({ where: { usuarioId }, data: { revocado: true } });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId,
    accion: 'CAMBIO_CONTRASENA',
    entidad: 'Usuario',
    entidadId: usuarioId,
  });
}
