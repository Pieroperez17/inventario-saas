/**
 * Controlador de tiendas.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as servicio from '../servicios/tiendaServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await servicio.listarTiendas(req.usuario!.empresaId, params);
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const obtener = manejarAsync(async (req, res) => {
  responderExito(res, { datos: await servicio.obtenerTienda(req.usuario!.empresaId, req.params.id) });
});

export const crear = manejarAsync(async (req, res) => {
  const tienda = await servicio.crearTienda(req.usuario!.empresaId, req.body, req.usuario!.id);
  responderExito(res, { estado: 201, mensaje: 'Tienda creada.', datos: tienda });
});

export const actualizar = manejarAsync(async (req, res) => {
  const tienda = await servicio.actualizarTienda(req.usuario!.empresaId, req.params.id, req.body, req.usuario!.id);
  responderExito(res, { mensaje: 'Tienda actualizada.', datos: tienda });
});

export const eliminar = manejarAsync(async (req, res) => {
  await servicio.eliminarTienda(req.usuario!.empresaId, req.params.id, req.usuario!.id);
  responderExito(res, { mensaje: 'Tienda eliminada.' });
});
