/**
 * Controlador de exportación a Excel. Cada endpoint construye los filtros y
 * delega en el servicio de exportación, luego envía el archivo como descarga.
 */
import { TipoMovimiento } from '@prisma/client';
import { manejarAsync } from '../utilidades/asincrono';
import { enviarExcel } from '../utilidades/excel';
import { obtenerParametrosListado } from '../utilidades/paginacion';
import { parseFechaConsulta } from '../utilidades/fechas';
import * as exportSrv from '../servicios/exportacionServicio';

function parseTipo(valor: unknown): TipoMovimiento | undefined {
  const s = valor ? String(valor).toUpperCase() : '';
  return s === 'ENTRADA' || s === 'SALIDA' || s === 'TRANSFERENCIA' ? (s as TipoMovimiento) : undefined;
}

export const productos = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const buffer = await exportSrv.exportarProductos(req.usuario!.empresaId, {
    ...params,
    categoriaId: req.query.categoriaId ? String(req.query.categoriaId) : undefined,
    activo: req.query.activo === undefined ? undefined : String(req.query.activo) === 'true',
  });
  enviarExcel(res, buffer, 'productos');
});

export const inventario = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const buffer = await exportSrv.exportarInventario(req.usuario!.empresaId, { ...params });
  enviarExcel(res, buffer, 'inventario');
});

export const movimientos = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const buffer = await exportSrv.exportarMovimientos(req.usuario!.empresaId, {
    ...params,
    tipo: parseTipo(req.query.tipo),
    productoId: req.query.productoId ? String(req.query.productoId) : undefined,
    ubicacionId: req.query.ubicacionId ? String(req.query.ubicacionId) : undefined,
    desde: parseFechaConsulta(req.query.desde),
    hasta: parseFechaConsulta(req.query.hasta, true),
  });
  enviarExcel(res, buffer, 'movimientos');
});

export const usuarios = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const buffer = await exportSrv.exportarUsuarios(req.usuario!.empresaId, {
    ...params,
    rol: req.query.rol ? String(req.query.rol) : undefined,
    activo: req.query.activo === undefined ? undefined : String(req.query.activo) === 'true',
  });
  enviarExcel(res, buffer, 'usuarios');
});

export const valorizado = manejarAsync(async (req, res) => {
  const buffer = await exportSrv.exportarValorizado(req.usuario!.empresaId);
  enviarExcel(res, buffer, 'inventario_valorizado');
});

export const kardex = manejarAsync(async (req, res) => {
  const buffer = await exportSrv.exportarKardex(
    req.usuario!.empresaId,
    req.params.productoId,
    parseFechaConsulta(req.query.desde),
    parseFechaConsulta(req.query.hasta, true),
  );
  enviarExcel(res, buffer, 'kardex');
});
