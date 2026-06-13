/**
 * Lógica de negocio de usuarios. Todas las consultas se aíslan por `empresaId`
 * (multitenancy). Nunca se devuelve el hash de la contraseña.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { hashearPassword } from '../utilidades/passwords';
import { ROLES } from '../config/constantes';
import { registrarAuditoria } from './auditoriaServicio';
import { notificarPorRoles } from './notificacionServicio';
import { ParametrosListado, construirOrden } from '../utilidades/paginacion';
import { EntradaCrearUsuario, EntradaActualizarUsuario } from '../validadores/usuarioValidador';

const SELECCION = {
  id: true,
  empresaId: true,
  nombres: true,
  apellidos: true,
  email: true,
  activo: true,
  ultimoAcceso: true,
  creadoEn: true,
  rol: { select: { id: true, nombre: true, descripcion: true } },
} satisfies Prisma.UsuarioSelect;

interface FiltrosUsuario extends ParametrosListado {
  rol?: string;
  activo?: boolean;
}

export async function listarUsuarios(empresaId: string, params: FiltrosUsuario) {
  const where: Prisma.UsuarioWhereInput = { empresaId };

  if (params.buscar) {
    where.OR = [
      { nombres: { contains: params.buscar, mode: 'insensitive' } },
      { apellidos: { contains: params.buscar, mode: 'insensitive' } },
      { email: { contains: params.buscar, mode: 'insensitive' } },
    ];
  }
  if (params.rol) where.rol = { nombre: params.rol };
  if (params.activo !== undefined) where.activo = params.activo;

  const orderBy = construirOrden(
    params.ordenarPor,
    params.orden,
    ['nombres', 'apellidos', 'email', 'creadoEn', 'ultimoAcceso'],
    'creadoEn',
  );

  const [datos, total] = await prisma.$transaction([
    prisma.usuario.findMany({
      where,
      select: SELECCION,
      skip: params.saltar,
      take: params.limite,
      orderBy,
    }),
    prisma.usuario.count({ where }),
  ]);

  return { datos, total };
}

export async function obtenerUsuario(empresaId: string, id: string) {
  const usuario = await prisma.usuario.findFirst({ where: { id, empresaId }, select: SELECCION });
  if (!usuario) throw ErrorAplicacion.noEncontrado('Usuario no encontrado.');
  return usuario;
}

async function obtenerRolPorNombre(nombre: string) {
  const rol = await prisma.rol.findUnique({ where: { nombre } });
  if (!rol) throw ErrorAplicacion.validacion('El rol indicado no existe.');
  return rol;
}

export async function crearUsuario(empresaId: string, datos: EntradaCrearUsuario, actorId: string) {
  const existe = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (existe) throw ErrorAplicacion.conflicto('Ya existe un usuario con ese email.');

  const rol = await obtenerRolPorNombre(datos.rol);
  const passwordHash = await hashearPassword(datos.password);

  const usuario = await prisma.usuario.create({
    data: {
      empresaId,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      email: datos.email,
      passwordHash,
      rolId: rol.id,
    },
    select: SELECCION,
  });

  await registrarAuditoria({
    empresaId,
    usuarioId: actorId,
    accion: 'CREAR',
    entidad: 'Usuario',
    entidadId: usuario.id,
  });

  await notificarPorRoles(
    empresaId,
    [ROLES.ADMINISTRADOR],
    {
      tipo: 'USUARIO',
      titulo: 'Nuevo usuario creado',
      mensaje: `Se creó el usuario ${usuario.nombres} ${usuario.apellidos} (${usuario.rol.nombre}).`,
    },
    actorId,
  );

  return usuario;
}

/** Verifica que no se quede la empresa sin administradores activos. */
async function asegurarAdministradorRestante(empresaId: string, usuarioId: string) {
  const adminsActivos = await prisma.usuario.count({
    where: { empresaId, activo: true, rol: { nombre: ROLES.ADMINISTRADOR } },
  });
  const esEsteAdmin = await prisma.usuario.findFirst({
    where: { id: usuarioId, empresaId, rol: { nombre: ROLES.ADMINISTRADOR } },
  });
  if (esEsteAdmin && adminsActivos <= 1) {
    throw ErrorAplicacion.conflicto('Debe existir al menos un administrador activo en la empresa.');
  }
}

export async function actualizarUsuario(
  empresaId: string,
  id: string,
  datos: EntradaActualizarUsuario,
  actorId: string,
) {
  const actual = await prisma.usuario.findFirst({ where: { id, empresaId } });
  if (!actual) throw ErrorAplicacion.noEncontrado('Usuario no encontrado.');

  if (id === actorId && datos.activo === false) {
    throw ErrorAplicacion.conflicto('No puedes desactivar tu propia cuenta.');
  }

  // Si se desactiva o se cambia el rol del último admin, se bloquea.
  const dejaDeSerAdmin = datos.rol && datos.rol !== ROLES.ADMINISTRADOR;
  if (dejaDeSerAdmin || datos.activo === false) {
    await asegurarAdministradorRestante(empresaId, id);
  }

  const data: Prisma.UsuarioUpdateInput = {};
  if (datos.nombres !== undefined) data.nombres = datos.nombres;
  if (datos.apellidos !== undefined) data.apellidos = datos.apellidos;
  if (datos.activo !== undefined) data.activo = datos.activo;
  if (datos.rol) {
    const rol = await obtenerRolPorNombre(datos.rol);
    data.rol = { connect: { id: rol.id } };
  }

  const usuario = await prisma.usuario.update({ where: { id }, data, select: SELECCION });

  await registrarAuditoria({
    empresaId,
    usuarioId: actorId,
    accion: 'ACTUALIZAR',
    entidad: 'Usuario',
    entidadId: id,
    detalles: datos,
  });

  return usuario;
}

export async function cambiarEstadoUsuario(
  empresaId: string,
  id: string,
  activo: boolean,
  actorId: string,
) {
  return actualizarUsuario(empresaId, id, { activo }, actorId);
}

export async function restablecerContrasena(
  empresaId: string,
  id: string,
  nueva: string,
  actorId: string,
) {
  const usuario = await prisma.usuario.findFirst({ where: { id, empresaId } });
  if (!usuario) throw ErrorAplicacion.noEncontrado('Usuario no encontrado.');

  const passwordHash = await hashearPassword(nueva);
  await prisma.usuario.update({ where: { id }, data: { passwordHash } });
  await prisma.tokenRefresh.updateMany({ where: { usuarioId: id }, data: { revocado: true } });

  await registrarAuditoria({
    empresaId,
    usuarioId: actorId,
    accion: 'RESTABLECER_CONTRASENA',
    entidad: 'Usuario',
    entidadId: id,
  });
}
