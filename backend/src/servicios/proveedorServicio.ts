/**
 * Lógica de negocio de proveedores y su asociación con productos.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { registrarAuditoria } from './auditoriaServicio';
import { ParametrosListado, construirOrden } from '../utilidades/paginacion';
import { EntradaCrearProveedor, EntradaActualizarProveedor } from '../validadores/proveedorValidador';

export async function listarProveedores(empresaId: string, params: ParametrosListado) {
  const where: Prisma.ProveedorWhereInput = { empresaId };
  if (params.buscar) {
    where.OR = [
      { razonSocial: { contains: params.buscar, mode: 'insensitive' } },
      { ruc: { contains: params.buscar, mode: 'insensitive' } },
      { contacto: { contains: params.buscar, mode: 'insensitive' } },
    ];
  }
  const orderBy = construirOrden(params.ordenarPor, params.orden, ['razonSocial', 'creadoEn'], 'razonSocial');

  const [datos, total] = await prisma.$transaction([
    prisma.proveedor.findMany({
      where,
      skip: params.saltar,
      take: params.limite,
      orderBy,
      include: { _count: { select: { productos: true } } },
    }),
    prisma.proveedor.count({ where }),
  ]);
  return { datos, total };
}

export async function obtenerProveedor(empresaId: string, id: string) {
  const proveedor = await prisma.proveedor.findFirst({
    where: { id, empresaId },
    include: { productos: { include: { producto: { select: { id: true, sku: true, nombre: true } } } } },
  });
  if (!proveedor) throw ErrorAplicacion.noEncontrado('Proveedor no encontrado.');
  return proveedor;
}

export async function crearProveedor(empresaId: string, datos: EntradaCrearProveedor, actorId: string) {
  const proveedor = await prisma.proveedor.create({
    data: { empresaId, ...datos, email: datos.email || null },
  });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'CREAR', entidad: 'Proveedor', entidadId: proveedor.id });
  return proveedor;
}

export async function actualizarProveedor(
  empresaId: string,
  id: string,
  datos: EntradaActualizarProveedor,
  actorId: string,
) {
  const actual = await prisma.proveedor.findFirst({ where: { id, empresaId } });
  if (!actual) throw ErrorAplicacion.noEncontrado('Proveedor no encontrado.');

  const proveedor = await prisma.proveedor.update({
    where: { id },
    data: { ...datos, ...(datos.email !== undefined ? { email: datos.email || null } : {}) },
  });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ACTUALIZAR', entidad: 'Proveedor', entidadId: id, detalles: datos });
  return proveedor;
}

export async function eliminarProveedor(empresaId: string, id: string, actorId: string) {
  const proveedor = await prisma.proveedor.findFirst({ where: { id, empresaId } });
  if (!proveedor) throw ErrorAplicacion.noEncontrado('Proveedor no encontrado.');
  await prisma.proveedor.delete({ where: { id } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ELIMINAR', entidad: 'Proveedor', entidadId: id });
}

/** Reemplaza el conjunto de productos asociados a un proveedor. */
export async function establecerProductos(
  empresaId: string,
  id: string,
  productoIds: string[],
  actorId: string,
) {
  const proveedor = await prisma.proveedor.findFirst({ where: { id, empresaId } });
  if (!proveedor) throw ErrorAplicacion.noEncontrado('Proveedor no encontrado.');

  // Solo productos válidos de la empresa.
  const validos = await prisma.producto.findMany({
    where: { id: { in: productoIds }, empresaId },
    select: { id: true },
  });
  const idsValidos = validos.map((p) => p.id);

  await prisma.$transaction([
    prisma.productoProveedor.deleteMany({ where: { proveedorId: id } }),
    prisma.productoProveedor.createMany({
      data: idsValidos.map((productoId) => ({ proveedorId: id, productoId })),
      skipDuplicates: true,
    }),
  ]);

  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ACTUALIZAR', entidad: 'Proveedor', entidadId: id, detalles: { productos: idsValidos.length } });
  return obtenerProveedor(empresaId, id);
}
