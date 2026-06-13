/**
 * Lógica de negocio de productos. Aislado por empresa. Calcula stock total y
 * la bandera de "bajo stock mínimo" a partir del inventario por ubicación.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { registrarAuditoria } from './auditoriaServicio';
import { ParametrosListado, construirOrden } from '../utilidades/paginacion';
import { EntradaCrearProducto, EntradaActualizarProducto } from '../validadores/productoValidador';

interface FiltrosProducto extends ParametrosListado {
  categoriaId?: string;
  activo?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapearProducto(p: any) {
  const stockTotal = (p.inventario ?? []).reduce(
    (suma: number, inv: { cantidad: Prisma.Decimal }) => suma + Number(inv.cantidad),
    0,
  );
  const stockMinimo = Number(p.stockMinimo);
  const { inventario, ...resto } = p;
  return {
    ...resto,
    precioCompra: Number(p.precioCompra),
    precioVenta: Number(p.precioVenta),
    stockMinimo,
    stockTotal,
    bajoStock: stockTotal < stockMinimo,
  };
}

async function validarCategoria(empresaId: string, categoriaId?: string | null) {
  if (!categoriaId) return;
  const categoria = await prisma.categoria.findFirst({ where: { id: categoriaId, empresaId } });
  if (!categoria) throw ErrorAplicacion.validacion('La categoría indicada no existe.');
}

export async function listarProductos(empresaId: string, params: FiltrosProducto) {
  const where: Prisma.ProductoWhereInput = { empresaId };
  if (params.buscar) {
    where.OR = [
      { sku: { contains: params.buscar, mode: 'insensitive' } },
      { nombre: { contains: params.buscar, mode: 'insensitive' } },
    ];
  }
  if (params.categoriaId) where.categoriaId = params.categoriaId;
  if (params.activo !== undefined) where.activo = params.activo;

  const orderBy = construirOrden(
    params.ordenarPor,
    params.orden,
    ['sku', 'nombre', 'precioVenta', 'creadoEn'],
    'nombre',
  );

  const [registros, total] = await prisma.$transaction([
    prisma.producto.findMany({
      where,
      skip: params.saltar,
      take: params.limite,
      orderBy,
      include: {
        categoria: { select: { id: true, nombre: true } },
        inventario: { select: { cantidad: true } },
      },
    }),
    prisma.producto.count({ where }),
  ]);

  return { datos: registros.map(mapearProducto), total };
}

export async function obtenerProducto(empresaId: string, id: string) {
  const producto = await prisma.producto.findFirst({
    where: { id, empresaId },
    include: {
      categoria: { select: { id: true, nombre: true } },
      inventario: true,
      proveedores: { include: { proveedor: { select: { id: true, razonSocial: true } } } },
    },
  });
  if (!producto) throw ErrorAplicacion.noEncontrado('Producto no encontrado.');
  return mapearProducto(producto);
}

export async function crearProducto(empresaId: string, datos: EntradaCrearProducto, actorId: string) {
  const duplicado = await prisma.producto.findFirst({ where: { empresaId, sku: datos.sku } });
  if (duplicado) throw ErrorAplicacion.conflicto('Ya existe un producto con ese SKU.');
  await validarCategoria(empresaId, datos.categoriaId);

  const producto = await prisma.producto.create({
    data: {
      empresaId,
      sku: datos.sku,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoriaId: datos.categoriaId ?? null,
      unidadMedida: datos.unidadMedida,
      precioCompra: datos.precioCompra,
      precioVenta: datos.precioVenta,
      stockMinimo: datos.stockMinimo,
    },
    include: { categoria: { select: { id: true, nombre: true } }, inventario: { select: { cantidad: true } } },
  });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'CREAR', entidad: 'Producto', entidadId: producto.id });
  return mapearProducto(producto);
}

export async function actualizarProducto(
  empresaId: string,
  id: string,
  datos: EntradaActualizarProducto,
  actorId: string,
) {
  const actual = await prisma.producto.findFirst({ where: { id, empresaId } });
  if (!actual) throw ErrorAplicacion.noEncontrado('Producto no encontrado.');

  if (datos.sku && datos.sku !== actual.sku) {
    const duplicado = await prisma.producto.findFirst({ where: { empresaId, sku: datos.sku } });
    if (duplicado) throw ErrorAplicacion.conflicto('Ya existe un producto con ese SKU.');
  }
  if (datos.categoriaId !== undefined) await validarCategoria(empresaId, datos.categoriaId);

  const producto = await prisma.producto.update({
    where: { id },
    data: datos,
    include: { categoria: { select: { id: true, nombre: true } }, inventario: { select: { cantidad: true } } },
  });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ACTUALIZAR', entidad: 'Producto', entidadId: id, detalles: datos });
  return mapearProducto(producto);
}

export async function eliminarProducto(empresaId: string, id: string, actorId: string) {
  const producto = await prisma.producto.findFirst({ where: { id, empresaId } });
  if (!producto) throw ErrorAplicacion.noEncontrado('Producto no encontrado.');

  const conStock = await prisma.inventario.count({ where: { productoId: id, cantidad: { gt: 0 } } });
  if (conStock > 0) {
    throw ErrorAplicacion.conflicto('No se puede eliminar: el producto tiene stock. Ajusta el stock a cero o desactívalo.');
  }
  const conMovimientos = await prisma.movimientoInventario.count({ where: { productoId: id } });
  if (conMovimientos > 0) {
    throw ErrorAplicacion.conflicto('El producto tiene movimientos registrados; desactívalo en lugar de eliminarlo.');
  }

  await prisma.inventario.deleteMany({ where: { productoId: id } });
  await prisma.producto.delete({ where: { id } });
  await registrarAuditoria({ empresaId, usuarioId: actorId, accion: 'ELIMINAR', entidad: 'Producto', entidadId: id });
}
