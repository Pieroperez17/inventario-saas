/**
 * Controlador de movimientos de inventario.
 */
import { TipoMovimiento } from '@prisma/client';
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import { parseFechaConsulta } from '../utilidades/fechas';
import * as servicio from '../servicios/movimientoServicio';

function parseTipo(valor: unknown): TipoMovimiento | undefined {
  const s = valor ? String(valor).toUpperCase() : '';
  return s === 'ENTRADA' || s === 'SALIDA' || s === 'TRANSFERENCIA' ? (s as TipoMovimiento) : undefined;
}

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await servicio.listarMovimientos(req.usuario!.empresaId, {
    ...params,
    tipo: parseTipo(req.query.tipo),
    productoId: req.query.productoId ? String(req.query.productoId) : undefined,
    ubicacionId: req.query.ubicacionId ? String(req.query.ubicacionId) : undefined,
    desde: parseFechaConsulta(req.query.desde),
    hasta: parseFechaConsulta(req.query.hasta, true),
  });
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const registrar = manejarAsync(async (req, res) => {
  const movimiento = await servicio.registrarMovimiento(
    req.usuario!.empresaId,
    req.body,
    req.usuario!.id,
    req.ip,
  );
  responderExito(res, { estado: 201, mensaje: 'Movimiento registrado.', datos: movimiento });
});
