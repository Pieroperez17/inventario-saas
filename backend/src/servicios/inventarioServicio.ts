/**
 * Lógica de negocio del inventario: vista por ubicación, vista consolidada por
 * producto y alertas de stock mínimo. Aislado por empresa.
 */
import { Prisma, TipoUbicacion } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ParametrosListado } from '../utilidades/paginacion';

interface FiltrosInventario extends ParametrosListado {
  ubicacionTipo?: TipoUbicacion;
  ubicacionId?: string;
  productoId?: string;
}

/** Devuelve una función para resolver el nombre de una ubicación polimórfica. */
export async function crearResolvedorUbicaciones(empresaId: string) {
  const [almacenes, tiendas] = await Promise.all([
    prisma.almacen.findMany({ where: { empresaId }, select: { id: true, nombre: true } }),
    prisma.tienda.findMany({ where: { empresaId }, select: { id: true, nombre: true } }),
  ]);
  const mapaAlmacen = new Map(almacenes.map((a) => [a.id, a.nombre]));
  const mapaTienda = new Map(tiendas.map((t) => [t.id, t.nombre]));
  return (tipo: TipoUbicacion | null, id: string | null): string => {
    if (!tipo || !id) return '—';
    const nombre = tipo === TipoUbicacion.ALMACEN ? mapaAlmacen.get(id) : mapaTienda.get(id);
    return nombre ?? 'Ubicación eliminada';
  };
}

/** Vista por ubicación: filas (producto, ubicación, cantidad). */
export async function listarInventario(empresaId: string, params: FiltrosInventario) {
  const where: Prisma.InventarioWhereInput = { empresaId };
  if (params.ubicacionTipo) where.ubicacionTipo = params.ubicacionTipo;
  if (params.ubicacionId) where.ubicacionId = params.ubicacionId;
  if (params.productoId) where.productoId = params.productoId;
  if (params.buscar) {
    where.producto = {
      OR: [
        { sku: { contains: params.buscar, mode: 'insensitive' } },
        { nombre: { contains: params.buscar, mode: 'insensitive' } },
      ],
    };
  }

  const orderBy: Prisma.InventarioOrderByWithRelationInput =
    params.ordenarPor === 'cantidad' ? { cantidad: params.orden } : { producto: { nombre: params.orden } };

  const [registros, total] = await prisma.$transaction([
    prisma.inventario.findMany({
      where,
      skip: params.saltar,
      take: params.limite,
      orderBy,
      include: {
        producto: {
          select: {
            id: true,
            sku: true,
            nombre: true,
            unidadMedida: true,
            stockMinimo: true,
            precioCompra: true,
            precioVenta: true,
          },
        },
      },
    }),
    prisma.inventario.count({ where }),
  ]);

  const resolver = await crearResolvedorUbicaciones(empresaId);
  const datos = registros.map((r) => {
    const cantidad = Number(r.cantidad);
    const stockMinimo = Number(r.producto.stockMinimo);
    return {
      id: r.id,
      productoId: r.productoId,
      producto: {
        id: r.producto.id,
        sku: r.producto.sku,
        nombre: r.producto.nombre,
        unidadMedida: r.producto.unidadMedida,
        stockMinimo,
        precioCompra: Number(r.producto.precioCompra),
        precioVenta: Number(r.producto.precioVenta),
      },
      ubicacionTipo: r.ubicacionTipo,
      ubicacionId: r.ubicacionId,
      ubicacionNombre: resolver(r.ubicacionTipo, r.ubicacionId),
      cantidad,
      bajoStock: cantidad < stockMinimo,
    };
  });

  return { datos, total };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resumirProducto(p: any) {
  const stockTotal = p.inventario.reduce(
    (s: number, i: { cantidad: Prisma.Decimal }) => s + Number(i.cantidad),
    0,
  );
  const stockMinimo = Number(p.stockMinimo);
  const precioCompra = Number(p.precioCompra);
  const precioVenta = Number(p.precioVenta);
  return {
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    categoria: p.categoria?.nombre ?? null,
    unidadMedida: p.unidadMedida,
    stockTotal,
    stockMinimo,
    bajoStock: stockTotal < stockMinimo,
    precioCompra,
    precioVenta,
    valorCompra: stockTotal * precioCompra,
    valorVenta: stockTotal * precioVenta,
  };
}

/** Vista consolidada: stock total por producto sumando todas las ubicaciones. */
export async function inventarioConsolidado(empresaId: string, params: FiltrosInventario) {
  const where: Prisma.ProductoWhereInput = { empresaId, activo: true };
  if (params.buscar) {
    where.OR = [
      { sku: { contains: params.buscar, mode: 'insensitive' } },
      { nombre: { contains: params.buscar, mode: 'insensitive' } },
    ];
  }

  const [productos, total] = await prisma.$transaction([
    prisma.producto.findMany({
      where,
      skip: params.saltar,
      take: params.limite,
      orderBy: { nombre: params.orden },
      include: {
        inventario: { select: { cantidad: true } },
        categoria: { select: { nombre: true } },
      },
    }),
    prisma.producto.count({ where }),
  ]);

  return { datos: productos.map(resumirProducto), total };
}

/** Productos cuyo stock total está por debajo del mínimo. */
export async function alertasStockMinimo(empresaId: string) {
  const productos = await prisma.producto.findMany({
    where: { empresaId, activo: true },
    include: { inventario: { select: { cantidad: true } }, categoria: { select: { nombre: true } } },
  });
  return productos.map(resumirProducto).filter((p) => p.bajoStock);
}
