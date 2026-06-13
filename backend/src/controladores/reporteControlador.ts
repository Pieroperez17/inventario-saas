/**
 * Controlador de reportes: inventario valorizado, kardex y movimientos por rango.
 */
import { TipoMovimiento } from '@prisma/client';
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { parseFechaConsulta } from '../utilidades/fechas';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as reporteSrv from '../servicios/reporteServicio';
import * as movimientoSrv from '../servicios/movimientoServicio';

function parseTipo(valor: unknown): TipoMovimiento | undefined {
  const s = valor ? String(valor).toUpperCase() : '';
  return s === 'ENTRADA' || s === 'SALIDA' || s === 'TRANSFERENCIA' ? (s as TipoMovimiento) : undefined;
}

export const valorizado = manejarAsync(async (req, res) => {
  const datos = await reporteSrv.inventarioValorizado(req.usuario!.empresaId);
  responderExito(res, { datos });
});

export const kardex = manejarAsync(async (req, res) => {
  const datos = await reporteSrv.kardexProducto(
    req.usuario!.empresaId,
    req.params.productoId,
    parseFechaConsulta(req.query.desde),
    parseFechaConsulta(req.query.hasta, true),
  );
  responderExito(res, { datos });
});

export const movimientosPorRango = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await movimientoSrv.listarMovimientos(req.usuario!.empresaId, {
    ...params,
    tipo: parseTipo(req.query.tipo),
    desde: parseFechaConsulta(req.query.desde),
    hasta: parseFechaConsulta(req.query.hasta, true),
  });
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});
