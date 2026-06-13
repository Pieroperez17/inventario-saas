/**
 * Reportes: inventario valorizado, kardex por producto y movimientos por rango.
 */
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { crearResolvedorUbicaciones } from './inventarioServicio';

/** Inventario valorizado: stock total por producto y su valor a costo y venta. */
export async function inventarioValorizado(empresaId: string) {
  const productos = await prisma.producto.findMany({
    where: { empresaId, activo: true },
    include: { inventario: { select: { cantidad: true } }, categoria: { select: { nombre: true } } },
    orderBy: { nombre: 'asc' },
  });

  const filas = productos.map((p) => {
    const stockTotal = p.inventario.reduce((s, i) => s + Number(i.cantidad), 0);
    const precioCompra = Number(p.precioCompra);
    const precioVenta = Number(p.precioVenta);
    return {
      sku: p.sku,
      nombre: p.nombre,
      categoria: p.categoria?.nombre ?? 'Sin categoría',
      unidadMedida: p.unidadMedida,
      stockTotal,
      precioCompra,
      precioVenta,
      valorCompra: stockTotal * precioCompra,
      valorVenta: stockTotal * precioVenta,
    };
  });

  const totales = filas.reduce(
    (acc, f) => {
      acc.valorCompra += f.valorCompra;
      acc.valorVenta += f.valorVenta;
      acc.unidades += f.stockTotal;
      return acc;
    },
    { valorCompra: 0, valorVenta: 0, unidades: 0, items: filas.length },
  );

  return { filas, totales };
}

/** Kardex de un producto: movimientos cronológicos con saldo acumulado (total). */
export async function kardexProducto(
  empresaId: string,
  productoId: string,
  desde?: Date,
  hasta?: Date,
) {
  const producto = await prisma.producto.findFirst({
    where: { id: productoId, empresaId },
    select: { id: true, sku: true, nombre: true, unidadMedida: true },
  });
  if (!producto) throw ErrorAplicacion.noEncontrado('Producto no encontrado.');

  const fecha: { gte?: Date; lte?: Date } = {};
  if (desde) fecha.gte = desde;
  if (hasta) fecha.lte = hasta;

  const movimientos = await prisma.movimientoInventario.findMany({
    where: { empresaId, productoId, ...(desde || hasta ? { fecha } : {}) },
    orderBy: { fecha: 'asc' },
  });

  const resolver = await crearResolvedorUbicaciones(empresaId);
  let saldo = 0;
  const filas = movimientos.map((m) => {
    const cantidad = Number(m.cantidad);
    let entrada = 0;
    let salida = 0;
    if (m.tipo === 'ENTRADA') {
      entrada = cantidad;
      saldo += cantidad;
    } else if (m.tipo === 'SALIDA') {
      salida = cantidad;
      saldo -= cantidad;
    }
    // TRANSFERENCIA no altera el stock total (movimiento entre ubicaciones).
    return {
      fecha: m.fecha,
      tipo: m.tipo,
      motivo: m.motivo ?? '',
      origen: resolver(m.origenTipo, m.origenId),
      destino: resolver(m.destinoTipo, m.destinoId),
      entrada,
      salida,
      saldo,
    };
  });

  return { producto, filas };
}
