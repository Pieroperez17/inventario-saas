/**
 * Lógica de negocio de tiendas (puntos de venta). Aislado por empresa.
 */
import { Prisma, TipoUbicacion } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { registrarAuditoria } from './auditoriaServicio';
import { ParametrosListado, construirOrden } from '../utilidades/paginacion';
import { EntradaCrearUbicacion, EntradaActualizarUbicacion } from '../validadores/ubicacionValidador';

export async function listarTiendas(empresaId: string, params: ParametrosListado) {
  const where: Prisma.TiendaWhereInput = { empresaId };
  if (params.buscar) {
    where.OR = [
      { nombre: { contains: params.buscar, mode: 'insensitive' } },
      { direccion: { contains: params.buscar, mode: 'insensitive' } },
      { responsable: { contains: params.buscar, mode: 'insensitive' } },
    ];
  }
  const orderBy = construirOrden(params.ordenarPor, params.orden, ['nombre', 'creadoEn'], 'nombre');

  const [datos, total] = await prisma.$transaction([
    prisma.tienda.findMany({ where, skip: params.saltar, take: params.limite, orderBy }),
    prisma.tienda.count({ where }),
  ]);
  return { datos, total };
}

export async function obtenerTienda(empresaId: string, id: string) {
  const tienda = await prisma.tienda.findFirst({ where: { id, empresaId } });
  if (!tienda) throw ErrorAplicacion.noEncontrado('Tienda no encontrada.');
  return tienda;
}

export async function crearTienda(empresaId: string, datos: EntradaCrearUbicacion, actorId: string) {
  const tienda = await prisma.tienda.create({ data: { empresaId, ...datos } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'CREAR', entidad: 'Tienda', entidadId: tienda.id });
  return tienda;
}

export async function actualizarTienda(
  empresaId: string,
  id: string,
  datos: EntradaActualizarUbicacion,
  actorId: string,
) {
  await obtenerTienda(empresaId, id);
  const tienda = await prisma.tienda.update({ where: { id }, data: datos });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ACTUALIZAR', entidad: 'Tienda', entidadId: id, detalles: datos });
  return tienda;
}

export async function eliminarTienda(empresaId: string, id: string, actorId: string) {
  await obtenerTienda(empresaId, id);
  const conStock = await prisma.inventario.count({
    where: { empresaId, ubicacionTipo: TipoUbicacion.TIENDA, ubicacionId: id, cantidad: { gt: 0 } },
  });
  if (conStock > 0) {
    throw ErrorAplicacion.conflicto('No se puede eliminar: la tienda tiene inventario con stock.');
  }
  await prisma.inventario.deleteMany({ where: { empresaId, ubicacionTipo: TipoUbicacion.TIENDA, ubicacionId: id } });
  await prisma.tienda.delete({ where: { id } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ELIMINAR', entidad: 'Tienda', entidadId: id });
}
