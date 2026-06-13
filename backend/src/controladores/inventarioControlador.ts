/**
 * Controlador de inventario: vista por ubicación, consolidada y alertas.
 */
import { TipoUbicacion } from '@prisma/client';
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as servicio from '../servicios/inventarioServicio';

function parseUbicacionTipo(valor: unknown): TipoUbicacion | undefined {
  const s = valor ? String(valor).toUpperCase() : '';
  return s === 'ALMACEN' || s === 'TIENDA' ? (s as TipoUbicacion) : undefined;
}

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await servicio.listarInventario(req.usuario!.empresaId, {
    ...params,
    ubicacionTipo: parseUbicacionTipo(req.query.ubicacionTipo),
    ubicacionId: req.query.ubicacionId ? String(req.query.ubicacionId) : undefined,
    productoId: req.query.productoId ? String(req.query.productoId) : undefined,
  });
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const consolidado = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await servicio.inventarioConsolidado(req.usuario!.empresaId, params);
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const alertas = manejarAsync(async (req, res) => {
  const datos = await servicio.alertasStockMinimo(req.usuario!.empresaId);
  responderExito(res, { datos });
});
