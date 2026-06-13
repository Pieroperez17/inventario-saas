/**
 * Métricas del dashboard: tarjetas de resumen, existencias por ubicación,
 * top de productos y movimientos recientes. Todo aislado por empresa.
 */
import { prisma } from '../config/baseDatos';
import { crearResolvedorUbicaciones } from './inventarioServicio';

export async function resumenDashboard(empresaId: string) {
  const [totalProductos, totalAlmacenes, totalTiendas, totalUsuarios, inventario, movimientos] =
    await Promise.all([
      prisma.producto.count({ where: { empresaId, activo: true } }),
      prisma.almacen.count({ where: { empresaId } }),
      prisma.tienda.count({ where: { empresaId } }),
      prisma.usuario.count({ where: { empresaId, activo: true } }),
      prisma.inventario.findMany({
        where: { empresaId },
        include: {
          producto: { select: { id: true, sku: true, nombre: true, precioCompra: true, stockMinimo: true } },
        },
      }),
      prisma.movimientoInventario.findMany({
        where: { empresaId },
        orderBy: { fecha: 'desc' },
        take: 5,
        include: { producto: { select: { sku: true, nombre: true } } },
      }),
    ]);

  let stockTotal = 0;
  let valorInventario = 0;
  const porProducto = new Map<string, { sku: string; nombre: string; stock: number; min: number }>();
  const porUbicacion = new Map<string, { tipo: string; nombre: string; cantidad: number }>();

  const resolver = await crearResolvedorUbicaciones(empresaId);

  for (const inv of inventario) {
    const cantidad = Number(inv.cantidad);
    stockTotal += cantidad;
    valorInventario += cantidad * Number(inv.producto.precioCompra);

    const acumProd = porProducto.get(inv.productoId) ?? {
      sku: inv.producto.sku,
      nombre: inv.producto.nombre,
      stock: 0,
      min: Number(inv.producto.stockMinimo),
    };
    acumProd.stock += cantidad;
    porProducto.set(inv.productoId, acumProd);

    const clave = `${inv.ubicacionTipo}:${inv.ubicacionId}`;
    const acumUbic = porUbicacion.get(clave) ?? {
      tipo: inv.ubicacionTipo,
      nombre: resolver(inv.ubicacionTipo, inv.ubicacionId),
      cantidad: 0,
    };
    acumUbic.cantidad += cantidad;
    porUbicacion.set(clave, acumUbic);
  }

  const productos = [...porProducto.values()];
  const productosBajoMinimo = productos.filter((p) => p.stock < p.min).length;
  const topProductos = productos
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map((p) => ({ sku: p.sku, nombre: p.nombre, stock: p.stock }));

  return {
    tarjetas: {
      totalProductos,
      stockTotal,
      valorInventario,
      productosBajoMinimo,
      totalAlmacenes,
      totalTiendas,
      totalUsuarios,
    },
    existenciasPorUbicacion: [...porUbicacion.values()],
    topProductos,
    movimientosRecientes: movimientos.map((m) => ({
      id: m.id,
      tipo: m.tipo,
      cantidad: Number(m.cantidad),
      fecha: m.fecha,
      producto: m.producto,
    })),
  };
}
