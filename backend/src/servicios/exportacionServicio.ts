/**
 * Servicio de exportación a Excel. Reutiliza los servicios de listado (sin
 * paginar) y de reportes para construir los libros.
 */
import { prisma } from '../config/baseDatos';
import { generarExcel } from '../utilidades/excel';
import { formatearFechaHora } from '../utilidades/fechas';
import * as productoSrv from './productoServicio';
import * as inventarioSrv from './inventarioServicio';
import * as movimientoSrv from './movimientoServicio';
import * as usuarioSrv from './usuarioServicio';
import { inventarioValorizado, kardexProducto } from './reporteServicio';

const SIN_LIMITE = { limite: 100000, saltar: 0 };

async function infoEmpresa(empresaId: string) {
  return prisma.empresa.findUniqueOrThrow({
    where: { id: empresaId },
    select: { razonSocial: true, moneda: true },
  });
}

export async function exportarProductos(
  empresaId: string,
  filtros: Parameters<typeof productoSrv.listarProductos>[1],
) {
  const { razonSocial, moneda } = await infoEmpresa(empresaId);
  const { datos } = await productoSrv.listarProductos(empresaId, { ...filtros, ...SIN_LIMITE });
  return generarExcel({
    titulo: 'Listado de Productos',
    empresa: razonSocial,
    moneda,
    columnas: [
      { encabezado: 'SKU', clave: 'sku', ancho: 16 },
      { encabezado: 'Nombre', clave: 'nombre', ancho: 30 },
      { encabezado: 'Categoría', clave: 'categoria', ancho: 18 },
      { encabezado: 'Unidad', clave: 'unidad', ancho: 12 },
      { encabezado: 'Precio compra', clave: 'precioCompra', ancho: 16, formato: 'moneda' },
      { encabezado: 'Precio venta', clave: 'precioVenta', ancho: 16, formato: 'moneda' },
      { encabezado: 'Stock mínimo', clave: 'stockMinimo', ancho: 14, formato: 'numero' },
      { encabezado: 'Stock total', clave: 'stockTotal', ancho: 14, formato: 'numero' },
      { encabezado: 'Estado', clave: 'estado', ancho: 12 },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filas: datos.map((p: any) => ({
      sku: p.sku,
      nombre: p.nombre,
      categoria: p.categoria?.nombre ?? 'Sin categoría',
      unidad: p.unidadMedida,
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      stockMinimo: p.stockMinimo,
      stockTotal: p.stockTotal,
      estado: p.activo ? 'Activo' : 'Inactivo',
    })),
  });
}

export async function exportarInventario(
  empresaId: string,
  filtros: Parameters<typeof inventarioSrv.inventarioConsolidado>[1],
) {
  const { razonSocial, moneda } = await infoEmpresa(empresaId);
  const { datos } = await inventarioSrv.inventarioConsolidado(empresaId, { ...filtros, ...SIN_LIMITE });
  return generarExcel({
    titulo: 'Inventario consolidado',
    empresa: razonSocial,
    moneda,
    columnas: [
      { encabezado: 'SKU', clave: 'sku', ancho: 16 },
      { encabezado: 'Producto', clave: 'nombre', ancho: 30 },
      { encabezado: 'Categoría', clave: 'categoria', ancho: 18 },
      { encabezado: 'Stock total', clave: 'stockTotal', ancho: 14, formato: 'numero' },
      { encabezado: 'Stock mínimo', clave: 'stockMinimo', ancho: 14, formato: 'numero' },
      { encabezado: 'Bajo stock', clave: 'bajoStock', ancho: 12 },
      { encabezado: 'Valor a costo', clave: 'valorCompra', ancho: 16, formato: 'moneda' },
      { encabezado: 'Valor a venta', clave: 'valorVenta', ancho: 16, formato: 'moneda' },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filas: datos.map((p: any) => ({
      sku: p.sku,
      nombre: p.nombre,
      categoria: p.categoria ?? 'Sin categoría',
      stockTotal: p.stockTotal,
      stockMinimo: p.stockMinimo,
      bajoStock: p.bajoStock ? 'Sí' : 'No',
      valorCompra: p.valorCompra,
      valorVenta: p.valorVenta,
    })),
  });
}

export async function exportarMovimientos(
  empresaId: string,
  filtros: Parameters<typeof movimientoSrv.listarMovimientos>[1],
) {
  const { razonSocial, moneda } = await infoEmpresa(empresaId);
  const { datos } = await movimientoSrv.listarMovimientos(empresaId, { ...filtros, ...SIN_LIMITE });
  return generarExcel({
    titulo: 'Movimientos de inventario',
    empresa: razonSocial,
    moneda,
    columnas: [
      { encabezado: 'Fecha', clave: 'fecha', ancho: 18 },
      { encabezado: 'Tipo', clave: 'tipo', ancho: 14 },
      { encabezado: 'SKU', clave: 'sku', ancho: 16 },
      { encabezado: 'Producto', clave: 'producto', ancho: 28 },
      { encabezado: 'Cantidad', clave: 'cantidad', ancho: 12, formato: 'numero' },
      { encabezado: 'Origen', clave: 'origen', ancho: 20 },
      { encabezado: 'Destino', clave: 'destino', ancho: 20 },
      { encabezado: 'Usuario', clave: 'usuario', ancho: 22 },
      { encabezado: 'Proveedor', clave: 'proveedor', ancho: 22 },
      { encabezado: 'Motivo', clave: 'motivo', ancho: 26 },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filas: datos.map((m: any) => ({
      fecha: formatearFechaHora(m.fecha),
      tipo: m.tipo,
      sku: m.producto?.sku ?? '',
      producto: m.producto?.nombre ?? '',
      cantidad: m.cantidad,
      origen: m.origen?.nombre ?? '—',
      destino: m.destino?.nombre ?? '—',
      usuario: m.usuario ?? '',
      proveedor: m.proveedor ?? '',
      motivo: m.motivo ?? '',
    })),
  });
}

export async function exportarUsuarios(
  empresaId: string,
  filtros: Parameters<typeof usuarioSrv.listarUsuarios>[1],
) {
  const { razonSocial, moneda } = await infoEmpresa(empresaId);
  const { datos } = await usuarioSrv.listarUsuarios(empresaId, { ...filtros, ...SIN_LIMITE });
  return generarExcel({
    titulo: 'Usuarios',
    empresa: razonSocial,
    moneda,
    columnas: [
      { encabezado: 'Nombres', clave: 'nombres', ancho: 20 },
      { encabezado: 'Apellidos', clave: 'apellidos', ancho: 20 },
      { encabezado: 'Email', clave: 'email', ancho: 28 },
      { encabezado: 'Rol', clave: 'rol', ancho: 16 },
      { encabezado: 'Estado', clave: 'estado', ancho: 12 },
      { encabezado: 'Último acceso', clave: 'ultimoAcceso', ancho: 18 },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filas: datos.map((u: any) => ({
      nombres: u.nombres,
      apellidos: u.apellidos,
      email: u.email,
      rol: u.rol?.nombre ?? '',
      estado: u.activo ? 'Activo' : 'Inactivo',
      ultimoAcceso: u.ultimoAcceso ? formatearFechaHora(u.ultimoAcceso) : 'Nunca',
    })),
  });
}

export async function exportarValorizado(empresaId: string) {
  const { razonSocial, moneda } = await infoEmpresa(empresaId);
  const { filas, totales } = await inventarioValorizado(empresaId);
  return generarExcel({
    titulo: 'Inventario valorizado',
    empresa: razonSocial,
    moneda,
    columnas: [
      { encabezado: 'SKU', clave: 'sku', ancho: 16 },
      { encabezado: 'Producto', clave: 'nombre', ancho: 30 },
      { encabezado: 'Categoría', clave: 'categoria', ancho: 18 },
      { encabezado: 'Stock', clave: 'stockTotal', ancho: 12, formato: 'numero' },
      { encabezado: 'Precio compra', clave: 'precioCompra', ancho: 16, formato: 'moneda' },
      { encabezado: 'Valor a costo', clave: 'valorCompra', ancho: 16, formato: 'moneda' },
      { encabezado: 'Precio venta', clave: 'precioVenta', ancho: 16, formato: 'moneda' },
      { encabezado: 'Valor a venta', clave: 'valorVenta', ancho: 16, formato: 'moneda' },
    ],
    filas: [
      ...filas,
      {
        sku: '',
        nombre: 'TOTALES',
        categoria: '',
        stockTotal: totales.unidades,
        precioCompra: '',
        valorCompra: totales.valorCompra,
        precioVenta: '',
        valorVenta: totales.valorVenta,
      },
    ],
  });
}

export async function exportarKardex(
  empresaId: string,
  productoId: string,
  desde?: Date,
  hasta?: Date,
) {
  const { razonSocial, moneda } = await infoEmpresa(empresaId);
  const { producto, filas } = await kardexProducto(empresaId, productoId, desde, hasta);
  return generarExcel({
    titulo: `Kardex — ${producto.sku} · ${producto.nombre}`,
    empresa: razonSocial,
    moneda,
    columnas: [
      { encabezado: 'Fecha', clave: 'fecha', ancho: 18 },
      { encabezado: 'Tipo', clave: 'tipo', ancho: 14 },
      { encabezado: 'Motivo', clave: 'motivo', ancho: 24 },
      { encabezado: 'Origen', clave: 'origen', ancho: 20 },
      { encabezado: 'Destino', clave: 'destino', ancho: 20 },
      { encabezado: 'Entrada', clave: 'entrada', ancho: 12, formato: 'numero' },
      { encabezado: 'Salida', clave: 'salida', ancho: 12, formato: 'numero' },
      { encabezado: 'Saldo', clave: 'saldo', ancho: 12, formato: 'numero' },
    ],
    filas: filas.map((f) => ({ ...f, fecha: formatearFechaHora(f.fecha) })),
  });
}
