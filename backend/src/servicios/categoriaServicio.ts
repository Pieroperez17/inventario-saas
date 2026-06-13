/**
 * Lógica de negocio de categorías de productos. Aislado por empresa.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { registrarAuditoria } from './auditoriaServicio';
import { ParametrosListado, construirOrden } from '../utilidades/paginacion';
import { EntradaCrearCategoria, EntradaActualizarCategoria } from '../validadores/categoriaValidador';

export async function listarCategorias(empresaId: string, params: ParametrosListado) {
  const where: Prisma.CategoriaWhereInput = { empresaId };
  if (params.buscar) {
    where.nombre = { contains: params.buscar, mode: 'insensitive' };
  }
  const orderBy = construirOrden(params.ordenarPor, params.orden, ['nombre', 'creadoEn'], 'nombre');

  const [datos, total] = await prisma.$transaction([
    prisma.categoria.findMany({
      where,
      skip: params.saltar,
      take: params.limite,
      orderBy,
      include: { _count: { select: { productos: true } } },
    }),
    prisma.categoria.count({ where }),
  ]);
  return { datos, total };
}

export async function obtenerCategoria(empresaId: string, id: string) {
  const categoria = await prisma.categoria.findFirst({ where: { id, empresaId } });
  if (!categoria) throw ErrorAplicacion.noEncontrado('Categoría no encontrada.');
  return categoria;
}

export async function crearCategoria(empresaId: string, datos: EntradaCrearCategoria, actorId: string) {
  const categoria = await prisma.categoria.create({ data: { empresaId, ...datos } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'CREAR', entidad: 'Categoria', entidadId: categoria.id });
  return categoria;
}

export async function actualizarCategoria(
  empresaId: string,
  id: string,
  datos: EntradaActualizarCategoria,
  actorId: string,
) {
  await obtenerCategoria(empresaId, id);
  const categoria = await prisma.categoria.update({ where: { id }, data: datos });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ACTUALIZAR', entidad: 'Categoria', entidadId: id, detalles: datos });
  return categoria;
}

export async function eliminarCategoria(empresaId: string, id: string, actorId: string) {
  await obtenerCategoria(empresaId, id);
  // Los productos asociados quedan sin categoría (categoriaId = null por la FK).
  await prisma.categoria.delete({ where: { id } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ELIMINAR', entidad: 'Categoria', entidadId: id });
}
