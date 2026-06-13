/**
 * Lógica de negocio de almacenes (depósitos). Aislado por empresa.
 */
import { Prisma, TipoUbicacion } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { registrarAuditoria } from './auditoriaServicio';
import { ParametrosListado, construirOrden } from '../utilidades/paginacion';
import { EntradaCrearUbicacion, EntradaActualizarUbicacion } from '../validadores/ubicacionValidador';

export async function listarAlmacenes(empresaId: string, params: ParametrosListado) {
  const where: Prisma.AlmacenWhereInput = { empresaId };
  if (params.buscar) {
    where.OR = [
      { nombre: { contains: params.buscar, mode: 'insensitive' } },
      { direccion: { contains: params.buscar, mode: 'insensitive' } },
      { responsable: { contains: params.buscar, mode: 'insensitive' } },
    ];
  }
  const orderBy = construirOrden(params.ordenarPor, params.orden, ['nombre', 'creadoEn'], 'nombre');

  const [datos, total] = await prisma.$transaction([
    prisma.almacen.findMany({ where, skip: params.saltar, take: params.limite, orderBy }),
    prisma.almacen.count({ where }),
  ]);
  return { datos, total };
}

export async function obtenerAlmacen(empresaId: string, id: string) {
  const almacen = await prisma.almacen.findFirst({ where: { id, empresaId } });
  if (!almacen) throw ErrorAplicacion.noEncontrado('Almacén no encontrado.');
  return almacen;
}

export async function crearAlmacen(empresaId: string, datos: EntradaCrearUbicacion, actorId: string) {
  const almacen = await prisma.almacen.create({ data: { empresaId, ...datos } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'CREAR', entidad: 'Almacen', entidadId: almacen.id });
  return almacen;
}

export async function actualizarAlmacen(
  empresaId: string,
  id: string,
  datos: EntradaActualizarUbicacion,
  actorId: string,
) {
  await obtenerAlmacen(empresaId, id);
  const almacen = await prisma.almacen.update({ where: { id }, data: datos });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ACTUALIZAR', entidad: 'Almacen', entidadId: id, detalles: datos });
  return almacen;
}

export async function eliminarAlmacen(empresaId: string, id: string, actorId: string) {
  await obtenerAlmacen(empresaId, id);
  const conStock = await prisma.inventario.count({
    where: { empresaId, ubicacionTipo: TipoUbicacion.ALMACEN, ubicacionId: id, cantidad: { gt: 0 } },
  });
  if (conStock > 0) {
    throw ErrorAplicacion.conflicto('No se puede eliminar: el almacén tiene inventario con stock.');
  }
  // Limpia registros de inventario en cero antes de borrar la ubicación.
  await prisma.inventario.deleteMany({ where: { empresaId, ubicacionTipo: TipoUbicacion.ALMACEN, ubicacionId: id } });
  await prisma.almacen.delete({ where: { id } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ELIMINAR', entidad: 'Almacen', entidadId: id });
}
